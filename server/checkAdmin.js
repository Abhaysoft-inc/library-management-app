const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAdminUser = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Find admin user
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Current admin user details:');
            console.log('📧 Email:', admin.email);
            console.log('🆔 Student ID:', admin.studentId);
            console.log('👤 Name:', admin.name);
            console.log('✅ Is Approved:', admin.isApproved);
            console.log('🔓 Is Active:', admin.isActive);
            console.log('📬 Is Email Verified:', admin.isEmailVerified);

            // Update studentId if it's in old format
            if (admin.studentId === 'EE2424') {
                console.log('\nUpdating studentId to new 5-digit format...');
                admin.studentId = '12345'; // Using 12345 as admin studentId
                await admin.save();
                console.log('✅ Admin studentId updated to:', admin.studentId);
            }
        } else {
            console.log('❌ No admin user found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking admin user:', error);
        process.exit(1);
    }
};

checkAdminUser();