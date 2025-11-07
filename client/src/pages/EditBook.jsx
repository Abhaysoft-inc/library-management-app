import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    BookMarked,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'https://library-management-server-fk6j.onrender.com/api';

const EditBook = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        author: [],
        ISBN: '',
        publisher: '',
        publishedYear: '',
        edition: '',
        category: '',
        subject: '',
        language: 'English',
        pages: '',
        description: '',
        totalCopies: '',
        availableCopies: '',
        price: '',
        condition: 'good',
        tags: []
    });

    const categories = [
        'Circuit Theory', 'Electromagnetic Fields', 'Power Systems',
        'Control Systems', 'Electrical Machines', 'Power Electronics',
        'Digital Electronics', 'Analog Electronics', 'Microprocessors',
        'VLSI Design', 'Signal Processing', 'Communication Systems',
        'Antenna Theory', 'Instrumentation', 'Renewable Energy',
        'Electric Drives', 'High Voltage Engineering', 'Network Analysis',
        'General'
    ];

    useEffect(() => {
        fetchBookDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchBookDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const book = response.data.data;
                setFormData({
                    title: book.title || '',
                    author: book.author || [],
                    ISBN: book.ISBN || '',
                    publisher: book.publisher || '',
                    publishedYear: book.publishedYear || '',
                    edition: book.edition || '',
                    category: book.category || '',
                    subject: book.subject || '',
                    language: book.language || 'English',
                    pages: book.pages || '',
                    description: book.description || '',
                    totalCopies: book.totalCopies || '',
                    availableCopies: book.availableCopies || '',
                    price: book.price || '',
                    condition: book.condition || 'good',
                    tags: book.tags || []
                });
            }
        } catch (error) {
            console.error('Error fetching book:', error);
            setError('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
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

    const handleArrayInput = (e, field) => {
        const value = e.target.value;
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({
            ...prev,
            [field]: array
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/books/${id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess('Book updated successfully!');
                setTimeout(() => {
                    navigate('/admin/books');
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating book:', error);
            setError(error.response?.data?.message || 'Failed to update book');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50">
                <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                            <p className="text-slate-600">Loading book details...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Book</h1>
                                <p className="text-slate-600">Update book information</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/books')}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                        </div>

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

                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Author */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Author(s) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.author.join(', ')}
                                        onChange={(e) => handleArrayInput(e, 'author')}
                                        placeholder="Enter authors separated by commas"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Separate multiple authors with commas</p>
                                </div>

                                {/* ISBN */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        ISBN
                                    </label>
                                    <input
                                        type="text"
                                        name="ISBN"
                                        value={formData.ISBN}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Publisher */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Publisher <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="publisher"
                                        value={formData.publisher}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Published Year */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Published Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="publishedYear"
                                        value={formData.publishedYear}
                                        onChange={handleInputChange}
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Edition */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Edition
                                    </label>
                                    <input
                                        type="text"
                                        name="edition"
                                        value={formData.edition}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Language
                                    </label>
                                    <input
                                        type="text"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Pages */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Pages
                                    </label>
                                    <input
                                        type="number"
                                        name="pages"
                                        value={formData.pages}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Total Copies */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Total Copies <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="totalCopies"
                                        value={formData.totalCopies}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Available Copies */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Available Copies <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="availableCopies"
                                        value={formData.availableCopies}
                                        onChange={handleInputChange}
                                        min="0"
                                        max={formData.totalCopies}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Condition
                                    </label>
                                    <select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags.join(', ')}
                                        onChange={(e) => handleArrayInput(e, 'tags')}
                                        placeholder="Enter tags separated by commas"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Separate tags with commas</p>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        maxLength="1000"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formData.description.length}/1000 characters
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/books')}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
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

export default EditBook;
