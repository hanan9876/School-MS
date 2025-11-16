import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/school_system';

const migrateAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Check what's in the admins collection
    const adminsCollection = db.collection('admins');
    const adminLoginCollection = db.collection('admin_login');
    
    // Get all documents from admins collection
    const adminsData = await adminsCollection.find({}).toArray();
    console.log(`📊 Found ${adminsData.length} documents in 'admins' collection`);
    
    if (adminsData.length > 0) {
      console.log('📋 Admin data found:', adminsData);
      
      // Check if admin_login collection is empty
      const adminLoginCount = await adminLoginCollection.countDocuments();
      console.log(`📊 Found ${adminLoginCount} documents in 'admin_login' collection`);
      
      if (adminLoginCount === 0) {
        console.log('🔄 Migrating data from admins to admin_login...');
        
        // Migrate each admin document
        for (const adminData of adminsData) {
          // Hash the password if it's not already hashed
          let hashedPassword = adminData.password;
          if (!hashedPassword.startsWith('$2')) {
            hashedPassword = await bcrypt.hash(adminData.password, 12);
          }
          
          // Create new document in admin_login collection
          const newAdmin = {
            username: adminData.username,
            password: hashedPassword,
            name: adminData.name || adminData.username,
            email: adminData.email || `${adminData.username}@schoolsystem.com`,
            role: adminData.role || 'admin',
            createdAt: adminData.createdAt || new Date(),
            lastLogin: adminData.lastLogin || null
          };
          
          await adminLoginCollection.insertOne(newAdmin);
          console.log(`✅ Migrated admin: ${adminData.username}`);
        }
        
        console.log('🎉 Migration completed successfully!');
      } else {
        console.log('⚠️  admin_login collection already has data. Skipping migration.');
      }
    } else {
      console.log('📭 No data found in admins collection');
    }
    
    // Verify the migration
    const finalCount = await adminLoginCollection.countDocuments();
    console.log(`📊 Final count in admin_login collection: ${finalCount}`);
    
    // Show the migrated data
    const migratedAdmins = await adminLoginCollection.find({}).toArray();
    console.log('📋 Migrated admin data:', migratedAdmins.map(admin => ({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt
    })));

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the migration
migrateAdmins();
