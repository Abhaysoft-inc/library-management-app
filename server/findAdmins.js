const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findAllAdmins = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admin user(s):`);

        admins.forEach((admin, index) => {
            console.log(`\nAdmin ${index + 1}:`);
            console.log('📧 Email:', admin.email);
            console.log('🆔 Student ID:', admin.studentId);
            console.log('👤 Name:', admin.name);
            console.log('✅ Is Approved:', admin.isApproved);
            console.log('🔓 Is Active:', admin.isActive);
        });

        // Also check if there's a user with email admin@eelibrary.com
        const testAdmin = await User.findOne({ email: 'admin@eelibrary.com' });
        if (testAdmin) {
            console.log('\nFound user with test email admin@eelibrary.com:');
            console.log('👤 Name:', testAdmin.name);
            console.log('🔑 Role:', testAdmin.role);
            console.log('🆔 Student ID:', testAdmin.studentId);
            console.log('✅ Is Approved:', testAdmin.isApproved);
            console.log('🔓 Is Active:', testAdmin.isActive);
        } else {
            console.log('\n❌ No user found with email admin@eelibrary.com');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error finding admin users:', error);
        process.exit(1);
    }
};

findAllAdmins();