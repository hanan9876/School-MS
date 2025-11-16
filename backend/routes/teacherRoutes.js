import express from 'express';
import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';

const router = express.Router();

// Login teacher
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    // Find teacher by username
    const teacher = await Teacher.findOne({ username, isActive: true });
    if (!teacher) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    teacher.lastLogin = new Date();
    await teacher.save();

    // Return teacher data (without password)
    const teacherData = {
      id: teacher._id,
      username: teacher.username,
      name: teacher.name,
      email: teacher.email,
      employeeId: teacher.employeeId,
      department: teacher.department,
      subjects: teacher.subjects,
      phone: teacher.phone,
      address: teacher.address,
      role: teacher.role,
      lastLogin: teacher.lastLogin
    };

    res.json({
      success: true,
      user: teacherData,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Add new teacher
router.post('/add', async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      employeeId, 
      department, 
      subjects = [], 
      phone, 
      address, 
      role = 'teacher' 
    } = req.body;

    // Validate required fields
    if (!username || !password || !name || !email || !employeeId || !department) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, password, name, email, employee ID, and department are required' 
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ 
      $or: [{ username }, { email }, { employeeId }] 
    });
    
    if (existingTeacher) {
      return res.status(400).json({ 
        success: false, 
        error: 'Teacher with this username, email, or employee ID already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new teacher
    const newTeacher = new Teacher({
      username,
      password: hashedPassword,
      name,
      email,
      employeeId,
      department,
      subjects: Array.isArray(subjects) ? subjects : [subjects].filter(Boolean),
      phone,
      address,
      role
    });

    await newTeacher.save();

    // Return teacher data (without password)
    const teacherData = {
      id: newTeacher._id,
      username: newTeacher.username,
      name: newTeacher.name,
      email: newTeacher.email,
      employeeId: newTeacher.employeeId,
      department: newTeacher.department,
      subjects: newTeacher.subjects,
      phone: newTeacher.phone,
      address: newTeacher.address,
      role: newTeacher.role,
      createdAt: newTeacher.createdAt
    };

    res.status(201).json({
      success: true,
      user: teacherData,
      message: 'Teacher created successfully'
    });

  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get all teachers
router.get('/all', async (req, res) => {
  try {
    const teachers = await Teacher.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id, { password: 0 });
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({
      success: true,
      teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Update teacher
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove password from update data if present
    delete updateData.password;
    
    const teacher = await Teacher.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({
      success: true,
      teacher,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Toggle teacher active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    teacher.isActive = !teacher.isActive;
    await teacher.save();

    res.json({
      success: true,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        username: teacher.username,
        isActive: teacher.isActive
      },
      message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle teacher status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;
