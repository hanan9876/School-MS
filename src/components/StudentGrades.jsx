import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_BASE = 'http://localhost:5000/api';

const StudentGrades = () => {
  const { user, getAllClasses, getClassById, getGradesByClass } = useAuth();
  const [gradesBySubject, setGradesBySubject] = useState([]);
  const [classLabel, setClassLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadGrades = async () => {
      setLoading(true);
      setError('');

      try {
        const studentRes = await fetch(`${API_BASE}/student/${user.id}`);
        const studentData = await studentRes.json();

        let classIds = [];

        if (studentData?.success && studentData?.student?.assignedClass) {
          const ac = studentData.student.assignedClass;
          classIds = [typeof ac === 'object' ? (ac._id || ac.id) : ac].filter(Boolean);
        } else if (user?.class) {
          const all = await getAllClasses();
          if (all?.success && Array.isArray(all.classes)) {
            const userClass = (user.class || '').toString();
            const matched = all.classes.filter((c) => {
              const name = (c.className || '').toLowerCase();
              const code = (c.classCode || '').toLowerCase();
              const u = userClass.toLowerCase();
              return name === u || code === u || name.includes(u);
            });
            classIds = matched.map((c) => c._id);
          }
        }

        if (classIds.length === 0) {
          if (mounted) {
            setGradesBySubject([]);
            setClassLabel('');
            setError('You are not assigned to any class yet.');
          }
          return;
        }

        const studentIdStr = String(user.id);
        const allGrades = [];
        let className = '';

        for (const classId of classIds) {
          const classRes = await getClassById(classId);
          const cls = classRes?.class;
          if (cls) className = cls.className || cls.classCode || '';

          const gradesRes = await getGradesByClass(classId);
          if (!mounted) return;

          if (gradesRes?.success && Array.isArray(gradesRes.grades)) {
            gradesRes.grades.forEach((g) => {
              const sid = g.student?._id ?? g.student;
              if (String(sid) !== studentIdStr) return;
              const subject = g.subject || 'Overall';
              const marks = g.marks != null ? String(g.marks) : '';
              allGrades.push({ subject, marks, classId, className });
            });
          }
        }

        if (!mounted) return;

        setClassLabel(className || (classIds.length ? 'Your class' : ''));
        setGradesBySubject(allGrades);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Failed to load grades. Please try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadGrades();
    return () => { mounted = false; };
  }, [user?.id, user?.class, getAllClasses, getClassById, getGradesByClass]);

  if (!user) {
    return (
      <div className="dashboard-section">
        <p>Please log in to see your grades.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h2>My Grades</h2>
      {classLabel && (
        <p style={{ color: '#666', marginBottom: 16 }}>{classLabel}</p>
      )}

      {loading && <p className="card-count">Loading grades...</p>}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && gradesBySubject.length === 0 && (
        <p style={{ color: '#666' }}>No grades have been entered for you yet.</p>
      )}

      {!loading && gradesBySubject.length > 0 && (
        <div className="grade-list">
          <div className="grade-list-header">
            <span>Subject</span>
            <span>Marks</span>
          </div>
          {gradesBySubject.map((item, index) => (
            <div key={`${item.subject}-${index}`} className="grade-list-item">
              <div className="grade-subject">
                <strong>{item.subject}</strong>
                {item.className && <span className="grade-class-muted"> · {item.className}</span>}
              </div>
              <div className="grade-marks">{item.marks !== '' ? item.marks : '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
