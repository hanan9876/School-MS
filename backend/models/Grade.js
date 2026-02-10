import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  subject: {
    type: String,
    trim: true,
    default: 'Overall',
    maxlength: 50
  },
  term: {
    type: String,
    trim: true,
    default: 'Term 1',
    maxlength: 20
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

gradeSchema.index({ student: 1, class: 1, subject: 1, term: 1 }, { unique: true });
gradeSchema.index({ class: 1 });

gradeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Grade = mongoose.model('Grade', gradeSchema, 'grades');

export default Grade;
