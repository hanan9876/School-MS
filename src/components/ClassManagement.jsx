import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiBookOpenFill, RiToggleLine, RiUserAddLine, RiUserUnfollowLine } from 'react-icons/ri';
import './ClassManagement.css';

const ClassManagement = () => {
  const { 
    addClass, 
    getAllClasses, 
    updateClass, 
    deleteClass, 
    toggleClassStatus,
    assignStudentToClass,
    removeStudentFromClass,
    getAvailableTeachers,
    getAllStudents
  } = useAuth();
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    description: '',
    assignedTeacher: '',
    subjects: '',
    maxStudents: 30,
    roomNumber: '',
    academicYear: new Date().getFullYear().toString(),
    semester: '1st',
    schedule: {
      days: [],
      startTime: '',
      endTime: ''
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadStudents();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const result = await getAllClasses();
      if (result.success) {
        setClasses(result.classes);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const result = await getAvailableTeachers();
      if (result.success) {
        setTeachers(result.teachers);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const result = await getAllStudents();
      if (result.success) {
        setStudents(result.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: checked 
          ? [...prev.schedule.days, value]
          : prev.schedule.days.filter(day => day !== value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const classData = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean)
      };

      let result;
      if (editingClass) {
        result = await updateClass(editingClass._id, classData);
      } else {
        result = await addClass(classData);
      }

      if (result.success) {
        setSuccess(editingClass ? 'Class updated successfully!' : 'Class created successfully!');
        resetForm();
        loadClasses();
        loadTeachers(); // Refresh teachers to update assigned classes
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      className: classItem.className,
      classCode: classItem.classCode,
      description: classItem.description || '',
      assignedTeacher: classItem.assignedTeacher._id,
      subjects: classItem.subjects.join(', '),
      maxStudents: classItem.maxStudents,
      roomNumber: classItem.roomNumber || '',
      academicYear: classItem.academicYear,
      semester: classItem.semester,
      schedule: {
        days: classItem.schedule?.days || [],
        startTime: classItem.schedule?.startTime || '',
        endTime: classItem.schedule?.endTime || ''
      }
    });
    setShowAddForm(true);
  };

  const handleDelete = async (classId, className) => {
    if (window.confirm(`Are you sure you want to delete class "${className}"?`)) {
      setLoading(true);
      try {
        const result = await deleteClass(classId);
        if (result.success) {
          setSuccess('Class deleted successfully!');
          loadClasses();
          loadTeachers();
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to delete class');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (classId, className) => {
    setLoading(true);
    try {
      const result = await toggleClassStatus(classId);
      if (result.success) {
        setSuccess(`Class ${result.class.isActive ? 'activated' : 'deactivated'} successfully!`);
        loadClasses();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to toggle class status');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (classId, studentId) => {
    setLoading(true);
    try {
      const result = await assignStudentToClass(classId, studentId);
      if (result.success) {
        setSuccess('Student assigned to class successfully!');
        loadClasses();
        loadStudents();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to assign student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    setLoading(true);
    try {
      const result = await removeStudentFromClass(classId, studentId);
      if (result.success) {
        setSuccess('Student removed from class successfully!');
        loadClasses();
        loadStudents();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      classCode: '',
      description: '',
      assignedTeacher: '',
      subjects: '',
      maxStudents: 30,
      roomNumber: '',
      academicYear: new Date().getFullYear().toString(),
      semester: '1st',
      schedule: {
        days: [],
        startTime: '',
        endTime: ''
      }
    });
    setEditingClass(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableStudents = (classId) => {
    return students.filter(student => !student.assignedClass || student.assignedClass === classId);
  };

  const getClassStudents = (classId) => {
    return students.filter(student => student.assignedClass === classId);
  };

  return (
    <div className="class-management">
      <div className="class-header">
        <div className="header-left">
          <RiBookOpenFill className="header-icon" />
          <h2>Class Management</h2>
        </div>
        <button 
          className="add-class-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <RiAddLine />
          {editingClass ? 'Edit Class' : 'Add New Class'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showAddForm && (
        <div className="add-class-form">
          <h3>{editingClass ? 'Edit Class' : 'Add New Class'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="className">Class Name *</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Mathematics 101"
                />
              </div>
              <div className="form-group">
                <label htmlFor="classCode">Class Code *</label>
                <input
                  type="text"
                  id="classCode"
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., MATH101"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="assignedTeacher">Assigned Teacher *</label>
                <select
                  id="assignedTeacher"
                  name="assignedTeacher"
                  value={formData.assignedTeacher}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.employeeId}) - {teacher.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="roomNumber">Room Number</label>
                <input
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 201"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="academicYear">Academic Year *</label>
                <input
                  type="text"
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2024"
                />
              </div>
              <div className="form-group">
                <label htmlFor="semester">Semester *</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="3rd">3rd Semester</option>
                  <option value="4th">4th Semester</option>
                  <option value="5th">5th Semester</option>
                  <option value="6th">6th Semester</option>
                  <option value="7th">7th Semester</option>
                  <option value="8th">8th Semester</option>
                  <option value="9th">9th Semester</option>
                  <option value="10th">10th Semester</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subjects">Subjects (comma-separated)</label>
                <input
                  type="text"
                  id="subjects"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Algebra, Calculus"
                />
              </div>
              <div className="form-group">
                <label htmlFor="maxStudents">Max Students</label>
                <input
                  type="number"
                  id="maxStudents"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Class description"
                rows="3"
              />
            </div>

            <div className="form-section">
              <h4>Schedule</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Days</label>
                  <div className="checkbox-group">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={day}
                          checked={formData.schedule.days.includes(day)}
                          onChange={handleCheckboxChange}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="schedule.startTime"
                    value={formData.schedule.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    name="schedule.endTime"
                    value={formData.schedule.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (editingClass ? 'Updating...' : 'Adding...') : (editingClass ? 'Update Class' : 'Add Class')}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="classes-list">
        <h3>Current Classes ({classes.length})</h3>
        {loading && !showAddForm ? (
          <div className="loading">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="no-classes">No classes found</div>
        ) : (
          <div className="classes-table">
            <div className="table-header">
              <div>Class Name</div>
              <div>Code</div>
              <div>Teacher</div>
              <div>Students</div>
              <div>Room</div>
              <div>Academic Year</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {classes.map((classItem) => (
              <div key={classItem._id} className="table-row">
                <div className="class-name">
                  <strong>{classItem.className}</strong>
                  {classItem.description && (
                    <div className="class-description">{classItem.description}</div>
                  )}
                </div>
                <div className="class-code">{classItem.classCode}</div>
                <div className="teacher">
                  <div className="teacher-name">{classItem.assignedTeacher?.name}</div>
                  <div className="teacher-dept">{classItem.assignedTeacher?.department}</div>
                </div>
                <div className="students">
                  <div className="student-count">
                    {classItem.currentStudents || 0} / {classItem.maxStudents}
                  </div>
                  <button
                    className="manage-students-btn"
                    onClick={() => {
                      setSelectedClass(classItem);
                      setShowStudentModal(true);
                    }}
                    title="Manage Students"
                  >
                    <RiUserAddLine />
                  </button>
                </div>
                <div className="room">{classItem.roomNumber || '-'}</div>
                <div className="academic-year">
                  {classItem.academicYear} - {classItem.semester}
                </div>
                <div className="status">
                  <span className={`status-badge ${classItem.isActive ? 'active' : 'inactive'}`}>
                    {classItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(classItem)}
                    disabled={loading}
                    title="Edit Class"
                  >
                    <RiEditLine />
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleStatus(classItem._id, classItem.className)}
                    disabled={loading}
                    title={classItem.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <RiToggleLine />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(classItem._id, classItem.className)}
                    disabled={loading}
                    title="Delete Class"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Management Modal */}
      {showStudentModal && selectedClass && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Manage Students - {selectedClass.className}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowStudentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="student-sections">
                <div className="assigned-students">
                  <h4>Assigned Students ({getClassStudents(selectedClass._id).length})</h4>
                  {getClassStudents(selectedClass._id).length === 0 ? (
                    <p className="no-students">No students assigned to this class</p>
                  ) : (
                    <div className="student-list">
                      {getClassStudents(selectedClass._id).map(student => (
                        <div key={student._id} className="student-item">
                          <div className="student-info">
                            <strong>{student.name}</strong>
                            <span>{student.studentId} - {student.class}/{student.section}</span>
                          </div>
                          <button
                            className="remove-student-btn"
                            onClick={() => handleRemoveStudent(selectedClass._id, student._id)}
                            disabled={loading}
                          >
                            <RiUserUnfollowLine />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="available-students">
                  <h4>Available Students ({getAvailableStudents(selectedClass._id).length})</h4>
                  {getAvailableStudents(selectedClass._id).length === 0 ? (
                    <p className="no-students">No available students</p>
                  ) : (
                    <div className="student-list">
                      {getAvailableStudents(selectedClass._id).map(student => (
                        <div key={student._id} className="student-item">
                          <div className="student-info">
                            <strong>{student.name}</strong>
                            <span>{student.studentId} - {student.class}/{student.section}</span>
                          </div>
                          <button
                            className="assign-student-btn"
                            onClick={() => handleAssignStudent(selectedClass._id, student._id)}
                            disabled={loading || (selectedClass.currentStudents >= selectedClass.maxStudents)}
                            title={selectedClass.currentStudents >= selectedClass.maxStudents ? 'Class is full' : 'Assign to class'}
                          >
                            <RiUserAddLine />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

