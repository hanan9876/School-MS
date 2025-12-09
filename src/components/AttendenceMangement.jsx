import React, { useEffect, useState } from 'react';
import './AttendenceManagement.css';
import { useAuth } from '../contexts/AuthContext';
import TeacherDashboard from './TeacherDashboard';

const AttendenceManagement = () => {
  const { getAllStudents, getAllClasses, user, getAvailableTeachers } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [view, setView] = useState('take'); // 'take' or 'history'
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      setLoading(true);
      const data = await getAllStudents();

      if (!mounted) return;

      if (!(data && data.success)) {
        setError(data && data.error ? data.error : 'Failed to load students');
        setLoading(false);
        return;
      }

  let fetchedStudents = data.students || [];

      // If current user is a teacher, filter students to only those assigned to the teacher's classes
      if (user && user.role === 'teacher') {
        try {
          const classesData = await getAllClasses();
          if (classesData && classesData.success) {
            const classes = classesData.classes || [];
            setClasses(classes);

            // Build set of class ids taught by this teacher
            const teacherClassIds = new Set(
              classes
                .filter((c) => {
                  const at = c.assignedTeacher;
                  const atId = at && (at._id || at.id || at);
                  return String(atId) === String(user.id);
                })
                .map((c) => String(c._id || c.id))
            );

            // If teacher only has one class, preselect it
            if (teacherClassIds.size === 1) {
              const single = Array.from(teacherClassIds)[0];
              setSelectedClassId(single);
            }

            // Filter students where assignedClass matches one of teacherClassIds
            fetchedStudents = (fetchedStudents || []).filter((s) => {
              const assigned = s.assignedClass || s.assignedClass === 0 ? s.assignedClass : null;
              if (assigned) {
                return teacherClassIds.has(String(assigned));
              }

              // Fallback: compare student.class (string) to className or classCode
              const matchByName = classes.some((c) => {
                const cname = c.className || c.classCode || '';
                return String(cname) === String(s.class) && String(c._id || c.id) && teacherClassIds.has(String(c._id || c.id));
              });
              return matchByName;
            });
          }
        } catch (err) {
          // If class fetch fails, fall back to showing no students (or could show all)
          console.error('Error fetching classes for teacher filter:', err);
        }
      }

  setStudents(fetchedStudents);

      // Initialize attendance: default present = true
      const initial = {};
      (fetchedStudents || []).forEach((s) => {
        const id = s._id || s.id || s.studentId || s.rollNumber;
        initial[id] = true;
      });
      setAttendance(initial);
      setError(null);
      setLoading(false);
    };

    loadStudents();

    return () => {
      mounted = false;
    };
  }, [getAllStudents, getAllClasses, user]);

  const loadAttendanceHistory = async (classId) => {
    if (!classId) {
      setError('Please select a class to view history');
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/class/${classId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }
      const data = await response.json();
      if (data.success) {
        setAttendanceHistory(data.records || []);
      } else {
        setError(data.error || 'Failed to load attendance history');
      }
    } catch (err) {
      console.error('Error loading attendance history:', err);
      setError('Failed to load attendance history. Make sure server is running.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewChange = (viewType) => {
    setView(viewType);
    if (viewType === 'history' && selectedClassId) {
      loadAttendanceHistory(selectedClassId);
    }
  };

  const toggleAttendance = (student) => {
    const id = student._id || student.id || student.studentId || student.rollNumber;
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    // Persist attendance to backend for the selected class (teacher must select a class)
    const classIdToSave = selectedClassId || null;

    // Validate required fields
    if (!classIdToSave) {
      alert('Please select a class before saving attendance.');
      return;
    }

    if (!user || !user.id) {
      alert('User information is missing. Please log in again.');
      return;
    }

    if (!selectedDate) {
      alert('Please select a date before saving attendance.');
      return;
    }

    // Only save attendance for currently displayed students (for teacher, this is the selected class)
    const studentsToSave = (students || []).filter((s) => {
      if (user && user.role === 'teacher') {
        const assigned = s.assignedClass || null;
        return String(assigned) === String(classIdToSave);
      }
      return true;
    });

    if (studentsToSave.length === 0) {
      alert('No students found for the selected class.');
      return;
    }

    const records = studentsToSave
      .map((s) => {
        const studentId = s._id || s.id;
        if (!studentId) {
          console.warn('Student missing ID:', s);
          return null;
        }
        const id = s._id || s.id || s.studentId || s.rollNumber;
        return { student: studentId, present: !!attendance[id] };
      })
      .filter(Boolean); // Remove any null entries

    if (records.length === 0) {
      alert('No valid student records to save.');
      return;
    }

    const payload = {
      date: new Date(selectedDate).toISOString(),
      classId: classIdToSave,
      teacherId: user.id,
      records
    };

    try {
      const response = await fetch('http://localhost:5000/api/attendance/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        console.error('Save attendance failed:', errorData);
        alert('Failed to save attendance: ' + (errorData.error || `HTTP ${response.status}`));
        return;
      }

      const data = await response.json();
      if (data && data.success) {
        alert('Attendance saved successfully for ' + selectedDate);
        console.log('Saved attendance response:', data);
        // Refresh history if viewing it
        if (view === 'history') {
          loadAttendanceHistory(classIdToSave);
        }
      } else {
        console.error('Save attendance failed:', data);
        alert('Failed to save attendance: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save attendance error:', err);
      alert('Network error while saving attendance. Please check if the server is running.');
    }
  };

  const handleClassChange = (e) => {
    const val = e.target.value;
    setSelectedClassId(val);

    // update attendance and students view (students state remains full fetched list; filter display in render)
    // Reinitialize attendance for filtered students
    const filtered = (students || []).filter((s) => String(s.assignedClass) === String(val));
    const initial = {};
    filtered.forEach((s) => {
      const id = s._id || s.id || s.studentId || s.rollNumber;
      initial[id] = true;
    });
    setAttendance(initial);
  };

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance Management</h2>

      {user && user.role === 'teacher' && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8, fontWeight: 600 }}>Select class:</label>
          <select value={selectedClassId} onChange={handleClassChange}>
            <option value="">-- choose class --</option>
            {classes.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>{c.className || c.classCode}</option>
            ))}
          </select>
        </div>
      )}

      {/* View Toggle Buttons */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button
          className={`btn ${view === 'take' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleViewChange('take')}
        >
          Take Attendance
        </button>
        <button
          className={`btn ${view === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleViewChange('history')}
        >
          View History
        </button>
      </div>

      {loading && <div className="attendance-info">Loading students...</div>}
      {error && <div className="attendance-error">{error}</div>}

      {!loading && !error && view === 'take' && (
        <div className="attendance-card">
          {/* Date Picker */}
          <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <label style={{ marginRight: 8, fontWeight: 600 }}>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="attendance-empty">No students found.</td>
                </tr>
              )}

              {(() => {
                // Determine which students to display
                let display = students;
                if (user && user.role === 'teacher') {
                  if (!selectedClassId) {
                    // show instruction row instead of students
                    return (
                      <tr>
                        <td colSpan="5" className="attendance-empty">Please select a class to view students.</td>
                      </tr>
                    );
                  }
                  display = (students || []).filter((s) => String(s.assignedClass) === String(selectedClassId));
                }

                return display.map((student) => {
                const id = student._id || student.id || student.studentId || student.rollNumber;
                return (
                  <tr key={id} className="attendance-row">
                    <td data-label="Roll">{student.rollNumber || '-'}</td>
                    <td data-label="Name">{student.name || student.username || '-'}</td>
                    <td data-label="Class">{student.class || '-'}</td>
                    <td data-label="Section">{student.section || '-'}</td>
                    <td data-label="Present">
                      <input
                        type="checkbox"
                        checked={!!attendance[id]}
                        onChange={() => toggleAttendance(student)}
                      />
                    </td>
                  </tr>
                );
                });
              })()}
            </tbody>
          </table>

          <div className="attendance-actions">
            <button className="btn btn-save" onClick={handleSave}>Save Attendance for {selectedDate}</button>
          </div>
        </div>
      )}

      {/* History View */}
      {!loading && !error && view === 'history' && (
        <div className="attendance-card">
          {historyLoading && <div className="attendance-info">Loading attendance history...</div>}
          {!historyLoading && (
            <>
              {attendanceHistory.length === 0 ? (
                <div className="attendance-empty">No attendance records found for this class.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  {attendanceHistory.map((record) => (
                    <div key={record._id} style={{ marginBottom: 20, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>
                        Date: {new Date(record.date).toLocaleDateString()} | Teacher: {record.teacher?.name || 'Unknown'}
                      </div>
                      <table className="attendance-table" style={{ marginBottom: 8 }}>
                        <thead>
                          <tr>
                            <th>Roll</th>
                            <th>Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.records && record.records.map((att) => (
                            <tr key={att.student?._id}>
                              <td data-label="Roll">{att.student?.rollNumber || '-'}</td>
                              <td data-label="Name">{att.student?.name || '-'}</td>
                              <td data-label="Status" style={{ color: att.present ? 'green' : 'red', fontWeight: 600 }}>
                                {att.present ? '✓ Present' : '✗ Absent'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
;

export default AttendenceManagement;
