#!/usr/bin/env node

/**
 * Library Management System - Backend Setup Script
 * This script handles complete backend initialization including:
 * - Database connection verification
 * - Admin user creation
 * - Test users creation (optional)
 * - Sample books data population (optional)
 */

const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');
const Book = require('./models/Book');
require('dotenv').config();

// ANSI color codes for better console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.blue}━━━ ${msg} ━━━${colors.reset}\n`)
};

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Sample books data (addedBy will be set during creation)
const SAMPLE_BOOKS = [
    {
        isbn: '9780134685991',
        title: 'Digital Electronics: Principles and Applications',
        author: ['Roger L. Tokheim'],
        category: 'Digital Electronics',
        subject: 'Digital Logic Design',
        description: 'A comprehensive guide to digital electronics fundamentals.',
        publisher: 'McGraw-Hill',
        publishedYear: 2020,
        edition: '8th',
        pages: 500,
        language: 'English',
        totalCopies: 5,
        availableCopies: 5,
        isActive: true,
        tags: ['digital', 'electronics', 'logic design']
    },
    {
        isbn: '9780262033848',
        title: 'Power System Analysis and Design',
        author: ['J. Duncan Glover', 'Mulukutla S. Sarma', 'Thomas Overbye'],
        category: 'Power Systems',
        subject: 'Power System Analysis',
        description: 'The comprehensive guide to power system analysis and design.',
        publisher: 'Cengage Learning',
        publishedYear: 2016,
        edition: '6th',
        pages: 800,
        language: 'English',
        totalCopies: 8,
        availableCopies: 8,
        isActive: true,
        tags: ['power systems', 'electrical engineering', 'power analysis']
    },
    {
        isbn: '9781449355739',
        title: 'Control Systems Engineering',
        author: ['Norman S. Nise'],
        category: 'Control Systems',
        subject: 'Automatic Control',
        description: 'A comprehensive introduction to control systems theory and design.',
        publisher: 'Wiley',
        publishedYear: 2019,
        edition: '7th',
        pages: 1024,
        language: 'English',
        totalCopies: 6,
        availableCopies: 6,
        isActive: true,
        tags: ['control systems', 'feedback', 'automation']
    },
    {
        isbn: '9780596517748',
        title: 'Microprocessor and Microcontroller Fundamentals',
        author: ['William Kleitz'],
        category: 'Microprocessors',
        subject: 'Embedded Systems',
        description: 'A comprehensive guide to microprocessor architecture and programming.',
        publisher: 'Pearson',
        publishedYear: 2018,
        edition: '8th',
        pages: 624,
        language: 'English',
        totalCopies: 4,
        availableCopies: 4,
        isActive: true,
        tags: ['microprocessors', 'embedded systems', 'programming']
    },
    {
        isbn: '9780134757599',
        title: 'Electrical Machines, Drives, and Power Systems',
        author: ['Theodore Wildi'],
        category: 'Electrical Machines',
        subject: 'Electric Motors and Generators',
        description: 'A comprehensive handbook on electrical machines and power systems.',
        publisher: 'Pearson',
        publishedYear: 2020,
        edition: '6th',
        pages: 912,
        language: 'English',
        totalCopies: 3,
        availableCopies: 3,
        isActive: true,
        tags: ['electrical machines', 'motors', 'generators', 'power systems']
    }
];

/**
 * Connect to MongoDB database
 */
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management';
        await mongoose.connect(mongoUri);
        log.success(`Connected to MongoDB: ${mongoose.connection.host}`);
        log.info(`Database: ${mongoose.connection.name}`);
        return true;
    } catch (error) {
        log.error(`Database connection failed: ${error.message}`);
        return false;
    }
}

/**
 * Create default admin user
 */
