const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ee_library');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            studentId: 'EE2424',
            name: 'System Administrator',
            email: 'admin@eelibrary.com',
            password: 'admin123456', // Change this in production
            phone: '9999999999',
            role: 'admin',
            isApproved: true,
            isEmailVerified: true
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@eelibrary.com');
        console.log('🔑 Password: admin123456');
        console.log('⚠️  Please change the password after first login');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();