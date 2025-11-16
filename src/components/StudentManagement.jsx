import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiUserSettingsFill, RiToggleLine } from 'react-icons/ri';
import './StudentManagement.css';

const StudentManagement = () => {
  const { addStudent, getAllStudents, updateStudent, deleteStudent, toggleStudentStatus } = useAuth();
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    studentId: '',
    rollNumber: '',
    class: '',
    section: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    role: 'student'
  });

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await getAllStudents();
      if (result.success) {
        setStudents(result.students);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const studentData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
      };

      console.log('Sending student data:', studentData);

      let result;
      if (editingStudent) {
        // Update existing student
        result = await updateStudent(editingStudent._id, studentData);
      } else {
        // Add new student
        result = await addStudent(studentData);
      }

      console.log('API result:', result);

      if (result.success) {
        setSuccess(editingStudent ? 'Student updated successfully!' : 'Student added successfully!');
        resetForm();
        loadStudents(); // Reload the list
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      password: '', // Don't pre-fill password
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender,
      phone: student.phone || '',
      address: student.address || '',
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      role: student.role
    });
    setShowAddForm(true);
  };

  const handleDelete = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete student "${studentName}"?`)) {
      setLoading(true);
      try {
        const result = await deleteStudent(studentId);
        if (result.success) {
          setSuccess('Student deleted successfully!');
          loadStudents(); // Reload the list
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to delete student');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (studentId, studentName) => {
    setLoading(true);
    try {
      const result = await toggleStudentStatus(studentId);
      if (result.success) {
        setSuccess(`Student ${result.student.isActive ? 'activated' : 'deactivated'} successfully!`);
        loadStudents(); // Reload the list
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to toggle student status');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      studentId: '',
      rollNumber: '',
      class: '',
      section: '',
      dateOfBirth: '',
      gender: 'male',
      phone: '',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      role: 'student'
    });
    setEditingStudent(null);
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

  const formatBirthDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="student-management">
      <div className="student-header">
        <div className="header-left">
          <RiUserSettingsFill className="header-icon" />
          <h2>Student Management</h2>
        </div>
        <button 
          className="add-student-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <RiAddLine />
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showAddForm && (
        <div className="add-student-form">
          <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="studentId">Student ID *</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter student ID"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rollNumber">Roll Number *</label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter roll number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="class">Class *</label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 10th, 11th, 12th"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="section">Section *</label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., A, B, C"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows="3"
              />
            </div>

            <div className="form-section">
              <h4>Parent Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parentName">Parent Name *</label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter parent name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="parentPhone">Parent Phone *</label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter parent phone"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="parentEmail">Parent Email</label>
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  placeholder="Enter parent email"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="class_representative">Class Representative</option>
                  <option value="prefect">Prefect</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="password">{editingStudent ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingStudent}
                  placeholder={editingStudent ? "Enter new password" : "Enter password (min 6 characters)"}
                  minLength="6"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (editingStudent ? 'Updating...' : 'Adding...') : (editingStudent ? 'Update Student' : 'Add Student')}
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

      <div className="students-list">
        <h3>Current Students ({students.length})</h3>
        {loading && !showAddForm ? (
          <div className="loading">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="no-students">No students found</div>
        ) : (
          <div className="students-table">
            <div className="table-header">
              <div>Name</div>
              <div>Student ID</div>
              <div>Class/Section</div>
              <div>Email</div>
              <div>Parent Name</div>
              <div>Role</div>
              <div>Status</div>
              <div>Admission Date</div>
              <div>Actions</div>
            </div>
            {students.map((student) => (
              <div key={student._id} className="table-row">
                <div className="name">{student.name}</div>
                <div className="student-id">{student.studentId}</div>
                <div className="class-section">{student.class}/{student.section}</div>
                <div className="email">{student.email}</div>
                <div className="parent-name">{student.parentName}</div>
                <div className="role">
                  <span className={`role-badge ${student.role}`}>
                    {student.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="status">
                  <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="admission-date">{formatDate(student.admissionDate)}</div>
                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(student)}
                    disabled={loading}
                    title="Edit Student"
                  >
                    <RiEditLine />
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleStatus(student._id, student.name)}
                    disabled={loading}
                    title={student.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <RiToggleLine />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(student._id, student.name)}
                    disabled={loading}
                    title="Delete Student"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
