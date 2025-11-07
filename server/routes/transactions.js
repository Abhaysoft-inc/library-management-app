const express = require('express');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { authenticate, authorize, checkApproval } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Helper function to ensure book has all required fields before saving
const ensureBookFields = (book, userId) => {
    if (!book.addedBy) {
        book.addedBy = userId;
    }

    if (!book.publishedYear) {
        book.publishedYear = 2000;
    }
    return book;
};

// @route   GET /api/transactions
// @desc    Get all transactions (for admins)
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50, status, studentId, bookId } = req.query;

        // Build query object
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (studentId) {
            query.studentId = studentId;
        }
        if (bookId) {
            query.bookId = bookId;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get transactions with populated fields
        const transactions = await Transaction.find(query)
            .populate('studentId', 'name email studentId')
            .populate('bookId', 'title author ISBN')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await Transaction.countDocuments(query);

        // Transform data to match frontend expectations
        const transformedTransactions = transactions.map(t => ({
            ...t,
            student: t.studentId,
            book: t.bookId,
            fine: t.fine?.amount || 0,
            finePaid: t.fine?.isPaid || false
        }));

        res.json({
            success: true,
            data: {
                transactions: transformedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalTransactions: total,
                    hasNextPage: skip + transactions.length < total,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transactions'
        });
    }
});

// @route   GET /api/transactions/my-transactions
// @desc    Get current user's transactions
// @access  Private (Student)
router.get('/my-transactions', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { studentId: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const transactions = await Transaction.find(query)
            .populate('bookId', 'title author isbn image category')
            .populate('issuedBy', 'name')
            .populate('returnProcessedBy', 'name')
            .sort({ issueDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalTransactions: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get my transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving transactions'
        });
    }
});

// @route   POST /api/transactions/issue
// @desc    Issue a book to a student
// @access  Private (Admin only)
router.post('/issue', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { studentId, bookId, notes } = req.body;

        if (!studentId || !bookId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and Book ID are required'
            });
        }

        // Verify student exists and is approved
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student' || !student.isApproved) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or not approved'
            });
        }

        // Verify book exists and is available
        const book = await Book.findById(bookId);
        if (!book || !book.isActive || book.availableCopies <= 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not available'
            });
        }

        // Check if student has reached borrowing limit
        const activeTransactions = await Transaction.countDocuments({
            studentId,
            status: { $in: ['issued', 'overdue'] }
        });

        if (activeTransactions >= 5) {
            return res.status(400).json({
                success: false,
                message: 'Student has reached maximum borrowing limit (5 books)'
            });
        }

        // Check if student already has this book
        const existingTransaction = await Transaction.findOne({
            studentId,
            bookId,
            status: { $in: ['issued', 'overdue'] }
        });

        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                message: 'Student already has this book issued'
            });
        }

        // Check for unpaid fines
        const unpaidFines = await Transaction.find({
            studentId,
            'fine.isPaid': false,
            'fine.amount': { $gt: 0 }
        });

        if (unpaidFines.length > 0) {
            const totalFine = unpaidFines.reduce((sum, t) => sum + t.fine.amount, 0);
            return res.status(400).json({
                success: false,
                message: `Student has unpaid fines of ₹${totalFine}. Please clear dues before issuing new books.`
            });
        }

        // Create transaction
        const borrowDays = parseInt(process.env.DEFAULT_BORROW_DAYS) || 14;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + borrowDays);

        const transaction = new Transaction({
            studentId,
            bookId,
            dueDate,
            issuedBy: req.user._id,
            notes,
            bookConditionAtIssue: book.condition || 'Good'
        });

        await transaction.save();

        // Update book availability
        book.availableCopies -= 1;
        ensureBookFields(book, req.user._id);
        await book.save();

        // Update student's currently borrowed count
        student.currentlyBorrowed += 1;
        await student.save();

        // Populate transaction with student and book details
        const populatedTransaction = await Transaction.findById(transaction._id)
            .populate('studentId', 'name studentId email')
            .populate('bookId', 'title author isbn')
            .populate('issuedBy', 'name');

        // Send email notification
        notificationService.sendBookIssuedNotification(populatedTransaction);

        res.status(201).json({
            success: true,
            message: 'Book issued successfully',
            data: {
                transaction: populatedTransaction
            }
        });

    } catch (error) {
        console.error('Issue book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while issuing book'
        });
    }
});

