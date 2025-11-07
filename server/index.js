const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import logging middleware
const { requestLogger, errorLogger, statsLogger, logStatsPeriodically } = require('./middleware/logger');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (before routes)
app.use(statsLogger);
app.use(requestLogger);

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abhaya:Abhay123123@cluster0.ev63eff.mongodb.net/?appName=Cluster0');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Initialize notification service
const notificationService = require('./services/notificationService');
notificationService.start();

// Start periodic stats logging (every 60 minutes)
if (process.env.ENABLE_STATS_LOGGING === 'true') {
    logStatsPeriodically(60);
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'EE Department Library Management System API',
        version: '1.0.0',
        status: 'Server is running successfully!'
    });
});

// Stats endpoint (protected - requires authentication)
const { authenticate } = require('./middleware/auth');
const { getStats } = require('./middleware/logger');
app.get('/api/stats', authenticate, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }

    const stats = getStats();
    res.json({
        success: true,
        data: stats
    });
});

// Import and use route files
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/students', require('./routes/students'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/migration', require('./routes/migration'));

// Error logging middleware (before error handler)
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 EE Library Management System API`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;