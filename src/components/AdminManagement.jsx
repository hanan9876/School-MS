import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RiAddLine, RiDeleteBin6Line, RiUserSettingsFill } from 'react-icons/ri';
import './AdminManagement.css';

const AdminManagement = () => {
  const { addAdmin, getAllAdmins, deleteAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'admin'
  });

  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const result = await getAllAdmins();
      if (result.success) {
        setAdmins(result.admins);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load admins');
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await addAdmin(formData);
      if (result.success) {
        setSuccess('Admin added successfully!');
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          role: 'admin'
        });
        setShowAddForm(false);
        loadAdmins(); // Reload the list
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId, adminName) => {
    if (window.confirm(`Are you sure you want to delete admin "${adminName}"?`)) {
      setLoading(true);
      try {
        const result = await deleteAdmin(adminId);
        if (result.success) {
          setSuccess('Admin deleted successfully!');
          loadAdmins(); // Reload the list
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to delete admin');
      } finally {
        setLoading(false);
      }
    }
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
    <div className="admin-management">
      <div className="admin-header">
        <div className="header-left">
          <RiUserSettingsFill className="header-icon" />
          <h2>Admin Management</h2>
        </div>
        <button 
          className="add-admin-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <RiAddLine />
          Add New Admin
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showAddForm && (
        <div className="add-admin-form">
          <h3>Add New Admin</h3>
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
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password (min 6 characters)"
                minLength="6"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Admin'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admins-list">
        <h3>Current Admins ({admins.length})</h3>
        {loading && !showAddForm ? (
          <div className="loading">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="no-admins">No admins found</div>
        ) : (
          <div className="admins-table">
            <div className="table-header">
              <div>Username</div>
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Created</div>
              <div>Last Login</div>
              <div>Actions</div>
            </div>
            {admins.map((admin) => (
              <div key={admin._id} className="table-row">
                <div className="username">{admin.username}</div>
                <div className="name">{admin.name}</div>
                <div className="email">{admin.email}</div>
                <div className="role">
                  <span className={`role-badge ${admin.role}`}>
                    {admin.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="created">{formatDate(admin.createdAt)}</div>
                <div className="last-login">
                  {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                </div>
                <div className="actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(admin._id, admin.name)}
                    disabled={loading}
                    title="Delete Admin"
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

export default AdminManagement;
