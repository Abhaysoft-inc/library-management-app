const mongoose = require('mongoose');
const User = require('./models/User');

async function migrate() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/library-management');
        console.log('Connected to MongoDB');

        // Find all users with old format (starts with letters)
        const oldFormatUsers = await User.find({ studentId: /^[A-Z]+/ }, null, { strict: false });
        console.log('Found', oldFormatUsers.length, 'users with old format');

        for (let user of oldFormatUsers) {
            const oldId = user.studentId;
            // Extract numbers from old format (e.g., EE2424 -> 2424, then pad to 5 digits -> 02424)
            const numbers = oldId.replace(/[A-Z]/g, '');
            const newId = numbers.padStart(5, '0');

            // Update without validation
            await mongoose.connection.collection('users').updateOne(
                { _id: user._id },
                { $set: { studentId: newId } }
            );
            console.log('Updated', oldId, '->', newId);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();