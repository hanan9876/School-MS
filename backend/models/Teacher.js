import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  subjects: [{
    type: String,
    trim: true
  }],
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  role: {
    type: String,
    default: 'teacher',
    enum: ['teacher', 'head_teacher', 'coordinator']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Indexes are already defined in the schema above with unique: true

const Teacher = mongoose.model('Teacher', teacherSchema, 'teacher_login');

export default Teacher;
