const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Authorization middleware - check user roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Check if student account is approved
const checkApproval = (req, res, next) => {
    if (req.user.role === 'student' && !req.user.isApproved) {
        return res.status(403).json({
            success: false,
            message: 'Account pending approval. Please contact the administrator.'
        });
    }
    next();
};

// Check if email is verified
const checkEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required. Please check your email.'
        });
    }
    next();
};

module.exports = {
    authenticate,
    authorize,
    checkApproval,
    checkEmailVerification
};