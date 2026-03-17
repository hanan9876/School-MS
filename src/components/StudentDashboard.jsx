import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PiStudentBold, PiBookOpen, PiClipboardText, PiChartLine, PiCalendar, PiNotebook } from 'react-icons/pi';
import {
  RiAdminFill,
  RiUserSettingsFill,
  RiBookOpenFill,
  RiGraduationCapFill,
  RiBarChartFill,
  RiSettingsFill,
} from 'react-icons/ri';
import './Dashboard.css';
import StudentClass from './StudentClass';
import StudentComplain from './StudentComplain';
import StudentGrades from './StudentGrades';
import ViewNotices from './ViewNotices';
import Chatbot from './Chatbot';
import { getComplaints } from '../utils/complaintsStorage';

const StudentDashboard = () => {
const { user, logout, getGradesByClass } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendancePercent, setAttendancePercent] = useState(null);
const [gradePercent, setGradePercent] = useState(null);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  useEffect(() => {
  const fetchOverviewData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      // 1️⃣ Get student
      const studentRes = await fetch(`http://localhost:5000/api/student/${user.id}`);
      const studentData = await studentRes.json();

      let classId = null;

      if (studentData?.success && studentData?.student?.assignedClass) {
        const ac = studentData.student.assignedClass;
        classId = typeof ac === 'object' ? ac._id : ac;
      }

      if (!classId) return;

      // 2️⃣ Attendance
      const attRes = await fetch(`http://localhost:5000/api/attendance/class/${classId}`);
      const attData = await attRes.json();
      const records = attData?.records || [];

      let total = records.length;
      let present = 0;

      records.forEach(r => {
        const rec = r.records?.find(rr =>
          String(rr.student?._id || rr.student) === String(user.id)
        );
        if (rec?.present) present++;
      });

      const attendance = total === 0 ? 0 : Math.round((present / total) * 100);
      setAttendancePercent(attendance);

      const gradesRes = await getGradesByClass(classId);

          if (gradesRes?.success) {
          const studentGrades = gradesRes.grades.filter(g =>
            String(g.student?._id || g.student) === String(user.id)
          );

          if (studentGrades.length > 0) {
            const totalMarks = studentGrades.reduce(
              (sum, g) => sum + Number(g.marks || 0),
              0
            );

            const maxMarks = studentGrades.length * 100;
            const percentage = Math.round((totalMarks / maxMarks) * 100);

            setGradePercent(percentage);
          } else {
            setGradePercent(0);
          }
        }

    } catch (err) {
      console.error(err);
      setError("Failed to load overview data");
    } finally {
      setLoading(false);
    }
  };

  fetchOverviewData();
}, [user]);

  const dashboardItems = [
  {
    icon: PiClipboardText,
    title: 'Attendance',
    count: attendancePercent !== null ? `${attendancePercent}%` : '0%',
    color: '#2196F3'
  },
  {
    icon: PiChartLine,
    title: 'Grades',
    count: gradePercent !== null ? `${gradePercent}%` : '0%',
    color: '#FF9800'
  },
  {
    icon: PiCalendar,
    title: 'Complaints',
    count: getComplaints().length,
    color: '#9C27B0'
  },
];

  const tabs = [
      { id: 'overview', label: 'Overview', icon: RiBarChartFill },
      { id: 'classes', label: 'Class Attendence', icon: RiUserSettingsFill },
      { id: 'studentgrades', label: 'Student Grades', icon: RiBookOpenFill },
      { id: 'complaints', label: 'Any Complaints', icon: RiGraduationCapFill },
    ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <PiStudentBold className="user-icon" />
            <div>
              <h1>Student Dashboard</h1>
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

            <Chatbot />
            <ViewNotices />

        {/* <div className="dashboard-section">
          <h2>Today's Classes</h2>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="schedule-time">9:00 AM</div>
              <div className="schedule-content">
                <h4>Mathematics 101</h4>
                <p>Room 201 - Prof. Smith</p>
              </div>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">11:00 AM</div>
              <div className="schedule-content">
                <h4>Physics 201</h4>
                <p>Room 305 - Prof. Johnson</p>
              </div>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">2:00 PM</div>
              <div className="schedule-content">
                <h4>Computer Science 101</h4>
                <p>Room 150 - Prof. Davis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Upcoming Assignments</h2>
          <div className="assignment-list">
            <div className="assignment-item urgent">
              <div className="assignment-icon">📝</div>
              <div className="assignment-content">
                <h4>Math Problem Set #5</h4>
                <p>Due: Tomorrow at 11:59 PM</p>
              </div>
            </div>
            <div className="assignment-item">
              <div className="assignment-icon">🔬</div>
              <div className="assignment-content">
                <h4>Physics Lab Report</h4>
                <p>Due: Friday at 5:00 PM</p>
              </div>
            </div>
            <div className="assignment-item">
              <div className="assignment-icon">💻</div>
              <div className="assignment-content">
                <h4>Programming Project</h4>
                <p>Due: Next Monday at 11:59 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn primary">View Assignments</button>
            <button className="action-btn secondary">Check Grades</button>
            <button className="action-btn tertiary">Download Materials</button>
          </div>
        </div> */}
        </>
        )}
        {activeTab === 'classes' && <StudentClass />}
        {activeTab === 'complaints' && <StudentComplain />}
        {activeTab === 'studentgrades' && <StudentGrades />}
      </main>
    </div>
  );
};

export default StudentDashboard;
