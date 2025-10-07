const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findLibrarians = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Find all librarian users
        const librarians = await User.find({ role: 'librarian' });
        console.log(`Found ${librarians.length} librarian user(s):`);

        librarians.forEach((librarian, index) => {
            console.log(`\nLibrarian ${index + 1}:`);
            console.log('📧 Email:', librarian.email);
            console.log('🆔 Student ID:', librarian.studentId);
            console.log('👤 Name:', librarian.name);
            console.log('✅ Is Approved:', librarian.isApproved);
            console.log('🔓 Is Active:', librarian.isActive);
            console.log('📬 Is Email Verified:', librarian.isEmailVerified);
        });

        if (librarians.length === 0) {
            console.log('\n❌ No librarian users found in database');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error finding librarian users:', error);
        process.exit(1);
    }
};

findLibrarians();