import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Clock, Calendar, User, Search, Filter, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const DashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [userStats, setUserStats] = useState({
        booksIssued: 0,
        booksReturned: 0,
        pendingReturns: 0,
        daysActive: 0
    });
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to view dashboard');
                return;
            }

            // Fetch user transactions
            const transactionsResponse = await axios.get(
                `${API_BASE_URL}/transactions/my-transactions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (transactionsResponse.data.success) {
                const transactions = transactionsResponse.data.data.transactions;

                // Calculate stats
                const totalIssued = transactions.length;
                const returned = transactions.filter(t => t.status === 'returned').length;
                const currentlyIssued = transactions.filter(t => t.status === 'issued' || t.status === 'overdue').length;

                setUserStats({
                    booksIssued: totalIssued,
                    booksReturned: returned,
                    pendingReturns: currentlyIssued,
                    daysActive: user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0
                });

                // Set currently issued books
                const currentBooks = transactions
                    .filter(t => t.status === 'issued' || t.status === 'overdue')
                    .map(t => ({
                        id: t._id,
                        title: t.bookId?.title || 'Unknown Book',
                        author: t.bookId?.author?.join(', ') || 'Unknown Author',
                        issueDate: t.issueDate,
                        dueDate: t.dueDate,
                        status: t.status
                    }));

                setIssuedBooks(currentBooks);

                // Set recent activity
                const recentTrans = transactions
                    .slice(0, 5)
                    .map(t => ({
                        id: t._id,
                        action: t.status === 'returned' ? 'Returned' : 'Issued',
                        book: t.bookId?.title || 'Unknown Book',
                        date: t.status === 'returned' ? t.returnDate : t.issueDate
                    }));

                setRecentActivity(recentTrans);
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');

            // Fallback to sample data for development
            setIssuedBooks([
                {
                    id: 1,
                    title: 'The Great Gatsby',
                    author: 'F. Scott Fitzgerald',
                    issueDate: '2024-01-15',
                    dueDate: '2024-01-29',
                    status: 'issued'
                },
                {
                    id: 2,
                    title: 'To Kill a Mockingbird',
                    author: 'Harper Lee',
                    issueDate: '2024-01-10',
                    dueDate: '2024-01-24',
                    status: 'overdue'
                }
            ]);

            setRecentActivity([
                { id: 1, action: 'Issued', book: 'The Great Gatsby', date: '2024-01-15' },
                { id: 2, action: 'Returned', book: '1984', date: '2024-01-12' },
                { id: 3, action: 'Issued', book: 'To Kill a Mockingbird', date: '2024-01-10' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnBook = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/transactions/return/${transactionId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh dashboard data
            fetchDashboardData();
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Failed to return book. Please try again.');
        }
    };

    const filteredBooks = issuedBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysUntilDue = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name || 'Student'}!
                    </h1>
                    <p className="text-gray-600">
                        Track your reading journey and manage your borrowed books
                    </p>
                    {error && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-yellow-800">{error}</span>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Books Issued</p>
                                <p className="text-3xl font-bold text-blue-600">{userStats.booksIssued}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Books Returned</p>
                                <p className="text-3xl font-bold text-green-600">{userStats.booksReturned}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Returns</p>
                                <p className="text-3xl font-bold text-orange-600">{userStats.pendingReturns}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Days Active</p>
                                <p className="text-3xl font-bold text-purple-600">{userStats.daysActive}</p>
                            </div>
                            <User className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Currently Issued Books */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Currently Issued Books</h2>
                                <Filter className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search your books..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6">
                            {filteredBooks.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-500 mb-2">No books currently issued</h3>
                                    <p className="text-gray-400">Visit the books page to discover and issue new books!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBooks.map((book) => {
                                        const daysUntilDue = getDaysUntilDue(book.dueDate);
                                        const isOverdue = daysUntilDue < 0;

                                        return (
                                            <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                                                        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <span className="text-gray-500">
                                                                Issued: {formatDate(book.issueDate)}
                                                            </span>
                                                            <span className={`font-medium ${isOverdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                                                                Due: {formatDate(book.dueDate)}
                                                                {isOverdue ? ` (${Math.abs(daysUntilDue)} days overdue)` :
                                                                    daysUntilDue <= 3 ? ` (${daysUntilDue} days left)` : ''}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.status === 'overdue'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {book.status === 'overdue' ? 'Overdue' : 'Active'}
                                                        </span>

                                                        <button
                                                            onClick={() => handleReturnBook(book.id)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Return
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                        </div>

                        <div className="p-6">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-500 mb-2">No recent activity</h3>
                                    <p className="text-gray-400">Your library activities will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                                            <div className={`w-2 h-2 rounded-full ${activity.action === 'Issued' ? 'bg-blue-500' : 'bg-green-500'
                                                }`} />

                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.action} "{activity.book}"
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(activity.date)}
                                                </p>
                                            </div>

                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.action === 'Issued'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {activity.action}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;