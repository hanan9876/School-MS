import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Always hit the backend directly so grades work (backend must be running: node connect.js)
  const API_BASE_URL = 'http://localhost:5000/api';

  // No more mock users - all authentication is now real

  const login = async (username, password, role) => {
    try {
      console.log('Login attempt:', { username, role });
      
      // Handle admin login with real API
      if (role === 'admin') {
        console.log('Attempting admin login via API...');
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('Admin login successful');
          return { success: true, user: data.user };
        } else {
          console.log('Admin login failed:', data.error);
          return { success: false, error: data.error || 'Login failed' };
        }
      } else if (role === 'teacher') {
        // Handle teacher login with real API
        console.log('Attempting teacher login via API...');
        const response = await fetch(`${API_BASE_URL}/teacher/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('Teacher login successful');
          return { success: true, user: data.user };
        } else {
          console.log('Teacher login failed:', data.error);
          return { success: false, error: data.error || 'Login failed' };
        }
      } else if (role === 'student') {
        // Handle student login with real API
        console.log('Attempting student login via API...');
        const response = await fetch(`${API_BASE_URL}/student/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);

        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('Student login successful');
          return { success: true, user: data.user };
        } else {
          console.log('Student login failed:', data.error);
          return { success: false, error: data.error || 'Login failed' };
        }
      } else {
        return { success: false, error: 'Invalid role' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Add new admin function
  const addAdmin = async (adminData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add admin error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get all admins function
  const getAllAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get admins error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Delete admin function
  const deleteAdmin = async (adminId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete admin error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Add new teacher function
  const addTeacher = async (teacherData) => {
    try {
      console.log('AuthContext: Adding teacher with data:', teacherData);
      const response = await fetch(`${API_BASE_URL}/teacher/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });

      console.log('AuthContext: Response status:', response.status);
      const data = await response.json();
      console.log('AuthContext: Response data:', data);
      return data;
    } catch (error) {
      console.error('Add teacher error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get all teachers function
  const getAllTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get teachers error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Update teacher function
  const updateTeacher = async (teacherId, teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update teacher error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Delete teacher function
  const deleteTeacher = async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete teacher error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Toggle teacher status function
  const toggleTeacherStatus = async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}/toggle-status`, {
        method: 'PATCH',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle teacher status error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Add new student function
  const addStudent = async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add student error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get all students function
  const getAllStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get students error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Update student function
  const updateStudent = async (studentId, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update student error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Delete student function
  const deleteStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete student error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Toggle student status function
  const toggleStudentStatus = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}/toggle-status`, {
        method: 'PATCH',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle student status error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Add new class function
  const addClass = async (classData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add class error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get all classes function
  const getAllClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get classes error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get class by ID function
  const getClassById = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get class error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Update class function
  const updateClass = async (classId, classData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update class error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Delete class function
  const deleteClass = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete class error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Toggle class status function
  const toggleClassStatus = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}/toggle-status`, {
        method: 'PATCH',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle class status error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Assign student to class function
  const assignStudentToClass = async (classId, studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}/assign-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Assign student to class error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Remove student from class function
  const removeStudentFromClass = async (classId, studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}/remove-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Remove student from class error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get available teachers function
  const getAvailableTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/teachers/available`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get available teachers error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Helper: parse JSON from response or return error object (avoids "Unexpected token '<'" when server returns HTML)
  const parseJsonResponse = async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {
        success: false,
        error: response.ok ? 'Invalid response from server.' : `Server error (${response.status}). Is the backend running with grade routes?`,
      };
    }
  };

  // Get grades for a class
  const getGradesByClass = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grade/class/${classId}`);
      const data = await parseJsonResponse(response);
      if (!response.ok && data.error === undefined) {
        data.success = false;
        data.error = data.error || `Request failed (${response.status}).`;
      }
      return data;
    } catch (error) {
      console.error('Get grades error:', error);
      return { success: false, error: 'Network error. Please try again. Is the backend running?' };
    }
  };

  // Save or update grade for a student in a class (optional subject, default 'Overall')
  const saveGrade = async (classId, studentId, marks, subject = 'Overall') => {
    try {
      const response = await fetch(`${API_BASE_URL}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, studentId, marks, subject }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok && data.error === undefined) {
        data.success = false;
        data.error = data.error || `Request failed (${response.status}).`;
      }
      return data;
    } catch (error) {
      console.error('Save grade error:', error);
      return { success: false, error: 'Network error. Please try again. Is the backend running?' };
    }
  };

  // Save multiple grades at once; each grade: { studentId, subject, marks }
  const saveGradesBulk = async (classId, grades, term = 'Term 1') => {
    try {
      const response = await fetch(`${API_BASE_URL}/grade/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, grades, term }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok && data.error === undefined) {
        data.success = false;
        data.error = data.error || `Request failed (${response.status}).`;
      }
      return data;
    } catch (error) {
      console.error('Save grades bulk error:', error);
      return { success: false, error: 'Network error. Please try again. Is the backend running?' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    addAdmin,
    getAllAdmins,
    deleteAdmin,
    addTeacher,
    getAllTeachers,
    updateTeacher,
    deleteTeacher,
    toggleTeacherStatus,
    addStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    addClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
    toggleClassStatus,
    assignStudentToClass,
    removeStudentFromClass,
    getAvailableTeachers,
    getGradesByClass,
    saveGrade,
    saveGradesBulk
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