async function createAdminUser() {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            log.warning('Admin user already exists');
            log.info(`Email: ${existingAdmin.email}`);
            log.info(`Name: ${existingAdmin.name}`);
            return existingAdmin;
        }

        const adminData = {
            studentId: '00001',
            name: 'System Administrator',
            email: 'admin@eelibrary.com',
            password: 'Admin@123456',
            phone: '9999999999',
            role: 'admin',
            isApproved: true,
            isActive: true,
            isEmailVerified: true
        };

        const admin = new User(adminData);
        await admin.save();

        log.success('Admin user created successfully!');
        console.log('\n📧 Admin Credentials:');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   Student ID: ${adminData.studentId}`);
        log.warning('Please change the password after first login!\n');

        return admin;
    } catch (error) {
        log.error(`Failed to create admin user: ${error.message}`);
        throw error;
    }
}

/**
 * Create test users (students only)
 */
async function createTestUsers() {
    try {
        const testUsers = [
            {
                studentId: '12345',
                name: 'Test Student',
                email: 'student@eelibrary.com',
                password: 'Student@123',
                phone: '7777777777',
                role: 'student',
                year: 3,
                branch: 'Computer Science',
                isApproved: true,
                isActive: true,
                isEmailVerified: true
            }
        ];

        let createdCount = 0;
        for (const userData of testUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                const user = new User(userData);
                await user.save();
                createdCount++;
                log.success(`Created ${userData.role}: ${userData.email}`);
            } else {
                log.info(`${userData.role} already exists: ${userData.email}`);
            }
        }

        if (createdCount > 0) {
            console.log('\n📧 Test User Credentials:');
            testUsers.forEach(user => {
                console.log(`\n   ${user.role.toUpperCase()}:`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Password: ${user.password}`);
            });
        }

        return createdCount;
    } catch (error) {
        log.error(`Failed to create test users: ${error.message}`);
        throw error;
    }
}

/**
 * Populate database with sample books
 */
async function createSampleBooks() {
    try {
        // Get admin user to set as addedBy
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            log.warning('No admin user found. Please create an admin user first.');
            return 0;
        }

        let createdCount = 0;
        for (const bookData of SAMPLE_BOOKS) {
            const existing = await Book.findOne({ isbn: bookData.isbn });
            if (!existing) {
                // Add the addedBy field with admin user ID
                const book = new Book({
                    ...bookData,
                    addedBy: adminUser._id
                });
                await book.save();
                createdCount++;
                log.success(`Added book: ${bookData.title}`);
            } else {
                log.info(`Book already exists: ${bookData.title}`);
            }
        }

        if (createdCount > 0) {
            log.success(`Successfully added ${createdCount} new books to the library`);
        } else {
            log.info('All sample books already exist in the database');
        }

        return createdCount;
    } catch (error) {
        log.error(`Failed to create sample books: ${error.message}`);
        throw error;
    }
}

/**
 * Display database statistics
 */
async function showDatabaseStats() {
    try {
        const userCount = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const studentCount = await User.countDocuments({ role: 'student' });
        const bookCount = await Book.countDocuments();
        const availableBooks = await Book.countDocuments({ availableCopies: { $gt: 0 } });

        log.header('Database Statistics');
        console.log(`📊 Total Users: ${userCount}`);
        console.log(`   ├─ Admins: ${adminCount}`);
        console.log(`   └─ Students: ${studentCount}`);
        console.log(`\n📚 Total Books: ${bookCount}`);
        console.log(`   └─ Available: ${availableBooks}`);
    } catch (error) {
        log.error(`Failed to fetch statistics: ${error.message}`);
    }
}

/**
 * Interactive setup menu
 */
async function interactiveSetup() {
    log.header('Library Management System - Backend Setup');

    console.log('This setup wizard will help you initialize your backend.\n');

    const answer = await question('Do you want to create test users and sample books? (y/n): ');
    const createTestData = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';

    return createTestData;
}

/**
 * Main setup function
 */
async function setup() {
    try {
        // Connect to database
        log.header('Database Connection');
        const connected = await connectDatabase();
        if (!connected) {
            process.exit(1);
        }

        // Interactive mode or check command line args
        const args = process.argv.slice(2);
        const isFullSetup = args.includes('--full') || args.includes('-f');
        const isQuiet = args.includes('--quiet') || args.includes('-q');

        let createTestData = isFullSetup;

        if (!isQuiet && !isFullSetup) {
            createTestData = await interactiveSetup();
        }

        // Create admin user (always)
        log.header('Admin User Setup');
        await createAdminUser();

        // Create test users if requested
        if (createTestData) {
            log.header('Test Users Setup');
            await createTestUsers();

            // Create sample books
            log.header('Sample Books Setup');
            await createSampleBooks();
        }

        // Show statistics
        await showDatabaseStats();

        // Success message
        log.header('Setup Complete! 🎉');
        log.success('Your backend is ready to use!');
        console.log('\n💡 Next steps:');
        console.log('   1. Review the credentials printed above');
        console.log('   2. Start the server with: npm start');
        console.log('   3. Access the API at: http://localhost:5000\n');

        process.exit(0);
    } catch (error) {
        log.error(`Setup failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run setup
if (require.main === module) {
    setup();
}

module.exports = { setup };
