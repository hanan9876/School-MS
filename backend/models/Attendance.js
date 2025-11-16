import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: () => new Date()
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  records: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    present: { type: Boolean, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

attendanceSchema.index({ date: 1, class: 1, teacher: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendances');

export default Attendance;
