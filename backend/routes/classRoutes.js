import express from 'express';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

const router = express.Router();

// Add new class
router.post('/add', async (req, res) => {
  try {
    const {
      className,
      classCode,
      description,
      assignedTeacher,
      subjects = [],
      maxStudents = 30,
      roomNumber,
      schedule = {},
      academicYear,
      semester
    } = req.body;

    // Validate required fields
    if (!className || !classCode || !assignedTeacher || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        error: 'Class name, class code, assigned teacher, academic year, and semester are required'
      });
    }

    // Check if class code already exists
    const existingClass = await Class.findOne({ classCode });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        error: 'Class with this code already exists'
      });
    }

    // Verify teacher exists
    const teacher = await Teacher.findById(assignedTeacher);
    if (!teacher) {
      return res.status(400).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Create new class
    const newClass = new Class({
      className,
      classCode,
      description,
      assignedTeacher,
      subjects: Array.isArray(subjects) ? subjects : [subjects].filter(Boolean),
      maxStudents,
      roomNumber,
      schedule,
      academicYear,
      semester
    });

    await newClass.save();

    // Update teacher's assigned classes
    await Teacher.findByIdAndUpdate(assignedTeacher, {
      $addToSet: { assignedClasses: newClass._id }
    });

    // Populate teacher details for response
    const populatedClass = await Class.findById(newClass._id)
      .populate('assignedTeacher', 'name email employeeId department subjects');

    res.status(201).json({
      success: true,
      class: populatedClass,
      message: 'Class created successfully'
    });

  } catch (error) {
    console.error('Add class error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all classes
router.get('/all', async (req, res) => {
  try {
    const classes = await Class.find({})
      .populate('assignedTeacher', 'name email employeeId department subjects')
      .sort({ academicYear: -1, semester: 1, className: 1 });

    // Get student counts for each class
    const classesWithStudentCount = await Promise.all(
      classes.map(async (classItem) => {
        const studentCount = await Student.countDocuments({ assignedClass: classItem._id });
        return {
          ...classItem.toObject(),
          currentStudents: studentCount
        };
      })
    );

    res.json({
      success: true,
      classes: classesWithStudentCount
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = await Class.findById(id)
      .populate('assignedTeacher', 'name email employeeId department subjects subjects');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Get students in this class
    const students = await Student.find({ assignedClass: id })
      .select('name studentId rollNumber email class section');

    res.json({
      success: true,
      class: classItem,
      students
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If changing assigned teacher, update both teachers
    if (updateData.assignedTeacher) {
      const oldClass = await Class.findById(id);
      if (oldClass && oldClass.assignedTeacher.toString() !== updateData.assignedTeacher) {
        // Remove from old teacher
        await Teacher.findByIdAndUpdate(oldClass.assignedTeacher, {
          $pull: { assignedClasses: id }
        });
        // Add to new teacher
        await Teacher.findByIdAndUpdate(updateData.assignedTeacher, {
          $addToSet: { assignedClasses: id }
        });
      }
    }

    const classItem = await Class.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTeacher', 'name email employeeId department subjects');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      class: classItem,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if class has students
    const studentCount = await Student.countDocuments({ assignedClass: id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete class. ${studentCount} students are assigned to this class. Please reassign students first.`
      });
    }

    const classItem = await Class.findByIdAndDelete(id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Remove from teacher's assigned classes
    await Teacher.findByIdAndUpdate(classItem.assignedTeacher, {
      $pull: { assignedClasses: id }
    });

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Toggle class active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    classItem.isActive = !classItem.isActive;
    await classItem.save();

    res.json({
      success: true,
      class: {
        id: classItem._id,
        className: classItem.className,
        classCode: classItem.classCode,
        isActive: classItem.isActive
      },
      message: `Class ${classItem.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle class status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Assign student to class
router.post('/:id/assign-student', async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Check if class exists and is active
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    if (!classItem.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot assign student to inactive class'
      });
    }

    // Check if class has space
    const currentStudentCount = await Student.countDocuments({ assignedClass: classId });
    if (currentStudentCount >= classItem.maxStudents) {
      return res.status(400).json({
        success: false,
        error: 'Class is full. Cannot assign more students.'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Remove student from previous class if any
    if (student.assignedClass) {
      await Class.findByIdAndUpdate(student.assignedClass, {
        $inc: { currentStudents: -1 }
      });
    }

    // Assign student to new class
    await Student.findByIdAndUpdate(studentId, {
      assignedClass: classId
    });

    // Update class student count
    await Class.findByIdAndUpdate(classId, {
      $inc: { currentStudents: 1 }
    });

    res.json({
      success: true,
      message: 'Student assigned to class successfully'
    });
  } catch (error) {
    console.error('Assign student error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove student from class
router.post('/:id/remove-student', async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Check if student is assigned to this class
    const student = await Student.findOne({ _id: studentId, assignedClass: classId });
    if (!student) {
      return res.status(400).json({
        success: false,
        error: 'Student is not assigned to this class'
      });
    }

    // Remove student from class
    await Student.findByIdAndUpdate(studentId, {
      $unset: { assignedClass: 1 }
    });

    // Update class student count
    await Class.findByIdAndUpdate(classId, {
      $inc: { currentStudents: -1 }
    });

    res.json({
      success: true,
      message: 'Student removed from class successfully'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get available teachers (not assigned to max classes)
router.get('/teachers/available', async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .select('name email employeeId department subjects assignedClasses')
      .populate('assignedClasses', 'className classCode');

    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('Get available teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
