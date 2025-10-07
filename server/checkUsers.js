const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/library-management');
        console.log('Connected to MongoDB');

        // Find all users
        const allUsers = await User.find({}, 'studentId name email role', { strict: false });
        console.log('Found', allUsers.length, 'total users:');

        allUsers.forEach(user => {
            console.log(`- ${user.name}: ${user.studentId} (${user.email}) - ${user.role}`);
        });

        // Also check raw collection data
        const rawUsers = await mongoose.connection.collection('users').find({}, { projection: { studentId: 1, name: 1, email: 1 } }).toArray();
        console.log('\nRaw collection data:');
        rawUsers.forEach(user => {
            console.log(`- ${user.name}: ${user.studentId} (${user.email})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Check error:', error);
        process.exit(1);
    }
}

checkUsers();