const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createTestUsers() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/library-management');
        console.log('Connected to MongoDB');

        // Create test users with both old and new format
        const testUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                studentId: '24305',
                password: await bcrypt.hash('password123', 10),
                phone: '1234567890',
                year: 3,
                branch: 'Computer Science',
                role: 'student',
                isApproved: true,
                isActive: true
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                studentId: '24306',
                password: await bcrypt.hash('password123', 10),
                phone: '1234567891',
                year: 2,
                branch: 'Electrical Engineering',
                role: 'student',
                isApproved: true,
                isActive: true
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                studentId: '00001',
                password: await bcrypt.hash('admin123', 10),
                phone: '1234567892',
                role: 'admin',
                isApproved: true,
                isActive: true
            },
            {
                name: 'Librarian User',
                email: 'librarian@example.com',
                studentId: '00002',
                password: await bcrypt.hash('lib123', 10),
                phone: '1234567893',
                role: 'librarian',
                isApproved: true,
                isActive: true
            }
        ];

        // Insert users directly to bypass validation
        await mongoose.connection.collection('users').insertMany(testUsers);
        console.log('Test users created successfully');

        // Now create a user with old format directly in database
        const oldFormatUser = {
            name: 'Old Format User',
            email: 'old@example.com',
            studentId: 'EE2424', // Old format
            password: await bcrypt.hash('password123', 10),
            phone: '1234567894',
            year: 1,
            branch: 'Mechanical Engineering',
            role: 'student',
            isApproved: true,
            isActive: true
        };

        await mongoose.connection.collection('users').insertOne(oldFormatUser);
        console.log('Old format user created for testing');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
}

createTestUsers();