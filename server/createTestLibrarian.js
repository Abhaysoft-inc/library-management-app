const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestLibrarian = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Check if test librarian already exists
        const existingTestLibrarian = await User.findOne({ email: 'librarian@eelibrary.com' });
        if (existingTestLibrarian) {
            console.log('Test librarian user already exists');
            console.log('📧 Email:', existingTestLibrarian.email);
            console.log('🔑 Password: librarian123456 (if unchanged)');
            process.exit(0);
        }

        // Create test librarian user
        const testLibrarian = new User({
            studentId: '54321',
            name: 'Test Librarian',
            email: 'librarian@eelibrary.com',
            password: 'librarian123456',
            phone: '8888888888',
            role: 'librarian',
            isApproved: true,
            isActive: true,
            isEmailVerified: true
        });

        await testLibrarian.save();
        console.log('✅ Test librarian user created successfully!');
        console.log('📧 Email: librarian@eelibrary.com');
        console.log('🔑 Password: librarian123456');
        console.log('🆔 Student ID: 54321');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test librarian user:', error);
        process.exit(1);
    }
};

createTestLibrarian();