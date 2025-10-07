const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route   POST /api/migration/update-student-ids
// @desc    Migrate old student ID format to new format
// @access  Public (for development only)
router.post('/update-student-ids', async (req, res) => {
    try {
        console.log('Starting student ID migration...');

        // Find all users with old format student IDs (starting with letters)
        const usersWithOldFormat = await User.find({
            studentId: { $regex: /^[A-Z]+\d+$/ }
        });

        console.log(`Found ${usersWithOldFormat.length} users with old format student IDs`);

        const updatedUsers = [];
        let errorCount = 0;

        for (const user of usersWithOldFormat) {
            try {
                // Extract numbers from old format (e.g., "EE2424" -> "2424")
                const numbers = user.studentId.match(/\d+/)[0];

                // Pad with zeros if less than 5 digits or truncate if more
                let newStudentId;
                if (numbers.length < 5) {
                    newStudentId = numbers.padStart(5, '0');
                } else if (numbers.length > 5) {
                    newStudentId = numbers.substring(0, 5);
                } else {
                    newStudentId = numbers;
                }

                // Check if the new student ID already exists
                const existingUser = await User.findOne({ studentId: newStudentId });
                if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                    // If conflict, append user's ID to make it unique
                    newStudentId = newStudentId.substring(0, 3) + user._id.toString().substring(user._id.toString().length - 2);
                }

                // Update the user's student ID without validation
                await User.updateOne(
                    { _id: user._id },
                    { $set: { studentId: newStudentId } },
                    { runValidators: false }
                );

                updatedUsers.push({
                    oldId: user.studentId,
                    newId: newStudentId,
                    name: user.name,
                    email: user.email
                });

                console.log(`Updated ${user.name}: ${user.studentId} -> ${newStudentId}`);

            } catch (error) {
                console.error(`Error updating user ${user.name} (${user.studentId}):`, error);
                errorCount++;
            }
        }

        res.json({
            success: true,
            message: 'Student ID migration completed',
            data: {
                totalFound: usersWithOldFormat.length,
                successfullyUpdated: updatedUsers.length,
                errors: errorCount,
                updatedUsers
            }
        });

    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message
        });
    }
});

// @route   GET /api/migration/check-student-ids
// @desc    Check current student ID formats
// @access  Public (for development only)
router.get('/check-student-ids', async (req, res) => {
    try {
        const allUsers = await User.find({}, 'name email studentId role');

        const oldFormat = allUsers.filter(user => /^[A-Z]+\d+$/.test(user.studentId));
        const newFormat = allUsers.filter(user => /^\d{5}$/.test(user.studentId));
        const otherFormat = allUsers.filter(user =>
            !/^[A-Z]+\d+$/.test(user.studentId) && !/^\d{5}$/.test(user.studentId)
        );

        res.json({
            success: true,
            data: {
                total: allUsers.length,
                oldFormat: {
                    count: oldFormat.length,
                    users: oldFormat
                },
                newFormat: {
                    count: newFormat.length,
                    users: newFormat
                },
                otherFormat: {
                    count: otherFormat.length,
                    users: otherFormat
                }
            }
        });

    } catch (error) {
        console.error('Check error:', error);
        res.status(500).json({
            success: false,
            message: 'Check failed',
            error: error.message
        });
    }
});

module.exports = router;