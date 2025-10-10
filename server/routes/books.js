const express = require('express');
const Book = require('../models/Book');
const { authenticate, authorize } = require('../middleware/auth');

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

// @route   GET /api/books
// @desc    Get all books with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            availableOnly,
            sortBy = 'title',
            sortOrder = 'asc'
        } = req.query;

        const query = { isActive: true };

        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter available books only
        if (availableOnly === 'true') {
            query.availableCopies = { $gt: 0 };
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const books = await Book.find(query)
            .populate('addedBy', 'name')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Book.countDocuments(query);

        res.json({
            success: true,
            data: {
                books,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching books'
        });
    }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('addedBy', 'name')
            .populate('reviews.userId', 'name');

        if (!book || !book.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            data: { book }
        });

    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching book'
        });
    }
});

// @route   POST /api/books
// @desc    Add new book
// @access  Private (Librarian/Admin)
router.post('/', authenticate, authorize('librarian', 'admin'), async (req, res) => {
    try {
        const {
            isbn,
            title,
            author,
            category,
            subject,
            publisher,
            publishedYear,
            edition,
            pages,
            language,
            totalCopies,
            description,
            location,
            price,
            condition,
            tags
        } = req.body;

        // Validation
        if (!title || !author || !category || !subject || !publisher || !publishedYear || !totalCopies) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if book with ISBN already exists
        if (isbn) {
            const existingBook = await Book.findOne({ isbn, isActive: true });
            if (existingBook) {
                return res.status(400).json({
                    success: false,
                    message: 'Book with this ISBN already exists'
                });
            }
        }

        const book = new Book({
            isbn,
            title,
            author: Array.isArray(author) ? author : [author],
            category,
            subject,
            publisher,
            publishedYear,
            edition,
            pages,
            language,
            totalCopies,
            availableCopies: totalCopies,
            description,
            location: location || { shelf: 'A1', section: 'General', floor: 1 },
            price,
            condition,
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            addedBy: req.user._id
        });

        await book.save();

        const populatedBook = await Book.findById(book._id).populate('addedBy', 'name');

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: { book: populatedBook }
        });

    } catch (error) {
        console.error('Add book error:', error);

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
            message: 'Server error while adding book'
        });
    }
});

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (Librarian/Admin)
router.put('/:id', authenticate, authorize('librarian', 'admin'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book || !book.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const {
            isbn,
            title,
            author,
            category,
            subject,
            publisher,
            publishedYear,
            edition,
            pages,
            language,
            totalCopies,
            description,
            location,
            price,
            condition,
            tags
        } = req.body;

        // Check if ISBN is being changed and if it conflicts
        // if (isbn && isbn !== book.isbn) {
        //     const existingBook = await Book.findOne({ isbn, isActive: true, _id: { $ne: req.params.id } });
        //     if (existingBook) {
        //         return res.status(400).json({
        //             success: false,
        //             message: 'Book with this ISBN already exists'
        //         });
        //     }
        // }

        // Update fields
        book.isbn = isbn || book.isbn;
        book.title = title || book.title;
        book.author = author ? (Array.isArray(author) ? author : [author]) : book.author;
        book.category = category || book.category;
        book.subject = subject || book.subject;
        book.publisher = publisher || book.publisher;
        book.publishedYear = publishedYear || book.publishedYear;
        book.edition = edition || book.edition;
        book.pages = pages || book.pages;
        book.language = language || book.language;
        book.description = description || book.description;
        book.location = location || book.location;
        book.price = price || book.price;
        book.condition = condition || book.condition;
        book.tags = tags ? (Array.isArray(tags) ? tags : [tags]) : book.tags;
        book.lastUpdatedBy = req.user._id;

        // Handle total copies change
        if (totalCopies && totalCopies !== book.totalCopies) {
            const difference = totalCopies - book.totalCopies;
            book.totalCopies = totalCopies;
            book.availableCopies = Math.max(0, book.availableCopies + difference);
        }

        ensureBookFields(book, req.user._id);
        await book.save();

        const updatedBook = await Book.findById(book._id).populate('addedBy', 'name');

        res.json({
            success: true,
            message: 'Book updated successfully',
            data: { book: updatedBook }
        });

    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating book'
        });
    }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (soft delete)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('librarian', 'admin'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        book.isActive = false;
        ensureBookFields(book, req.user._id);
        await book.save();

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });

    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting book'
        });
    }
});

// @route   GET /api/books/categories/list
// @desc    Get all book categories
// @access  Public
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Book.distinct('category', { isActive: true });

        res.json({
            success: true,
            data: { categories }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories'
        });
    }
});

// @route   GET /api/books/popular/list
// @desc    Get popular books
// @access  Public
router.get('/popular/list', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const books = await Book.getPopularBooks(limit);

        res.json({
            success: true,
            data: { books }
        });

    } catch (error) {
        console.error('Get popular books error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching popular books'
        });
    }
});

module.exports = router;