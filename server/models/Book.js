const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    isbn: {
        type: String,
        unique: false,
        trim: true,
    },
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    author: {
        type: [String],
        required: [true, 'At least one author is required'],
        validate: {
            validator: function (authors) {
                return authors && authors.length > 0;
            },
            message: 'At least one author is required'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Electronics',
            'Power Systems',
            'Control Systems',
            'Electrical Machines',
            'Power Electronics',
            'Renewable Energy',
            'Circuit Analysis',
            'Digital Electronics',
            'Analog Electronics',
            'Microprocessors',
            'Signal Processing',
            'Communication Systems',
            'Electromagnetic Theory',
            'General Engineering',
            'Mathematics',
            'Physics',
            'Research Papers',
            'Journals'
        ]
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    publisher: {
        type: String,
        required: [true, 'Publisher is required'],
        trim: true
    },
    publishedYear: {
        type: Number,
        required: [true, 'Published year is required'],
        min: [1900, 'Published year must be after 1900'],
        max: [new Date().getFullYear(), 'Published year cannot be in the future']
    },
    edition: {
        type: String,
        trim: true
    },
    pages: {
        type: Number,
        min: [1, 'Number of pages must be at least 1']
    },
    language: {
        type: String,
        default: 'English',
        trim: true
    },
    totalCopies: {
        type: Number,
        required: [true, 'Total copies is required'],
        min: [1, 'Total copies must be at least 1'],
        max: [100, 'Total copies cannot exceed 100']
    },
    availableCopies: {
        type: Number,
        required: [true, 'Available copies is required'],
        min: [0, 'Available copies cannot be negative'],
        validate: {
            validator: function (available) {
                return available <= this.totalCopies;
            },
            message: 'Available copies cannot exceed total copies'
        }
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
        type: String,
        default: ''
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    condition: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor'],
        default: 'Good'
    },
    tags: [String],
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot be more than 5']
        },
        comment: {
            type: String,
            maxlength: [500, 'Review comment cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    borrowHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        issueDate: Date,
        returnDate: Date,
        condition: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', subject: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ availableCopies: 1 });
bookSchema.index({ 'ratings.average': -1 });

// Update available copies when total copies change
bookSchema.pre('save', function (next) {
    if (this.isModified('totalCopies') && !this.isModified('availableCopies')) {
        // If total copies increased, increase available copies by the same amount
        if (this.isNew) {
            this.availableCopies = this.totalCopies;
        }
    }
    next();
});

// Static method to search books
bookSchema.statics.searchBooks = function (query, filters = {}) {
    const searchQuery = {};

    if (query) {
        searchQuery.$text = { $search: query };
    }

    if (filters.category) {
        searchQuery.category = filters.category;
    }

    if (filters.availableOnly) {
        searchQuery.availableCopies = { $gt: 0 };
    }

    if (filters.year) {
        searchQuery.publishedYear = filters.year;
    }

    searchQuery.isActive = true;

    return this.find(searchQuery)
        .populate('addedBy', 'name')
        .sort({ 'ratings.average': -1, title: 1 });
};

// Static method to get popular books
bookSchema.statics.getPopularBooks = function (limit = 10) {
    return this.find({ isActive: true })
        .sort({ 'ratings.average': -1, 'ratings.count': -1 })
        .limit(limit)
        .populate('addedBy', 'name');
};

// Method to calculate average rating
bookSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.ratings.average = 0;
        this.ratings.count = 0;
        return;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings.average = sum / this.reviews.length;
    this.ratings.count = this.reviews.length;
};

// Method to check if book is available
bookSchema.methods.isAvailable = function () {
    return this.availableCopies > 0 && this.isActive;
};

module.exports = mongoose.model('Book', bookSchema);