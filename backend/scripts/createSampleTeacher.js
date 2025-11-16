import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/school_system';

const createSampleTeacher = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ username: 'teacher' });
    if (existingTeacher) {
      console.log('⚠️  Teacher already exists with username "teacher"');
      console.log('Teacher details:', {
        username: existingTeacher.username,
        name: existingTeacher.name,
        email: existingTeacher.email,
        employeeId: existingTeacher.employeeId,
        department: existingTeacher.department,
        role: existingTeacher.role,
        createdAt: existingTeacher.createdAt
      });
      return;
    }

    // Create sample teacher
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('teacher123', saltRounds);

    const teacher = new Teacher({
      username: 'teacher',
      password: hashedPassword,
      name: 'John Teacher',
      email: 'teacher@schoolsystem.com',
      employeeId: 'T001',
      department: 'Mathematics',
      subjects: ['Mathematics', 'Statistics', 'Calculus'],
      phone: '+1234567890',
      address: '123 Teacher Street, Education City',
      role: 'teacher'
    });

    await teacher.save();

    console.log('✅ Sample teacher created successfully!');
    console.log('Teacher details:', {
      username: teacher.username,
      name: teacher.name,
      email: teacher.email,
      employeeId: teacher.employeeId,
      department: teacher.department,
      subjects: teacher.subjects,
      role: teacher.role,
      createdAt: teacher.createdAt
    });
    console.log('\n🔐 Login Credentials:');
    console.log('Username: teacher');
    console.log('Password: teacher123');

  } catch (error) {
    console.error('❌ Error creating sample teacher:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createSampleTeacher();
