const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authenticate, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students (Admin only)
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            year,
            isApproved,
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        const query = { role: 'student' };

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by year
        if (year) {
            query.year = year;
        }

        // Filter by approval status
        if (isApproved !== undefined) {
            query.isApproved = isApproved === 'true';
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const students = await User.find(query)
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                students,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching students'
        });
    }
});

// @route   GET /api/students/:id
// @desc    Get student profile
// @access  Private (Own profile or Admin)
router.get('/:id', authenticate, async (req, res) => {
    try {
        // Check if user can access this profile
        if (req.user._id.toString() !== req.params.id &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const student = await User.findById(req.params.id)
            .select('-password -emailVerificationToken -passwordResetToken');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get student's transaction history
        const transactions = await Transaction.find({ studentId: req.params.id })
            .populate('bookId', 'title author isbn')
            .sort({ issueDate: -1 })
            .limit(10);

        // Get active transactions
        const activeTransactions = await Transaction.getStudentActiveTransactions(req.params.id);

        res.json({
            success: true,
            data: {
                student,
                transactions,
                activeTransactions
            }
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student'
        });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student profile
// @access  Private (Own profile or Admin)
router.put('/:id', authenticate, async (req, res) => {
    try {
        // Check if user can update this profile
        if (req.user._id.toString() !== req.params.id &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const {
            name,
            phone,
            year,
            address
        } = req.body;

        // Update allowed fields
        if (name) student.name = name;
        if (phone) student.phone = phone;
        if (year) student.year = year;
        if (address) student.address = address;

        await student.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                student: student.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Update student error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating student'
        });
    }
});

// @route   POST/PATCH /api/students/:id/approve
// @desc    Approve student registration
// @access  Private (Admin only)
router.post('/:id/approve', authenticate, authorize('admin'), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (student.isApproved) {
            return res.status(400).json({
                success: false,
                message: 'Student is already approved'
            });
        }

        student.isApproved = true;
        await student.save();

        // Send approval email to student
        notificationService.sendAccountApprovalNotification(student.email, student.name);

        res.json({
            success: true,
            message: 'Student approved successfully'
        });

    } catch (error) {
        console.error('Approve student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving student'
        });
    }
});

// PATCH method support for approve
router.patch('/:id/approve', authenticate, authorize('admin'), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (student.isApproved) {
            return res.status(400).json({
                success: false,
                message: 'Student is already approved'
            });
        }

        student.isApproved = true;
        await student.save();

        // Send approval email to student
        notificationService.sendAccountApprovalNotification(student.email, student.name);

        res.json({
            success: true,
            message: 'Student approved successfully'
        });

    } catch (error) {
        console.error('Approve student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving student'
        });
    }
});

// @route   POST/PATCH /api/students/:id/reject
// @desc    Reject student registration
// @access  Private (Admin only)
router.post('/:id/reject', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { reason } = req.body;

        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student.isApproved = false;
        student.isActive = false;
        await student.save();

        // TODO: Send rejection email to student with reason

        res.json({
            success: true,
            message: 'Student registration rejected'
        });

    } catch (error) {
        console.error('Reject student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting student'
        });
    }
});

// PATCH method support for reject
router.patch('/:id/reject', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { reason } = req.body;

        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        student.isApproved = false;
        student.isActive = false;
        await student.save();

        // TODO: Send rejection email to student with reason

        res.json({
            success: true,
            message: 'Student registration rejected'
        });

    } catch (error) {
        console.error('Reject student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting student'
        });
    }
});

// @route   GET /api/students/pending/list
// @desc    Get pending student approvals
// @access  Private (Admin only)
router.get('/pending/list', authenticate, authorize('admin'), async (req, res) => {
    try {
        const pendingStudents = await User.find({
            role: 'student',
            isApproved: false,
            isActive: true
        })
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                students: pendingStudents
            }
        });

    } catch (error) {
        console.error('Get pending students error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending students'
        });
    }
});

// @route   GET /api/students/stats/overview
// @desc    Get student statistics
// @access  Private (Admin only)
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
        const approvedStudents = await User.countDocuments({ role: 'student', isApproved: true, isActive: true });
        const pendingStudents = await User.countDocuments({ role: 'student', isApproved: false, isActive: true });

        // Students by year
        const studentsByYear = await User.aggregate([
            { $match: { role: 'student', isApproved: true, isActive: true } },
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                approvedStudents,
                pendingStudents,
                studentsByYear
            }
        });

    } catch (error) {
        console.error('Get student stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student statistics'
        });
    }
});

module.exports = router;