import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import classRoutes from './routes/classRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import Grade from './models/Grade.js';
import Class from './models/Class.js';
import Student from './models/Student.js';

// Load environment variables
dotenv.config();

// ✅ Use correct default port for MongoDB (27017)
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/school_system';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all /api requests in dev so we can see if backend is hit
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Grade API – register FIRST so nothing else can take these paths
app.get('/api/grade', (req, res) => {
  res.json({ success: true, message: 'Grade API is running' });
});
app.get('/api/grade/class/:classId', async (req, res) => {
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
app.put('/api/grade', async (req, res) => {
  try {
    const { classId, studentId, marks, subject = 'Overall', term = 'Term 1' } = req.body;
    if (!classId || !studentId || marks === undefined || marks === null) {
      return res.status(400).json({
        success: false,
        error: 'classId, studentId and marks are required'
      });
    }
    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 100) {
      return res.status(400).json({
        success: false,
        error: 'Marks must be a number between 0 and 100'
      });
    }
    let classObjId;
    let studentObjId;
    try {
      classObjId = new mongoose.Types.ObjectId(classId);
      studentObjId = new mongoose.Types.ObjectId(studentId);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid classId or studentId' });
    }
    const classItem = await Class.findById(classObjId);
    if (!classItem) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    const student = await Student.findById(studentObjId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    const filter = { class: classObjId, student: studentObjId, subject: String(subject).trim() || 'Overall', term: String(term).trim() || 'Term 1' };
    const update = {
      $set: { marks: numMarks, updatedAt: new Date() },
      $setOnInsert: { class: classObjId, student: studentObjId, subject: filter.subject, term: filter.term }
    };
    const updated = await Grade.findOneAndUpdate(
      filter,
      update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('student', 'name rollNumber studentId');
    res.json({ success: true, grade: updated });
  } catch (error) {
    console.error('Save grade error:', error);
    const msg = error.message || 'Internal server error';
    const isValidation = error.name === 'ValidationError';
    res.status(isValidation ? 400 : 500).json({ success: false, error: msg });
  }
});
app.post('/api/grade/bulk', async (req, res) => {
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
      return res.status(400).json({
        success: false,
        error: 'Invalid classId format'
      });
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
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Other API routes
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/class', classRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 for unknown API routes (so we return JSON, not HTML)
app.use('/api', (req, res) => {
  console.log(`[API] 404 for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: 'API route not found', path: req.path });
});

console.log('📋 Grade API registered at GET/PUT /api/grade, GET /api/grade/class/:classId, POST /api/grade/bulk');

// MongoDB connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed through app termination');
  process.exit(0);
});

// Connect to database and start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  });
};

startServer();

export default connectDB;
