import express from 'express';
import mongoose from 'mongoose';
import Grade from '../models/Grade.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

const router = express.Router();

// Test route: GET /api/grade should return 200 if grade API is loaded
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Grade API is running' });
});

// Get all grades for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, term } = req.query;
    let classObjId;
    try {
      classObjId = new mongoose.Types.ObjectId(classId);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid classId' });
    }
    const classItem = await Class.findById(classObjId);
    if (!classItem) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    const query = { class: classObjId };
    if (subject) query.subject = subject;
    if (term) query.term = term;
    const grades = await Grade.find(query)
      .populate('student', 'name rollNumber studentId')
      .sort({ 'student.rollNumber': 1 });
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Upsert grade for a student in a class (add or edit)
router.put('/', async (req, res) => {
  try {
    const { classId, studentId, marks, subject = 'Overall', term = 'Term 1' } = req.body;

    if (!classId || !studentId || marks === undefined || marks === null) {
      return res.status(400).json({
        success: false,
        error: 'classId, studentId and marks are required'
      });
    }
    let classObjId;
    let studentObjId;
    try {
      classObjId = new mongoose.Types.ObjectId(classId);
      studentObjId = new mongoose.Types.ObjectId(studentId);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid classId or studentId format' });
    }

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 100) {
      return res.status(400).json({
        success: false,
        error: 'Marks must be a number between 0 and 100'
      });
    }

    const classItem = await Class.findById(classObjId);
    if (!classItem) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const student = await Student.findById(studentObjId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const sub = String(subject).trim() || 'Overall';
    const trm = String(term).trim() || 'Term 1';
    const filter = { class: classObjId, student: studentObjId, subject: sub, term: trm };
    const update = {
      $set: { marks: numMarks, updatedAt: new Date() },
      $setOnInsert: { class: classObjId, student: studentObjId, subject: sub, term: trm }
    };
    const updated = await Grade.findOneAndUpdate(
      filter,
      update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('student', 'name rollNumber studentId');

    res.json({ success: true, grade: updated });
  } catch (error) {
    console.error('Save grade error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Save multiple grades at once (bulk); each item can have studentId, subject, marks
router.post('/bulk', async (req, res) => {
  try {
    const { classId, term = 'Term 1', grades: gradeList = [] } = req.body;

    if (!classId || !Array.isArray(gradeList)) {
      return res.status(400).json({
        success: false,
        error: 'classId and grades array are required'
      });
    }
    let classObjId;
    try {
      classObjId = new mongoose.Types.ObjectId(classId);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid classId format' });
    }
    const classItem = await Class.findById(classObjId);
    if (!classItem) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const termStr = String(term).trim() || 'Term 1';
    const results = [];
    for (const g of gradeList) {
      const { studentId, subject = 'Overall', marks } = g;
      if (studentId == null || marks === undefined || marks === null) continue;
      let studentObjId;
      try {
        studentObjId = new mongoose.Types.ObjectId(studentId);
      } catch (e) {
        continue;
      }
      const numMarks = Number(marks);
      if (isNaN(numMarks) || numMarks < 0 || numMarks > 100) continue;
      const subjectStr = String(subject || 'Overall').trim() || 'Overall';
      const filter = { class: classObjId, student: studentObjId, subject: subjectStr, term: termStr };
      const update = {
        $set: { marks: numMarks, updatedAt: new Date() },
        $setOnInsert: { class: classObjId, student: studentObjId, subject: subjectStr, term: termStr }
      };
      const updated = await Grade.findOneAndUpdate(
        filter,
        update,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      results.push(updated);
    }

    res.json({ success: true, grades: results });
  } catch (error) {
    console.error('Bulk save grades error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

export default router;
