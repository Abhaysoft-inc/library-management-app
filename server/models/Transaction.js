const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID is required']
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book ID is required']
    },
    issueDate: {
        type: Date,
        required: [true, 'Issue date is required'],
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    returnDate: {
        type: Date,
        default: null
    },
    actualReturnDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue', 'lost', 'damaged'],
        default: 'issued'
    },
    fine: {
        amount: {
            type: Number,
            default: 0,
            min: [0, 'Fine amount cannot be negative']
        },
        reason: {
            type: String,
            enum: ['overdue', 'damage', 'lost', 'other'],
            default: 'overdue'
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidDate: Date,
        paidAmount: {
            type: Number,
            default: 0
        }
    },
    renewalCount: {
        type: Number,
        default: 0,
        max: [2, 'Maximum 2 renewals allowed']
    },
    renewalHistory: [{
        renewalDate: {
            type: Date,
            required: true
        },
        oldDueDate: {
            type: Date,
            required: true
        },
        newDueDate: {
            type: Date,
            required: true
        },
        renewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    librarianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Librarian ID is required']
    },
    returnProcessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    bookConditionAtIssue: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor'],
        default: 'Good'
    },
    bookConditionAtReturn: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged', 'Lost']
    },
    notificationsSent: {
        reminder: {
            type: Boolean,
            default: false
        },
        dueDate: {
            type: Boolean,
            default: false
        },
        overdue: [{
            date: Date,
            daysOverdue: Number
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
transactionSchema.index({ studentId: 1, status: 1 });
transactionSchema.index({ bookId: 1 });
transactionSchema.index({ dueDate: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ issueDate: -1 });

// Calculate due date before saving
transactionSchema.pre('save', function (next) {
    if (this.isNew && !this.dueDate) {
        const borrowDays = process.env.DEFAULT_BORROW_DAYS || 14;
        this.dueDate = new Date(this.issueDate.getTime() + (borrowDays * 24 * 60 * 60 * 1000));
    }
    next();
});

// Update status based on dates
transactionSchema.pre('save', function (next) {
    const now = new Date();

    if (this.returnDate && this.status === 'issued') {
        this.status = 'returned';
        this.actualReturnDate = this.returnDate;
    } else if (!this.returnDate && this.dueDate < now && this.status === 'issued') {
        this.status = 'overdue';
    }

    next();
});

// Calculate fine for overdue books
transactionSchema.methods.calculateFine = function () {
    if (this.status !== 'overdue' && this.status !== 'returned') {
        return 0;
    }

    const finePerDay = parseFloat(process.env.FINE_PER_DAY) || 5;
    const returnDate = this.actualReturnDate || new Date();

    if (returnDate <= this.dueDate) {
        return 0;
    }

    const overdueDays = Math.ceil((returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
    return overdueDays * finePerDay;
};

// Method to renew book
transactionSchema.methods.renewBook = function (renewedBy) {
    if (this.renewalCount >= 2) {
        throw new Error('Maximum renewal limit reached');
    }

    if (this.status !== 'issued') {
        throw new Error('Only issued books can be renewed');
    }

    const borrowDays = process.env.DEFAULT_BORROW_DAYS || 14;
    const oldDueDate = this.dueDate;
    const newDueDate = new Date(Date.now() + (borrowDays * 24 * 60 * 60 * 1000));

    this.renewalHistory.push({
        renewalDate: new Date(),
        oldDueDate: oldDueDate,
        newDueDate: newDueDate,
        renewedBy: renewedBy
    });

    this.dueDate = newDueDate;
    this.renewalCount += 1;

    return this;
};

// Static method to find overdue transactions
transactionSchema.statics.findOverdueTransactions = function () {
    const now = new Date();
    return this.find({
        status: { $in: ['issued', 'overdue'] },
        dueDate: { $lt: now },
        returnDate: null
    })
        .populate('studentId', 'name email studentId phone')
        .populate('bookId', 'title author isbn')
        .populate('librarianId', 'name');
};

// Static method to find transactions due soon (for notifications)
transactionSchema.statics.findDueSoonTransactions = function (days = 3) {
    const now = new Date();
    const futureDue = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    return this.find({
        status: 'issued',
        dueDate: {
            $gte: now,
            $lte: futureDue
        },
        returnDate: null,
        'notificationsSent.reminder': false
    })
        .populate('studentId', 'name email studentId phone')
        .populate('bookId', 'title author isbn');
};

// Static method to get student's active transactions
transactionSchema.statics.getStudentActiveTransactions = function (studentId) {
    return this.find({
        studentId: studentId,
        status: { $in: ['issued', 'overdue'] },
        returnDate: null
    })
        .populate('bookId', 'title author isbn image category')
        .sort({ issueDate: -1 });
};

// Static method to get transaction statistics
transactionSchema.statics.getTransactionStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: '$count' },
                statusBreakdown: {
                    $push: {
                        status: '$_id',
                        count: '$count'
                    }
                }
            }
        }
    ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);