// @route   PUT /api/transactions/return/:id
// @desc    Return a book by transaction ID (Student can return their own book)
// @access  Private (Student can return own, Admin/Librarian can return any)
router.put('/return/:id', authenticate, async (req, res) => {
    try {
        const transactionId = req.params.id;

        // Find the transaction
        const transaction = await Transaction.findById(transactionId)
            .populate('studentId', 'name studentId email')
            .populate('bookId', 'title author isbn');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Check if user can return this book
        if (req.user._id.toString() !== transaction.studentId._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (transaction.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Book is already returned'
            });
        }

        // Update transaction
        transaction.status = 'returned';
        transaction.returnDate = new Date();
        transaction.returnProcessedBy = req.user._id;
        await transaction.save();

        // Update book availability
        const book = await Book.findById(transaction.bookId._id);
        if (book) {
            book.availableCopies += 1;
            ensureBookFields(book, req.user._id);
            await book.save();
        }

        res.json({
            success: true,
            message: 'Book returned successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while returning book'
        });
    }
});

// @route   POST /api/transactions/return
// @desc    Return a book
// @access  Private (Admin only)
router.post('/return', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { transactionId, bookCondition, notes } = req.body;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
        }

        // Find the transaction
        const transaction = await Transaction.findById(transactionId)
            .populate('studentId', 'name studentId email')
            .populate('bookId', 'title author isbn');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Book already returned'
            });
        }

        // Calculate fine if overdue
        const fine = transaction.calculateFine();

        // Update transaction
        transaction.returnDate = new Date();
        transaction.actualReturnDate = new Date();
        transaction.status = 'returned';
        transaction.returnProcessedBy = req.user._id;
        transaction.bookConditionAtReturn = bookCondition || 'Good';
        transaction.notes = notes || transaction.notes;

        if (fine > 0) {
            transaction.fine.amount = fine;
            transaction.fine.reason = 'overdue';
        }

        await transaction.save();

        // Update book availability
        const book = await Book.findById(transaction.bookId._id);
        if (book) {
            book.availableCopies += 1;
            if (bookCondition) {
                book.condition = bookCondition;
            }
            ensureBookFields(book, req.user._id);
            await book.save();
        }

        // Update student's currently borrowed count
        const student = await User.findById(transaction.studentId._id);
        if (student) {
            student.currentlyBorrowed = Math.max(0, student.currentlyBorrowed - 1);
            if (fine > 0) {
                student.totalFines += fine;
            }
            await student.save();
        }

        // Send email notification
        notificationService.sendBookReturnedNotification(transaction, fine);

        res.json({
            success: true,
            message: `Book returned successfully${fine > 0 ? ` with fine of ₹${fine}` : ''}`,
            data: {
                transaction,
                fine: fine > 0 ? fine : 0
            }
        });

    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while returning book'
        });
    }
});

// @route   POST /api/transactions/:id/renew
// @desc    Renew a book
// @access  Private (Student own books or Librarian/Admin)
router.post('/:id/renew', authenticate, checkApproval, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('studentId', 'name studentId email')
            .populate('bookId', 'title author isbn');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Check if user can renew this transaction
        if (req.user.role === 'student' && transaction.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only renew your own books'
            });
        }

        if (transaction.status !== 'issued') {
            return res.status(400).json({
                success: false,
                message: 'Only issued books can be renewed'
            });
        }

        if (transaction.renewalCount >= 2) {
            return res.status(400).json({
                success: false,
                message: 'Maximum renewal limit (2) reached'
            });
        }

        // Check for unpaid fines
        if (transaction.fine.amount > 0 && !transaction.fine.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'Please clear outstanding fines before renewal'
            });
        }

        // Renew the book
        transaction.renewBook(req.user._id);
        await transaction.save();

        res.json({
            success: true,
            message: 'Book renewed successfully',
            data: {
                transaction,
                newDueDate: transaction.dueDate
            }
        });

    } catch (error) {
        console.error('Renew book error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while renewing book'
        });
    }
});

