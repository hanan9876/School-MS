import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  RiAdminFill,
  RiUserSettingsFill,
  RiBookOpenFill,
  RiGraduationCapFill,
  RiBarChartFill,
  RiSettingsFill,
} from 'react-icons/ri';
import AdminManagement from './AdminManagement';
import TeacherManagement from './TeacherManagement';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logout, getAllTeachers, getAllStudents } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // States
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [teacherResult, studentResult] = await Promise.all([
        getAllTeachers(),
        getAllStudents(),
      ]);

      if (teacherResult.success) {
        setTeachers(teacherResult.teachers || []);
      } else {
        setError((prev) => prev + '\n' + (teacherResult.error || 'Error loading teachers'));
      }

      if (studentResult.success) {
        setStudents(studentResult.students || []);
      } else {
        setError((prev) => prev + '\n' + (studentResult.error || 'Error loading students'));
      }
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardItems = [
    { icon: RiUserSettingsFill, title: 'Manage Teachers', count: teachers.length, color: '#4CAF50' },
    { icon: RiGraduationCapFill, title: 'Manage Students', count: students.length, color: '#2196F3' },
    { icon: RiBookOpenFill, title: 'Manage Courses', count: 12, color: '#FF9800' },
    { icon: RiBarChartFill, title: 'Reports & Analytics', count: 5, color: '#9C27B0' },
    { icon: RiSettingsFill, title: 'System Settings', count: 8, color: '#607D8B' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: RiBarChartFill },
    { id: 'admins', label: 'Admin Management', icon: RiUserSettingsFill },
    { id: 'teachers', label: 'Teacher Management', icon: RiBookOpenFill },
    { id: 'students', label: 'Student Management', icon: RiGraduationCapFill },
    { id: 'classes', label: 'Class Management', icon: RiBookOpenFill },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <RiAdminFill className="user-icon" />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-grid">
              {dashboardItems.map((item, index) => (
                <div key={index} className="dashboard-card" style={{ borderLeftColor: item.color }}>
                  <div className="card-icon" style={{ color: item.color }}>
                    <item.icon />
                  </div>
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p className="card-count">
                      {loading ? 'Loading...' : item.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <button className="action-btn primary">Add New Teacher</button>
                <button className="action-btn secondary">Add New Student</button>
                <button className="action-btn tertiary">Generate Report</button>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-content">
                    <p>New teacher registered: Sarah Johnson</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📚</div>
                  <div className="activity-content">
                    <p>Course "Mathematics 101" updated</p>
                    <span className="activity-time">4 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🎓</div>
                  <div className="activity-content">
                    <p>Student enrollment completed: 15 new students</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'admins' && <AdminManagement />}
        {activeTab === 'teachers' && <TeacherManagement />}
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'classes' && <ClassManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;
