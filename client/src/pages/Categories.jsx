import React, { useState, useEffect } from 'react';
import {
    FolderOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    BookOpen
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Categories = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Predefined EE categories
    const predefinedCategories = [
        { name: 'Circuit Theory', description: 'Analysis of electrical circuits, network theorems, and circuit analysis techniques', bookCount: 0 },
        { name: 'Electromagnetic Fields', description: 'Electromagnetic theory, wave propagation, and field analysis', bookCount: 0 },
        { name: 'Power Systems', description: 'Power generation, transmission, distribution, and protection systems', bookCount: 0 },
        { name: 'Control Systems', description: 'Automatic control theory, feedback systems, and control design', bookCount: 0 },
        { name: 'Electrical Machines', description: 'DC machines, AC machines, transformers, and special machines', bookCount: 0 },
        { name: 'Power Electronics', description: 'Power semiconductor devices, converters, and motor drives', bookCount: 0 },
        { name: 'Digital Electronics', description: 'Digital logic design, combinational and sequential circuits', bookCount: 0 },
        { name: 'Analog Electronics', description: 'Analog circuits, amplifiers, oscillators, and filters', bookCount: 0 },
        { name: 'Microprocessors', description: 'Microprocessor architecture, programming, and interfacing', bookCount: 0 },
        { name: 'VLSI Design', description: 'Very Large Scale Integration design and fabrication', bookCount: 0 },
        { name: 'Signal Processing', description: 'Digital signal processing, filters, and transforms', bookCount: 0 },
        { name: 'Communication Systems', description: 'Analog and digital communication systems', bookCount: 0 },
        { name: 'Antenna Theory', description: 'Antenna design, propagation, and wireless communication', bookCount: 0 },
        { name: 'Instrumentation', description: 'Measurement systems and instrumentation techniques', bookCount: 0 },
        { name: 'Renewable Energy', description: 'Solar, wind, and other renewable energy systems', bookCount: 0 },
        { name: 'Electric Drives', description: 'Motor control and electric drive systems', bookCount: 0 },
        { name: 'High Voltage Engineering', description: 'High voltage generation, measurement, and insulation', bookCount: 0 },
        { name: 'Network Analysis', description: 'Network theorems, graph theory, and network synthesis', bookCount: 0 },
        { name: 'General', description: 'General electrical engineering topics and reference materials', bookCount: 0 }
    ];

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/books`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const books = response.data.data.books || [];

                // Count books per category
                const categoryCounts = {};
                books.forEach(book => {
                    const cat = book.category || 'General';
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                });

                // Update predefined categories with actual counts
                const categoriesWithCounts = predefinedCategories.map(cat => ({
                    ...cat,
                    bookCount: categoryCounts[cat.name] || 0
                }));

                setCategories(categoriesWithCounts);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = searchQuery
        ? categories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : categories;

    const handleAddCategory = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            // For now, just show a message that categories are predefined
            setError('Predefined categories cannot be modified. You can add custom categories through book management.');
        } else {
            setError('Custom categories are automatically created when you add books. Use the Add Book page to create books with new categories.');
        }
    };

    const handleDelete = () => {
        setError('Cannot delete predefined categories. Categories with no books will not appear in filters.');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Categories</h1>
                                <p className="text-slate-600">Manage electrical engineering book categories</p>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Add Category
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Total Categories</p>
                                        <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <FolderOpen className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Active Categories</p>
                                        <p className="text-3xl font-bold text-emerald-600">
                                            {categories.filter(c => c.bookCount > 0).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Total Books</p>
                                        <p className="text-3xl font-bold text-indigo-600">
                                            {categories.reduce((sum, cat) => sum + cat.bookCount, 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Categories Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full flex items-center justify-center py-16">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="col-span-full text-center py-16">
                                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500 text-lg">No categories found</p>
                                </div>
                            ) : (
                                filteredCategories.map((category, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                    <FolderOpen className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{category.name}</h3>
                                                    <p className="text-sm text-slate-600">{category.bookCount} books</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete()}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                                        {category.bookCount > 0 ? (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm font-medium text-emerald-700">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-600">No books</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-800 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <p className="text-emerald-800 text-sm">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Circuit Theory"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category..."
                                    rows="3"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingCategory ? 'Save Changes' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