// @route   GET /api/transactions/student/:studentId
// @desc    Get student's transaction history
// @access  Private (Own transactions or Admin)
router.get('/student/:studentId', authenticate, async (req, res) => {
    try {
        // Check if user can access these transactions
        if (req.user._id.toString() !== req.params.studentId &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const { page = 1, limit = 10, status } = req.query;

        const query = { studentId: req.params.studentId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const transactions = await Transaction.find(query)
            .populate('bookId', 'title author isbn category')
            .populate('issuedBy', 'name')
            .populate('returnProcessedBy', 'name')
            .sort({ issueDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get student transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transactions'
        });
    }
});

// @route   GET /api/transactions/overdue
// @desc    Get all overdue transactions
// @access  Private (Admin only)
router.get('/overdue', authenticate, authorize('admin'), async (req, res) => {
    try {
        const transactions = await Transaction.findOverdueTransactions();

        // Calculate fines for each transaction
        const transactionsWithFines = transactions.map(transaction => {
            const fine = transaction.calculateFine();
            return {
                ...transaction.toObject(),
                calculatedFine: fine
            };
        });

        res.json({
            success: true,
            data: {
                transactions: transactionsWithFines
            }
        });

    } catch (error) {
        console.error('Get overdue transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching overdue transactions'
        });
    }
});

// @route   GET /api/transactions/due-soon
// @desc    Get transactions due soon (for notifications)
// @access  Private (Admin only)
router.get('/due-soon', authenticate, authorize('admin'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 3;
        const transactions = await Transaction.findDueSoonTransactions(days);

        res.json({
            success: true,
            data: {
                transactions
            }
        });

    } catch (error) {
        console.error('Get due soon transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching due soon transactions'
        });
    }
});

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private (Admin only)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
    try {
        const stats = await Transaction.getTransactionStats();

        // Additional statistics
        const totalIssued = await Transaction.countDocuments({ status: 'issued' });
        const totalOverdue = await Transaction.countDocuments({ status: 'overdue' });
        const totalReturned = await Transaction.countDocuments({ status: 'returned' });

        const totalFines = await Transaction.aggregate([
            { $match: { 'fine.amount': { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$fine.amount' } } }
        ]);

        const unpaidFines = await Transaction.aggregate([
            { $match: { 'fine.amount': { $gt: 0 }, 'fine.isPaid': false } },
            { $group: { _id: null, total: { $sum: '$fine.amount' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalIssued,
                totalOverdue,
                totalReturned,
                totalFines: totalFines[0]?.total || 0,
                unpaidFines: unpaidFines[0]?.total || 0,
                detailedStats: stats
            }
        });

    } catch (error) {
        console.error('Get transaction stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transaction statistics'
        });
    }
});

// @route   POST/PATCH /api/transactions/:id/pay-fine
// @desc    Pay fine for a transaction
// @access  Private (Admin only)
router.post('/:id/pay-fine', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { amount } = req.body;

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.fine.amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No fine to pay'
            });
        }

        if (transaction.fine.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'Fine already paid'
            });
        }

        transaction.fine.isPaid = true;
        transaction.fine.paidDate = new Date();
        transaction.fine.paidAmount = amount || transaction.fine.amount;

        await transaction.save();

        res.json({
            success: true,
            message: 'Fine paid successfully',
            data: {
                transaction
            }
        });

    } catch (error) {
        console.error('Pay fine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing fine payment'
        });
    }
});

// PATCH support for pay-fine
router.patch('/:id/pay-fine', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { amount } = req.body;

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.fine.amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No fine to pay'
            });
        }

        if (transaction.fine.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'Fine already paid'
            });
        }

        transaction.fine.isPaid = true;
        transaction.fine.paidDate = new Date();
        transaction.fine.paidAmount = amount || transaction.fine.amount;

        await transaction.save();

        res.json({
            success: true,
            message: 'Fine paid successfully',
            data: {
                transaction
            }
        });

    } catch (error) {
        console.error('Pay fine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing fine payment'
        });
    }
});

// @route   PUT /api/transactions/collect/:id
// @desc    Collect a book from student (Admin initiated return)
// @access  Private (Admin only)
router.put('/collect/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { id: transactionId } = req.params;
        const { notes, bookCondition = 'good' } = req.body;

        // Find the transaction
        const transaction = await Transaction.findById(transactionId)
            .populate('studentId', 'name studentId email')
            .populate('bookId', 'title author isbn');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Book is already returned'
            });
        }

        if (transaction.status !== 'issued') {
            return res.status(400).json({
                success: false,
                message: 'Book is not currently issued'
            });
        }

        // Calculate fine if overdue
        let fine = 0;
        if (new Date() > new Date(transaction.dueDate)) {
            const overdueDays = Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24));
            fine = overdueDays * 5; // ₹5 per day fine
        }

        // Update transaction
        transaction.status = 'returned';
        transaction.returnDate = new Date();
        transaction.returnProcessedBy = req.user._id;
        transaction.bookCondition = bookCondition;

        if (notes) {
            transaction.notes = (transaction.notes || '') + '\nAdmin Collection: ' + notes;
        }

        if (fine > 0) {
            transaction.fine = {
                amount: fine,
                reason: `Overdue fine for ${Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24))} days`,
                isPaid: false
            };
        }

        await transaction.save();

        // Update book availability
        const book = await Book.findById(transaction.bookId._id);
        if (book) {
            book.availableCopies += 1;
            ensureBookFields(book, req.user._id);
            await book.save();
        }

        res.json({
            success: true,
            message: `Book collected successfully${fine > 0 ? `. Fine of ₹${fine} applied for overdue.` : '.'}`,
            data: {
                transaction,
                fine: fine > 0 ? fine : null
            }
        });

    } catch (error) {
        console.error('Collect book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while collecting book'
        });
    }
});

module.exports = router;