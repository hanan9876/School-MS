import express from 'express';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

const router = express.Router();

// Take attendance for a class on a given date
router.post('/take', async (req, res) => {
  try {
    const { date, classId, teacherId, records = [] } = req.body;

    if (!classId || !teacherId || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'classId, teacherId and records[] are required' });
    }

    // Validate class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Validate each student exists (best-effort)
    const studentIds = records.map(r => r.student).filter(Boolean);
    const existingStudents = await Student.find({ _id: { $in: studentIds } }).select('_id');
    const existingSet = new Set(existingStudents.map(s => String(s._id)));

    const sanitizedRecords = records
      .filter(r => existingSet.has(String(r.student)))
      .map(r => ({ student: r.student, present: !!r.present }));

    const attendance = new Attendance({
      date: date ? new Date(date) : new Date(),
      class: classId,
      teacher: teacherId,
      records: sanitizedRecords
    });

    await attendance.save();

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error('Take attendance error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Optional: get attendance records for a class and date
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query; // optional date filter

    const query = { class: classId };
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(query)
      .populate('teacher', 'name email employeeId')
      .populate('records.student', 'name rollNumber studentId')
      .sort({ date: -1 });

    res.json({ success: true, records });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
