const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        trim: true,
        match: [/^\d{5}$/, 'Roll number must be 5 digits (e.g., 24305)']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['student', 'librarian', 'admin'],
        default: 'student'
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\d{10}$/, 'Phone number must be 10 digits']
    },
    year: {
        type: Number,
        required: function () {
            return this.role === 'student';
        },
        min: [1, 'Year must be between 1 and 4'],
        max: [4, 'Year must be between 1 and 4']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    profileImage: {
        type: String,
        default: ''
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    borrowingHistory: [{
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        issueDate: Date,
        returnDate: Date,
        dueDate: Date,
        status: {
            type: String,
            enum: ['issued', 'returned', 'overdue'],
            default: 'issued'
        }
    }],
    currentlyBorrowed: {
        type: Number,
        default: 0,
        max: [5, 'Cannot borrow more than 5 books at a time']
    },
    totalFines: {
        type: Number,
        default: 0
    },
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries (email and studentId already have unique: true)
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
    const user = this.toObject();
    delete user.password;
    delete user.emailVerificationToken;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    return user;
};

// Static method to find students by year
userSchema.statics.findStudentsByYear = function (year) {
    return this.find({ role: 'student', year: year, isApproved: true });
};

// Static method to get approved students count
userSchema.statics.getApprovedStudentsCount = function () {
    return this.countDocuments({ role: 'student', isApproved: true });
};

module.exports = mongoose.model('User', userSchema);