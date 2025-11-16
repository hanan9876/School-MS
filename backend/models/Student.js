import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
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
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  section: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10
  },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
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
  parentName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  parentPhone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 15
  },
  parentEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'student',
    enum: ['student', 'class_representative', 'prefect']
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

// Compound index for class and section queries
studentSchema.index({ class: 1, section: 1 });

const Student = mongoose.model('Student', studentSchema, 'student_login');

export default Student;

