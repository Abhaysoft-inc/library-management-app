import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    BookOpen,
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Eye,
    Calendar,
    ArrowLeft,
    Send,
    Clock,
    AlertCircle,
    TrendingUp,
    UserCheck,
    UserX,
    Menu,
    X,
    BarChart3,
    BookMarked,
    ArrowRightLeft
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const LibrarianDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dashboard data state
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalBooks: 0,
            issuedBooks: 0,
            totalStudents: 0,
            pendingReturns: 0,
            overdueBooks: 0
        },
        books: [],
        students: [],
        transactions: [],
        pendingStudents: []
    });

    // Form states
    const [showAddBookForm, setShowAddBookForm] = useState(false);
    const [showIssueBookForm, setShowIssueBookForm] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [editingBook, setEditingBook] = useState(null);

    const [newBook, setNewBook] = useState({
        isbn: '',
        title: '',
        author: '',
        category: '',
        subject: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        totalCopies: 1,
        description: ''
    });

    const [issueBookData, setIssueBookData] = useState({
        bookId: '',
        studentId: '',
        notes: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all necessary data
            const [booksRes, studentsRes, transactionsRes, pendingStudentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/books?limit=100`, { headers }),
                axios.get(`${API_BASE_URL}/students?limit=100`, { headers }),
                axios.get(`${API_BASE_URL}/transactions?limit=50`, { headers }),
                axios.get(`${API_BASE_URL}/students/pending/list`, { headers })
            ]);

            const books = booksRes.data.data?.books || [];
            const students = studentsRes.data.data?.students || [];
            const transactions = transactionsRes.data.data?.transactions || [];
            const pendingStudents = pendingStudentsRes.data.data?.students || [];

            // Calculate stats
            const issuedBooks = transactions.filter(t => t.status === 'issued').length;
            const overdueBooks = transactions.filter(t => {
                if (t.status === 'issued' && t.dueDate) {
                    return new Date(t.dueDate) < new Date();
                }
                return false;
            }).length;

            setDashboardData({
                stats: {
                    totalBooks: books.length,
                    issuedBooks,
                    totalStudents: students.length,
                    pendingReturns: issuedBooks,
                    overdueBooks
                },
                books,
                students,
                transactions,
                pendingStudents
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Add new book
    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/books`, {
                ...newBook,
                author: newBook.author.split(',').map(a => a.trim())
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form and refresh data
            setNewBook({
                isbn: '',
                title: '',
                author: '',
                category: '',
                subject: '',
                publisher: '',
                publishedYear: new Date().getFullYear(),
                totalCopies: 1,
                description: ''
            });
            setShowAddBookForm(false);
            fetchDashboardData();
            alert('Book added successfully!');
        } catch (error) {
            console.error('Error adding book:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add book. Please try again.';
            alert(errorMessage);
        }
    };

    // Issue book to student
    const handleIssueBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Prepare data according to API requirements (only studentId and bookId)
            const issueData = {
                studentId: issueBookData.studentId,
                bookId: issueBookData.bookId,
                notes: issueBookData.notes || '' // Optional notes field
            };

            await axios.post(`${API_BASE_URL}/transactions/issue`, issueData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form and refresh data
            setIssueBookData({ bookId: '', studentId: '', dueDate: '', notes: '' });
            setShowIssueBookForm(false);
            fetchDashboardData();
            alert('Book issued successfully!');
        } catch (error) {
            console.error('Error issuing book:', error);
            alert(error.response?.data?.message || 'Failed to issue book. Please try again.');
        }
    };

    // Collect book from student
    const handleCollectBook = async (transactionId) => {
        try {
            const notes = prompt('Add any notes about the book collection (optional):');

            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/transactions/collect/${transactionId}`, {
                notes: notes || '',
                bookCondition: 'good' // Default condition, could be made dynamic later
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchDashboardData();
            alert(response.data.message);
        } catch (error) {
            console.error('Error collecting book:', error);
            alert(error.response?.data?.message || 'Failed to collect book. Please try again.');
        }
    };

    // Approve student
    const handleApproveStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/students/${studentId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
            alert('Student approved successfully!');
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Failed to approve student. Please try again.');
        }
    };

    // Reject student
    const handleRejectStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/students/${studentId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
            alert('Student rejected successfully!');
        } catch (error) {
            console.error('Error rejecting student:', error);
            alert('Failed to reject student. Please try again.');
        }
    };

    // Delete book
    const handleDeleteBook = async (bookId) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/books/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
            alert('Book deleted successfully!');
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book. Please try again.');
        }
    };

    // Edit book
    const handleEditBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/books/${editingBook._id}`, {
                ...editingBook,
                author: typeof editingBook.author === 'string'
                    ? editingBook.author.split(',').map(a => a.trim())
                    : editingBook.author
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEditingBook(null);
            fetchDashboardData();
            alert('Book updated successfully!');
        } catch (error) {
            console.error('Error updating book:', error);
            alert('Failed to update book. Please try again.');
        }
    }; const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    // Filter data based on search term
    const filteredBooks = dashboardData.books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudents = dashboardData.students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
                        <BookOpen className="h-8 w-8 text-white mr-2" />
                        <h1 className="text-xl font-bold text-white">LibraryMS</h1>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-600">Librarian</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4">
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview'
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <TrendingUp className="h-5 w-5 mr-3" />
                                Dashboard Overview
                            </button>

                            <button
                                onClick={() => setActiveTab('books')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'books'
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <BookOpen className="h-5 w-5 mr-3" />
                                Manage Books
                            </button>

                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'transactions'
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Send className="h-5 w-5 mr-3" />
                                Transactions
                            </button>

                            <button
                                onClick={() => setActiveTab('students')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'students'
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Users className="h-5 w-5 mr-3" />
                                Students
                            </button>

                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pending'
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <UserCheck className="h-5 w-5 mr-3" />
                                Pending Approvals
                                {dashboardData.pendingStudents.length > 0 && (
                                    <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {dashboardData.pendingStudents.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Quick Actions Section */}
                        <div className="mt-8">
                            <h3 className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowAddBookForm(true)}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
                                >
                                    <Plus className="h-4 w-4 mr-3" />
                                    Add New Book
                                </button>
                                <button
                                    onClick={() => setShowIssueBookForm(true)}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
                                >
                                    <Send className="h-4 w-4 mr-3" />
                                    Issue Book
                                </button>
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 lg:ml-64">
                    {/* Top Header */}
                    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                        <div className="px-4 sm:px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {/* Mobile menu button */}
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                                        aria-label="Open sidebar"
                                    >
                                        <Menu className="h-6 w-6" />
                                    </button>
                                    <div className="ml-4 lg:ml-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                            {activeTab === 'overview' && 'Dashboard Overview'}
                                            {activeTab === 'books' && 'Manage Books'}
                                            {activeTab === 'transactions' && 'Book Transactions'}
                                            {activeTab === 'students' && 'Student Management'}
                                            {activeTab === 'pending' && 'Pending Approvals'}
                                        </h1>
                                        <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user?.name}</p>
                                    </div>
                                </div>

                            {/* Stats Summary */}
                            <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Total Books</p>
                                    <p className="text-sm sm:text-lg font-bold text-blue-600">{dashboardData.books.length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Students</p>
                                    <p className="text-sm sm:text-lg font-bold text-green-600">{dashboardData.students.length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Issued</p>
                                    <p className="text-sm sm:text-lg font-bold text-orange-600">{dashboardData.stats.issuedBooks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                                    <p className="text-sm sm:text-lg font-bold text-red-600">{dashboardData.stats.overdueBooks}</p>
                                </div>
                            </div>
                        </div>
                        {error && (
                            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Books</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalBooks}</p>
                                        </div>
                                        <BookOpen className="h-12 w-12 text-blue-500" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Issued Books</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.issuedBooks}</p>
                                        </div>
                                        <CheckCircle className="h-12 w-12 text-green-500" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Students</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalStudents}</p>
                                        </div>
                                        <Users className="h-12 w-12 text-purple-500" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Pending Students</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.pendingStudents.length}</p>
                                        </div>
                                        <Clock className="h-12 w-12 text-orange-500" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.overdueBooks}</p>
                                        </div>
                                        <AlertCircle className="h-12 w-12 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => setShowAddBookForm(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add New Book</span>
                                    </button>
                                    <button
                                        onClick={() => setShowIssueBookForm(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Issue Book</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Clock className="h-4 w-4" />
                                        <span>Pending Approvals ({dashboardData.pendingStudents.length})</span>
                                    </button>
                                </div>
                            </div>

                            {/* Overview Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Books */}
                                <div className="bg-white rounded-lg shadow-md">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Books</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {dashboardData.books.slice(0, 5).map((book) => (
                                                <div key={book._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{book.title}</p>
                                                        <p className="text-sm text-gray-600">{book.author?.join(', ')}</p>
                                                        <p className="text-sm text-gray-500">Available: {book.availableCopies}/{book.totalCopies}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${book.availableCopies > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Transactions */}
                                <div className="bg-white rounded-lg shadow-md">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {dashboardData.transactions.slice(0, 5).map((transaction) => (
                                                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{transaction.bookId?.title}</p>
                                                        <p className="text-sm text-gray-600">{transaction.studentId?.name}</p>
                                                        <p className="text-sm text-gray-500">Due: {formatDate(transaction.dueDate)}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === 'issued' && isOverdue(transaction.dueDate)
                                                        ? 'bg-red-100 text-red-800'
                                                        : transaction.status === 'issued'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {transaction.status === 'issued' && isOverdue(transaction.dueDate)
                                                            ? 'Overdue'
                                                            : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'books' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Book Management</h3>
                                    <div className="flex space-x-4">
                                        <div className="relative">
                                            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search books..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowAddBookForm(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Add Book</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {filteredBooks.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8">No books found</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copies</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredBooks.map((book) => (
                                                    <tr key={book._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                                                <div className="text-sm text-gray-500">{book.author?.join(', ')}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.category}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {book.availableCopies}/{book.totalCopies}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${book.availableCopies > 0
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => setSelectedBook(book)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingBook(book)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBook(book._id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Book Transactions</h3>
                                    <button
                                        onClick={() => setShowIssueBookForm(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Issue Book</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {dashboardData.transactions.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8">No transactions found</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {dashboardData.transactions.map((transaction) => (
                                                    <tr key={transaction._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{transaction.bookId?.title}</div>
                                                            <div className="text-sm text-gray-500">{transaction.bookId?.author?.join(', ')}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{transaction.studentId?.name}</div>
                                                            <div className="text-sm text-gray-500">{transaction.studentId?.studentId}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(transaction.issueDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(transaction.dueDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === 'issued' && isOverdue(transaction.dueDate)
                                                                ? 'bg-red-100 text-red-800'
                                                                : transaction.status === 'issued'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                {transaction.status === 'issued' && isOverdue(transaction.dueDate)
                                                                    ? 'Overdue'
                                                                    : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {transaction.status === 'issued' && (
                                                                <button
                                                                    onClick={() => handleCollectBook(transaction._id)}
                                                                    className="bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition-colors text-xs"
                                                                    title="Collect book from student"
                                                                >
                                                                    Collect Book
                                                                </button>
                                                            )}
                                                            {transaction.status === 'returned' && (
                                                                <span className="text-green-600 text-xs">Completed</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
                                    <div className="relative">
                                        <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {filteredStudents.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8">No students found</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredStudents.map((student) => (
                                                    <tr key={student._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                            <div className="text-sm text-gray-500">{student.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.studentId}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.branch}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.isApproved && student.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : !student.isApproved
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {student.isApproved && student.isActive ? 'Active' : !student.isApproved ? 'Pending' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Pending Student Approvals</h3>
                            </div>
                            <div className="p-6">
                                {dashboardData.pendingStudents.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8">No pending approvals</p>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData.pendingStudents.map((student) => (
                                            <div key={student._id} className="border border-gray-200 rounded-lg p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-medium text-gray-900">{student.name}</h4>
                                                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <strong>Student ID:</strong> {student.studentId}
                                                            </div>
                                                            <div>
                                                                <strong>Email:</strong> {student.email}
                                                            </div>
                                                            <div>
                                                                <strong>Phone:</strong> {student.phone}
                                                            </div>
                                                            <div>
                                                                <strong>Branch:</strong> {student.branch}
                                                            </div>
                                                            <div>
                                                                <strong>Year:</strong> {student.year}
                                                            </div>
                                                            <div>
                                                                <strong>Registered:</strong> {formatDate(student.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-3 ml-6">
                                                        <button
                                                            onClick={() => handleApproveStudent(student._id)}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center space-x-2"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectStudent(student._id)}
                                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 flex items-center space-x-2"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add Book Modal */}
                    {showAddBookForm && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Add New Book</h3>
                                    <button
                                        onClick={() => setShowAddBookForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddBook} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={newBook.title}
                                                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ISBN (Optional)</label>
                                            <input
                                                type="text"
                                                value={newBook.isbn || ''}
                                                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                                                placeholder="10 or 13 digit ISBN"
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Author(s) (comma separated)</label>
                                            <input
                                                type="text"
                                                required
                                                value={newBook.author}
                                                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <select
                                                required
                                                value={newBook.category}
                                                onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select a category</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Power Systems">Power Systems</option>
                                                <option value="Control Systems">Control Systems</option>
                                                <option value="Electrical Machines">Electrical Machines</option>
                                                <option value="Power Electronics">Power Electronics</option>
                                                <option value="Renewable Energy">Renewable Energy</option>
                                                <option value="Circuit Analysis">Circuit Analysis</option>
                                                <option value="Digital Electronics">Digital Electronics</option>
                                                <option value="Analog Electronics">Analog Electronics</option>
                                                <option value="Microprocessors">Microprocessors</option>
                                                <option value="Signal Processing">Signal Processing</option>
                                                <option value="Communication Systems">Communication Systems</option>
                                                <option value="Electromagnetic Theory">Electromagnetic Theory</option>
                                                <option value="General Engineering">General Engineering</option>
                                                <option value="Mathematics">Mathematics</option>
                                                <option value="Physics">Physics</option>
                                                <option value="Research Papers">Research Papers</option>
                                                <option value="Journals">Journals</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={newBook.subject}
                                                onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                            <input
                                                type="text"
                                                required
                                                value={newBook.publisher}
                                                onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Published Year</label>
                                            <input
                                                type="number"
                                                required
                                                value={newBook.publishedYear}
                                                onChange={(e) => setNewBook({ ...newBook, publishedYear: parseInt(e.target.value) })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Copies</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={newBook.totalCopies}
                                                onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={newBook.description}
                                            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                                            rows="3"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddBookForm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Add Book
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Issue Book Modal */}
                    {showIssueBookForm && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Issue Book</h3>
                                    <button
                                        onClick={() => setShowIssueBookForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleIssueBook} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Book</label>
                                        <select
                                            required
                                            value={issueBookData.bookId}
                                            onChange={(e) => setIssueBookData({ ...issueBookData, bookId: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a book</option>
                                            {dashboardData.books.filter(book => book.availableCopies > 0).map(book => (
                                                <option key={book._id} value={book._id}>
                                                    {book.title} (Available: {book.availableCopies})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                        <select
                                            required
                                            value={issueBookData.studentId}
                                            onChange={(e) => setIssueBookData({ ...issueBookData, studentId: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a student</option>
                                            {dashboardData.students.filter(student => student.isApproved && student.isActive).map(student => (
                                                <option key={student._id} value={student._id}>
                                                    {student.name} ({student.studentId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                        <textarea
                                            value={issueBookData.notes}
                                            onChange={(e) => setIssueBookData({ ...issueBookData, notes: e.target.value })}
                                            placeholder="Any additional notes about this book issue..."
                                            rows="3"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Due date will be automatically set to 14 days from today</p>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowIssueBookForm(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Issue Book
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Book Details Modal */}
                    {selectedBook && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Book Details</h3>
                                    <button
                                        onClick={() => setSelectedBook(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-900">{selectedBook.title}</h4>
                                        <p className="text-gray-600">by {selectedBook.author?.join(', ')}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <strong>Category:</strong> {selectedBook.category}
                                        </div>
                                        <div>
                                            <strong>Subject:</strong> {selectedBook.subject}
                                        </div>
                                        <div>
                                            <strong>Publisher:</strong> {selectedBook.publisher}
                                        </div>
                                        <div>
                                            <strong>Published:</strong> {selectedBook.publishedYear}
                                        </div>
                                        <div>
                                            <strong>Total Copies:</strong> {selectedBook.totalCopies}
                                        </div>
                                        <div>
                                            <strong>Available:</strong> {selectedBook.availableCopies}
                                        </div>
                                        <div>
                                            <strong>ISBN:</strong> {selectedBook.isbn || 'N/A'}
                                        </div>
                                    </div>
                                    {selectedBook.description && (
                                        <div>
                                            <strong>Description:</strong>
                                            <p className="mt-1 text-gray-600">{selectedBook.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Book Modal */}
                    {editingBook && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Edit Book</h3>
                                    <button
                                        onClick={() => setEditingBook(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleEditBook} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingBook.title}
                                                onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Author(s) (comma separated)</label>
                                            <input
                                                type="text"
                                                required
                                                value={Array.isArray(editingBook.author) ? editingBook.author.join(', ') : editingBook.author}
                                                onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingBook.category}
                                                onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingBook.subject}
                                                onChange={(e) => setEditingBook({ ...editingBook, subject: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingBook.publisher}
                                                onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Published Year</label>
                                            <input
                                                type="number"
                                                required
                                                value={editingBook.publishedYear}
                                                onChange={(e) => setEditingBook({ ...editingBook, publishedYear: parseInt(e.target.value) })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Copies</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={editingBook.totalCopies}
                                                onChange={(e) => setEditingBook({ ...editingBook, totalCopies: parseInt(e.target.value) })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={editingBook.description || ''}
                                            onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                                            rows="3"
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setEditingBook(null)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Update Book
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
                </div>
            </div>
        </div>
    );
};

export default LibrarianDashboard;