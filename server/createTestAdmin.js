const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Check if test admin already exists
        const existingTestAdmin = await User.findOne({ email: 'admin@eelibrary.com' });
        if (existingTestAdmin) {
            console.log('Test admin user already exists');
            console.log('📧 Email:', existingTestAdmin.email);
            console.log('🔑 Password: admin123456 (if unchanged)');
            process.exit(0);
        }

        // Create test admin user
        const testAdmin = new User({
            studentId: '12345',
            name: 'Test Administrator',
            email: 'admin@eelibrary.com',
            password: 'admin123456',
            phone: '9999999999',
            role: 'admin',
            isApproved: true,
            isActive: true,
            isEmailVerified: true
        });

        await testAdmin.save();
        console.log('✅ Test admin user created successfully!');
        console.log('📧 Email: admin@eelibrary.com');
        console.log('🔑 Password: admin123456');
        console.log('🆔 Student ID: 12345');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test admin user:', error);
        process.exit(1);
    }
};

createTestAdmin();