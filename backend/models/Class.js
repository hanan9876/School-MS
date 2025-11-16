import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  classCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 10
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subjects: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  maxStudents: {
    type: Number,
    default: 30,
    min: 1,
    max: 100
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  roomNumber: {
    type: String,
    trim: true,
    maxlength: 20
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  academicYear: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  semester: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
classSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
classSchema.index({ classCode: 1 });
classSchema.index({ assignedTeacher: 1 });
classSchema.index({ academicYear: 1, semester: 1 });
classSchema.index({ isActive: 1 });

const Class = mongoose.model('Class', classSchema, 'classes');

export default Class;
