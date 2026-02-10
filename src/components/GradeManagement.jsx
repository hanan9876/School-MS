import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './GradeManagement.css';

const GradeManagement = () => {
  const { getAllClasses, getAllStudents, getGradesByClass, saveGrade, saveGradesBulk, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  // gradesMap[studentId][subject] = marks string
  const [gradesMap, setGradesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const selectedClass = classes.find((c) => String(c._id) === String(selectedClassId));
  // Class subjects from backend; if none, use "Overall" so teacher can still add one grade per student
  const subjects = (selectedClass?.subjects && selectedClass.subjects.length > 0)
    ? selectedClass.subjects
    : ['Overall'];

  // Load teacher's assigned classes
  useEffect(() => {
    let mounted = true;

    const loadClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const classData = await getAllClasses();
        if (!mounted) return;

        if (!classData?.success) {
          setError(classData?.error || 'Failed to load classes');
          setLoading(false);
          return;
        }

        let fetchedClasses = classData.classes || [];
        if (user && user.role === 'teacher' && user.id) {
          const userId = String(user.id);
          fetchedClasses = fetchedClasses.filter((cls) => {
            if (cls.assignedTeacher && typeof cls.assignedTeacher === 'object') {
              const teacherId = String(cls.assignedTeacher._id || cls.assignedTeacher.id || '');
              return teacherId === userId;
            }
            if (cls.assignedTeacher) {
              return String(cls.assignedTeacher) === userId;
            }
            return false;
          });
        }

        if (mounted) {
          setClasses(fetchedClasses);
          if (fetchedClasses.length === 1 && !selectedClassId) {
            setSelectedClassId(String(fetchedClasses[0]._id));
          }
        }
      } catch (err) {
        console.error('Error loading classes:', err);
        if (mounted) setError('An error occurred while loading classes');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadClasses();
    return () => { mounted = false; };
  }, [getAllClasses, user]);

  // When class is selected, load students and existing grades (all subjects)
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setGradesMap({});
      return;
    }

    let mounted = true;

    const loadStudentsAndGrades = async () => {
      setGradesLoading(true);
      setError(null);
      try {
        const [studentsRes, gradesRes] = await Promise.all([
          getAllStudents(),
          getGradesByClass(selectedClassId),
        ]);

        if (!mounted) return;

        const classIdStr = String(selectedClassId);
        const classItem = classes.find((c) => String(c._id) === classIdStr);
        const subjectList = (classItem?.subjects && classItem.subjects.length > 0)
          ? classItem.subjects
          : ['Overall'];

        let studentList = (studentsRes?.success && studentsRes.students) ? studentsRes.students : [];
        studentList = studentList.filter(
          (s) => String(s.assignedClass || s.assignedClass?._id) === classIdStr
        );
        studentList.sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || ''));

        const map = {};
        studentList.forEach((s) => {
          const sid = s._id || s.id;
          map[sid] = {};
          subjectList.forEach((sub) => { map[sid][sub] = ''; });
        });

        if (gradesRes?.success && Array.isArray(gradesRes.grades)) {
          gradesRes.grades.forEach((g) => {
            const sid = g.student?._id || g.student;
            const sub = g.subject || 'Overall';
            if (sid != null) {
              if (!map[sid]) map[sid] = {};
              map[sid][sub] = String(g.marks ?? '');
            }
          });
        } else if (gradesRes && !gradesRes.success && gradesRes.error) {
          if (mounted) setError(gradesRes.error);
        }

        if (mounted) {
          setStudents(studentList);
          setGradesMap(map);
        }
      } catch (err) {
        console.error('Error loading students/grades:', err);
        if (mounted) setError('Failed to load students or grades');
      } finally {
        if (mounted) setGradesLoading(false);
      }
    };

    loadStudentsAndGrades();
    return () => { mounted = false; };
  }, [selectedClassId, classes, getAllStudents, getGradesByClass]);

  const handleMarksChange = (studentId, subject, value) => {
    const trimmed = value.trim();
    if (trimmed !== '' && (isNaN(Number(trimmed)) || Number(trimmed) < 0 || Number(trimmed) > 100)) {
      return;
    }
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [subject]: value },
    }));
  };

  const handleSaveOne = async (studentId) => {
    const row = gradesMap[studentId] || {};
    const toSave = subjects
      .map((sub) => {
        const v = row[sub];
        if (v === '' || v === undefined) return null;
        const num = Number(v);
        if (isNaN(num) || num < 0 || num > 100) return null;
        return { subject: sub, marks: num };
      })
      .filter(Boolean);

    if (toSave.length === 0) {
      setError('Enter at least one subject mark (0–100) for this student.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    let failed = false;
    for (const { subject: sub, marks } of toSave) {
      const result = await saveGrade(selectedClassId, studentId, marks, sub);
      if (!result?.success) {
        setError(result?.error || 'Failed to save marks.');
        failed = true;
        break;
      }
    }
    setSaving(false);
    if (!failed) {
      setSuccess('Marks saved for this student.');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleSaveAll = async () => {
    const toSave = [];
    students.forEach((s) => {
      const sid = s._id || s.id;
      const row = gradesMap[sid] || {};
      subjects.forEach((sub) => {
        const v = row[sub];
        if (v === '' || v === undefined) return;
        const num = Number(v);
        if (isNaN(num) || num < 0 || num > 100) return;
        toSave.push({ studentId: sid, subject: sub, marks: num });
      });
    });

    if (toSave.length === 0) {
      setError('Enter at least one mark (0–100) in any subject to save.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    const result = await saveGradesBulk(selectedClassId, toSave);
    setSaving(false);
    if (result?.success) {
      setSuccess(`Saved ${result.grades?.length ?? toSave.length} grade(s).`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result?.error || 'Failed to save marks.');
    }
  };

  if (loading) {
    return (
      <div className="grade-management">
        <p className="grade-loading">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="grade-management">
      <h2 className="grade-title">Grades Management</h2>
      {error && <div className="grade-error">{error}</div>}
      {success && <div className="grade-success">{success}</div>}

      <div className="grade-class-select-wrap">
        <label htmlFor="grade-class-select">Select Class</label>
        <select
          id="grade-class-select"
          className="grade-class-select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">-- Choose a class --</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className || cls.name || cls.classCode || cls._id} {cls.classCode ? `(${cls.classCode})` : ''}
            </option>
          ))}
        </select>
      </div>

      {!selectedClassId && (
        <p className="grade-hint">Select a class to view and edit marks per subject for each student.</p>
      )}

      {selectedClassId && (
        <>
          {gradesLoading ? (
            <p className="grade-loading">Loading students and grades...</p>
          ) : (
            <>
              {selectedClass && (
                <p className="grade-class-info">
                  Class: <strong>{selectedClass.className || selectedClass.name}</strong>
                  {selectedClass.classCode && ` (${selectedClass.classCode})`}
                  {subjects.length > 0 && (
                    <span className="grade-subjects-label"> — Subjects: {subjects.join(', ')}</span>
                  )}
                </p>
              )}

              {students.length === 0 ? (
                <p className="grade-empty">No students assigned to this class.</p>
              ) : (
                <div className="grade-card grade-card-with-subjects">
                  <div className="grade-actions-top">
                    <button
                      type="button"
                      className="btn btn-save-all"
                      onClick={handleSaveAll}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save All Marks'}
                    </button>
                  </div>
                  <div className="grade-table-wrap">
                    <table className="grade-table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student Name</th>
                          <th>Student ID</th>
                          {subjects.map((sub) => (
                            <th key={sub} className="grade-th-subject">
                              {sub} <span className="grade-th-range">(0–100)</span>
                            </th>
                          ))}
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => {
                          const sid = student._id || student.id;
                          const row = gradesMap[sid] || {};
                          return (
                            <tr key={sid} className="grade-row">
                              <td data-label="Roll No">{student.rollNumber || '–'}</td>
                              <td data-label="Name">{student.name || student.username || '–'}</td>
                              <td data-label="Student ID">{student.studentId || '–'}</td>
                              {subjects.map((sub) => (
                                <td key={sub} data-label={sub}>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    className="grade-input"
                                    value={row[sub] ?? ''}
                                    onChange={(e) => handleMarksChange(sid, sub, e.target.value)}
                                    placeholder="–"
                                  />
                                </td>
                              ))}
                              <td data-label="Action">
                                <button
                                  type="button"
                                  className="btn btn-save-one"
                                  onClick={() => handleSaveOne(sid)}
                                  disabled={saving}
                                >
                                  Save
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GradeManagement;
