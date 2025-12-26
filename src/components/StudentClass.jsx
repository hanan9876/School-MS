import React, { useEffect, useState } from 'react';
import './StudentClass.css';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const StudentClass = () => {
  const { user, getAllClasses, getClassById } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        // Try to fetch full student details to get assignedClass id
        const studentRes = await fetch(`${API_BASE}/student/${user.id}`);
        const studentData = await studentRes.json();

        let classIds = [];

        if (studentData?.success && studentData?.student?.assignedClass) {
          classIds.push(studentData.student.assignedClass);
        } else {
          // Fallback: match by class name string from login (user.class)
          const all = await getAllClasses();
          if (all?.success && Array.isArray(all.classes)) {
            const matched = all.classes.filter(c => {
              const className = c.className || '';
              const classCode = c.classCode || '';
              const userClass = (user.class || '').toString();
              return (
                className.toLowerCase() === userClass.toLowerCase() ||
                classCode.toLowerCase() === userClass.toLowerCase() ||
                className.toLowerCase().includes(userClass.toLowerCase())
              );
            });
            classIds = matched.map(c => c._id);
          }
        }

        // Fetch class details and attendance for each class id
        const classesWithAttendance = await Promise.all(
          classIds.map(async (cid) => {
            const cls = await getClassById(cid);
            const clsData = cls?.class || null;

            // fetch attendance records for this class
            const attRes = await fetch(`${API_BASE}/attendance/class/${cid}`);
            const attData = await attRes.json();
            const records = attData?.records || [];

            // compute attendance stats for this student
            const studentId = user.id;
            let totalSessions = records.length;
            let presentCount = 0;

            records.forEach(r => {
              const rec = r.records?.find(rr => rr.student && (String(rr.student._id || rr.student) === String(studentId)) );
              if (rec && rec.present) presentCount++;
            });

            const percentage = totalSessions === 0 ? null : Math.round((presentCount / totalSessions) * 100);

            return {
              class: clsData,
              attendanceRecords: records,
              stats: { totalSessions, presentCount, percentage },
              studentId
            };
          })
        );

        setClasses(classesWithAttendance.filter(c => c.class));
      } catch (err) {
        console.error(err);
        setError('Failed to load classes or attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, getAllClasses, getClassById]);

  if (!user) return <p>Please log in to see your classes.</p>;

  return (
    <div className="student-classes">
      <h2>My Classes</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && classes.length === 0 && (
        <p>You are not assigned to any classes yet.</p>
      )}

      <div className="classes-list">
        {classes.map((cItem, idx) => (
          <ClassCard key={idx} data={cItem} studentId={user.id} />
        ))}
      </div>
    </div>
  );
};

const ClassCard = ({ data, studentId }) => {
  const { class: cls, attendanceRecords, stats } = data;
  const [open, setOpen] = useState(false);

  return (
    <div className="class-card">
      <div className="class-header">
        <div>
          <h3>{cls?.className || 'Unnamed Class'}</h3>
          <p className="muted">{cls?.classCode} • Teacher: {cls?.assignedTeacher?.name || 'TBA'}</p>
        </div>
        <div className="attendance-summary">
          <p>{stats.percentage === null ? 'No sessions' : `${stats.percentage}%`}</p>
          <p className="muted">{stats.presentCount}/{stats.totalSessions} present</p>
          <button onClick={() => setOpen(!open)} className="view-btn">{open ? 'Hide' : 'View Records'}</button>
        </div>
      </div>

      {open && (
        <div className="attendance-list">
          {attendanceRecords.length === 0 && <p>No attendance records for this class.</p>}
          {attendanceRecords.map((rec) => (
            <div key={rec._id} className="attendance-row">
              <div className="att-date">{new Date(rec.date).toLocaleDateString()}</div>
              <div className="att-status">
                {(() => {
                  const r = rec.records?.find(rr => rr.student && (String(rr.student._id || rr.student) === String(studentId)) );
                  if (!r) return <span className="absent">Not recorded</span>;
                  return r.present ? <span className="present">Present</span> : <span className="absent">Absent</span>;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClass;
