const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new Error('JWT configuration error');
    }
    return jwt.sign(
        { userId },
        secret,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const {
            studentId,
            name,
            email,
            password,
            phone,
            year,
            address
        } = req.body;

        // Validation
        if (!studentId || !name || !email || !password || !phone || !year) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { studentId: studentId.toUpperCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or student ID already exists'
            });
        }

        // Validate email domain (optional - for EE department)
        const emailDomain = email.split('@')[1];
        const allowedDomains = ['student.university.edu', 'gmail.com', 'yahoo.com']; // Add your domain

        // Create new user
        const user = new User({
            studentId: studentId.toUpperCase(),
            name,
            email: email.toLowerCase(),
            password,
            phone,
            year,
            address,
            role: 'student',
            emailVerificationToken: crypto.randomBytes(32).toString('hex')
        });

        await user.save();

        // Send welcome email
        emailService.sendWelcomeEmail(user.email, user.name);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please wait for admin approval.',
            data: {
                user: user.getPublicProfile()
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

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
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email or student ID
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { studentId: email.toUpperCase() }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // For students, check if approved
        if (user.role === 'student' && !user.isApproved) {
            return res.status(403).json({
                success: false,
                message: 'Account pending approval. Please contact the administrator.'
            });
        }

        // Update last login
        await User.updateOne(
            { _id: user._id },
            { lastLogin: new Date() }
        );

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.getPublicProfile()
        }
    });
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id);

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
});


// forgot password and reset password :
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; // Update with your frontend URL
        emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);



    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }

});
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
});
module.exports = router;