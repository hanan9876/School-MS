import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/school_system';

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with username "admin"');
      console.log('Admin details:', {
        username: existingAdmin.username,
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        createdAt: existingAdmin.createdAt
      });
      return;
    }

    // Create initial admin
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const admin = new Admin({
      username: 'admin',
      password: hashedPassword,
      name: 'System Administrator',
      email: 'admin@schoolsystem.com',
      role: 'admin'
    });

    await admin.save();

    console.log('✅ Initial admin created successfully!');
    console.log('Admin details:', {
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt
    });
    console.log('\n🔐 Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating initial admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createInitialAdmin();
