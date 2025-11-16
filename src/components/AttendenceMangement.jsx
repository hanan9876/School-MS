import React, { useEffect, useState } from 'react';
import './AttendenceManagement.css';
import { useAuth } from '../contexts/AuthContext';
import TeacherDashboard from './TeacherDashboard';

const AttendenceManagement = () => {
  const { getAllStudents, getAllClasses, user, getAvailableTeachers } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState({});

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
      date: new Date().toISOString(),
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
        alert('Attendance saved successfully');
        console.log('Saved attendance response:', data);
        // Optionally reset attendance state or refresh
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

      {loading && <div className="attendance-info">Loading students...</div>}
      {error && <div className="attendance-error">{error}</div>}

      {!loading && !error && (
        <div className="attendance-card">
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
            <button className="btn btn-save" onClick={handleSave}>Save Attendance</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendenceManagement;
