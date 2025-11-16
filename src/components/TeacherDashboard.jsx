import React, { act , useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBookOpen, FaUsers, FaClipboardList, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import './Dashboard.css';
import { RiBarChartFill, RiUserSettingsFill, RiBookOpenFill, RiGraduationCapFill } from 'react-icons/ri';
import AttendenceManagement from './AttendenceMangement';
import TeacherClass from './TeacherClass';
const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardItems = [
    { icon: FaBookOpen, title: 'My Courses', count: '4', color: '#4CAF50' },
    { icon: FaUsers, title: 'My Students', count: '45', color: '#2196F3' },
    { icon: FaClipboardList, title: 'Assignments', count: '8', color: '#FF9800' },
    { icon: FaChartLine, title: 'Grades', count: '120', color: '#9C27B0' },
    { icon: FaCalendarAlt, title: 'Schedule', count: '12', color: '#607D8B' }
  ];
   const tabs = [
    { id: 'overview', label: 'Overview', icon: RiBarChartFill },
    { id: 'Attendence', label: 'Attendence Management', icon: RiBookOpenFill },
    { id: 'students', label: 'Student Management', icon: RiGraduationCapFill },
    { id: 'classes', label: 'Class Management', icon: RiBookOpenFill },
  ];


  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <FaChalkboardTeacher className="user-icon" />
            <div>
              <h1>Teacher Dashboard</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
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
                <p className="card-count">{item.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-section">
          <h2>Today's Schedule</h2>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="schedule-time">9:00 AM</div>
              <div className="schedule-content">
                <h4>Mathematics 101</h4>
                <p>Room 201 - 30 students</p>
              </div>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">11:00 AM</div>
              <div className="schedule-content">
                <h4>Physics 201</h4>
                <p>Room 305 - 25 students</p>
              </div>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">2:00 PM</div>
              <div className="schedule-content">
                <h4>Office Hours</h4>
                <p>Room 201 - Available for students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn primary">Create Assignment</button>
            <button className="action-btn secondary">Grade Submissions</button>
            <button className="action-btn tertiary">View Student Progress</button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <p>Graded 15 assignments for Mathematics 101</p>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📚</div>
              <div className="activity-content">
                <p>Uploaded new lecture materials for Physics 201</p>
                <span className="activity-time">3 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💬</div>
              <div className="activity-content">
                <p>Received 3 student messages</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
          </div>
        </div>
          </>
         )}
       {activeTab === 'Attendence' && <AttendenceManagement/>}
       {activeTab === 'classes' && <TeacherClass/>}

      </main>
    </div>
  );
};

export default TeacherDashboard;
