import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiUserSettingsFill, RiToggleLine } from 'react-icons/ri';
import './TeacherManagement.css';

const TeacherManagement = () => {
  const { addTeacher, getAllTeachers, updateTeacher, deleteTeacher, toggleTeacherStatus } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    employeeId: '',
    department: '',
    subjects: '',
    phone: '',
    address: '',
    role: 'teacher'
  });

  // Load teachers on component mount
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const result = await getAllTeachers();
      if (result.success) {
        setTeachers(result.teachers);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load teachers');
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
      const teacherData = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean)
      };

      console.log('Sending teacher data:', teacherData);

      let result;
      if (editingTeacher) {
        // Update existing teacher
        result = await updateTeacher(editingTeacher._id, teacherData);
      } else {
        // Add new teacher
        result = await addTeacher(teacherData);
      }

      console.log('API result:', result);

      if (result.success) {
        setSuccess(editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!');
        resetForm();
        loadTeachers(); // Reload the list
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      password: '', // Don't pre-fill password
      name: teacher.name,
      email: teacher.email,
      employeeId: teacher.employeeId,
      department: teacher.department,
      subjects: teacher.subjects.join(', '),
      phone: teacher.phone || '',
      address: teacher.address || '',
      role: teacher.role
    });
    setShowAddForm(true);
  };

  const handleDelete = async (teacherId, teacherName) => {
    if (window.confirm(`Are you sure you want to delete teacher "${teacherName}"?`)) {
      setLoading(true);
      try {
        const result = await deleteTeacher(teacherId);
        if (result.success) {
          setSuccess('Teacher deleted successfully!');
          loadTeachers(); // Reload the list
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to delete teacher');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (teacherId, teacherName) => {
    setLoading(true);
    try {
      const result = await toggleTeacherStatus(teacherId);
      if (result.success) {
        setSuccess(`Teacher ${result.teacher.isActive ? 'activated' : 'deactivated'} successfully!`);
        loadTeachers(); // Reload the list
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to toggle teacher status');
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
      employeeId: '',
      department: '',
      subjects: '',
      phone: '',
      address: '',
      role: 'teacher'
    });
    setEditingTeacher(null);
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

  return (
    <div className="teacher-management">
      <div className="teacher-header">
        <div className="header-left">
          <RiUserSettingsFill className="header-icon" />
          <h2>Teacher Management</h2>
        </div>
        <button 
          className="add-teacher-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <RiAddLine />
          {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showAddForm && (
        <div className="add-teacher-form">
          <h3>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
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
                <label htmlFor="employeeId">Employee ID *</label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter employee ID"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter department"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="teacher">Teacher</option>
                  <option value="head_teacher">Head Teacher</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subjects">Subjects (comma-separated)</label>
              <input
                type="text"
                id="subjects"
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics, Physics, Chemistry"
              />
            </div>

            <div className="form-row">
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
              <div className="form-group">
                <label htmlFor="password">{editingTeacher ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingTeacher}
                  placeholder={editingTeacher ? "Enter new password" : "Enter password (min 6 characters)"}
                  minLength="6"
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

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (editingTeacher ? 'Updating...' : 'Adding...') : (editingTeacher ? 'Update Teacher' : 'Add Teacher')}
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

      <div className="teachers-list">
        <h3>Current Teachers ({teachers.length})</h3>
        {loading && !showAddForm ? (
          <div className="loading">Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div className="no-teachers">No teachers found</div>
        ) : (
          <div className="teachers-table">
            <div className="table-header">
              <div>Name</div>
              <div>Username</div>
              <div>Email</div>
              <div>Employee ID</div>
              <div>Department</div>
              <div>Role</div>
              <div>Status</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            {teachers.map((teacher) => (
              <div key={teacher._id} className="table-row">
                <div className="name">{teacher.name}</div>
                <div className="username">{teacher.username}</div>
                <div className="email">{teacher.email}</div>
                <div className="employee-id">{teacher.employeeId}</div>
                <div className="department">{teacher.department}</div>
                <div className="role">
                  <span className={`role-badge ${teacher.role}`}>
                    {teacher.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="status">
                  <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="created">{formatDate(teacher.createdAt)}</div>
                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(teacher)}
                    disabled={loading}
                    title="Edit Teacher"
                  >
                    <RiEditLine />
                  </button>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleStatus(teacher._id, teacher.name)}
                    disabled={loading}
                    title={teacher.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <RiToggleLine />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(teacher._id, teacher.name)}
                    disabled={loading}
                    title="Delete Teacher"
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

export default TeacherManagement;
