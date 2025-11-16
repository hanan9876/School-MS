import express from 'express';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';

const router = express.Router();

// Login student
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    // Find student by username
    const student = await Student.findOne({ username, isActive: true });
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    // Return student data (without password)
    const studentData = {
      id: student._id,
      username: student.username,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      phone: student.phone,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      admissionDate: student.admissionDate,
      role: student.role,
      lastLogin: student.lastLogin
    };

    res.json({
      success: true,
      user: studentData,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Add new student
router.post('/add', async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      studentId, 
      rollNumber, 
      class: studentClass, 
      section, 
      dateOfBirth, 
      gender, 
      phone, 
      address, 
      parentName, 
      parentPhone, 
      parentEmail, 
      role = 'student' 
    } = req.body;

    // Validate required fields
    if (!username || !password || !name || !email || !studentId || !rollNumber || !studentClass || !section || !dateOfBirth || !gender || !parentName || !parentPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, password, name, email, student ID, roll number, class, section, date of birth, gender, parent name, and parent phone are required' 
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ username }, { email }, { studentId }, { rollNumber }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student with this username, email, student ID, or roll number already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new student
    const newStudent = new Student({
      username,
      password: hashedPassword,
      name,
      email,
      studentId,
      rollNumber,
      class: studentClass,
      section,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone,
      address,
      parentName,
      parentPhone,
      parentEmail,
      role
    });

    await newStudent.save();

    // Return student data (without password)
    const studentData = {
      id: newStudent._id,
      username: newStudent.username,
      name: newStudent.name,
      email: newStudent.email,
      studentId: newStudent.studentId,
      rollNumber: newStudent.rollNumber,
      class: newStudent.class,
      section: newStudent.section,
      dateOfBirth: newStudent.dateOfBirth,
      gender: newStudent.gender,
      phone: newStudent.phone,
      address: newStudent.address,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      parentEmail: newStudent.parentEmail,
      admissionDate: newStudent.admissionDate,
      role: newStudent.role,
      createdAt: newStudent.createdAt
    };

    res.status(201).json({
      success: true,
      user: studentData,
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get all students
router.get('/all', async (req, res) => {
  try {
    const students = await Student.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id, { password: 0 });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove password from update data if present
    delete updateData.password;
    
    // Convert dateOfBirth to Date object if present
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    const student = await Student.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    res.json({
      success: true,
      student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Toggle student active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        isActive: student.isActive
      },
      message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle student status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;
