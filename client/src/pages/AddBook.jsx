import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Save,
    X,
    Upload,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'https://library-management-server-fk6j.onrender.com/api';

const AddBook = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        author: '',
        category: '',
        subject: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        edition: '',
        pages: '',
        language: 'English',
        totalCopies: 1,
        availableCopies: 1,
        description: '',
        price: '',
        condition: 'Good',
        tags: ''
    });

    const categories = [
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
    ];

    const conditions = ['New', 'Good', 'Fair', 'Poor'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-update available copies when total copies changes
        if (name === 'totalCopies') {
            setFormData(prev => ({
                ...prev,
                availableCopies: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Process author (convert comma-separated string to array)
            const authors = formData.author.split(',').map(a => a.trim()).filter(a => a);

            // Process tags
            const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];

            const bookData = {
                ...formData,
                author: authors,
                tags: tagsArray,
                totalCopies: parseInt(formData.totalCopies),
                availableCopies: parseInt(formData.availableCopies),
                publishedYear: parseInt(formData.publishedYear),
                pages: formData.pages ? parseInt(formData.pages) : undefined,
                price: formData.price ? parseFloat(formData.price) : undefined
            };

            const response = await axios.post(`${API_BASE_URL}/books`, bookData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess('Book added successfully!');
                setTimeout(() => {
                    navigate('/admin/books');
                }, 1500);
            }
        } catch (error) {
            console.error('Error adding book:', error);
            setError(error.response?.data?.message || 'Failed to add book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Book</h1>
                                <p className="text-slate-600">Add a new book to the library collection</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/books')}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <p className="text-emerald-800 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            {/* Basic Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Book Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter book title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            ISBN
                                        </label>
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="978-3-16-148410-0"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Author(s) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Separate multiple authors with commas"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Example: John Doe, Jane Smith</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat, index) => (
                                                <option key={index} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Power Systems Analysis"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Publication Details */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Publication Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Publisher <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="publisher"
                                            value={formData.publisher}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Publisher name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Published Year <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="publishedYear"
                                            value={formData.publishedYear}
                                            onChange={handleChange}
                                            required
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Edition
                                        </label>
                                        <input
                                            type="text"
                                            name="edition"
                                            value={formData.edition}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., 3rd Edition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pages
                                        </label>
                                        <input
                                            type="number"
                                            name="pages"
                                            value={formData.pages}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Number of pages"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Language
                                        </label>
                                        <input
                                            type="text"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Book price"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Details */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Inventory Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Total Copies <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="totalCopies"
                                            value={formData.totalCopies}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            max="100"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Available Copies <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="availableCopies"
                                            value={formData.availableCopies}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            max={formData.totalCopies}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Condition
                                        </label>
                                        <select
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {conditions.map((cond, index) => (
                                                <option key={index} value={cond}>{cond}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Information</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="4"
                                            maxLength="1000"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Brief description of the book..."
                                        ></textarea>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formData.description.length}/1000 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Separate tags with commas"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Example: electrical engineering, power systems, circuits
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/books')}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Adding Book...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Add Book
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddBook;
