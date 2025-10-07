const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestStudent = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Check if test student already exists
        const existingTestStudent = await User.findOne({ email: 'student@eelibrary.com' });
        if (existingTestStudent) {
            console.log('Test student user already exists');
            console.log('📧 Email:', existingTestStudent.email);
            console.log('🔑 Password: student123456 (if unchanged)');
            process.exit(0);
        }

        // Create test student user
        const testStudent = new User({
            studentId: '67890',
            name: 'Test Student',
            email: 'student@eelibrary.com',
            password: 'student123456',
            phone: '7777777777',
            role: 'student',
            year: 3,
            branch: 'Electronics & Communication',
            isApproved: true,
            isActive: true,
            isEmailVerified: true
        });

        await testStudent.save();
        console.log('✅ Test student user created successfully!');
        console.log('📧 Email: student@eelibrary.com');
        console.log('🔑 Password: student123456');
        console.log('🆔 Student ID: 67890');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test student user:', error);
        process.exit(1);
    }
};

createTestStudent();