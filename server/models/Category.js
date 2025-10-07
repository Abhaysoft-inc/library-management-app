const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    parentCategory: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#3B82F6'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    bookCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

// Static method to get active categories
categorySchema.statics.getActiveCategories = function () {
    return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Category', categorySchema);