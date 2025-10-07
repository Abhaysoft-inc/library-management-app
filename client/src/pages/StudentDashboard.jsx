import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Clock, CheckCircle, AlertCircle, User, Calendar, TrendingUp, History, Book } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const StudentDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState({
        myTransactions: [],
        availableBooks: [],
        stats: {
            booksIssued: 0,
            booksReturned: 0,
            overdueBooks: 0,
            totalTransactions: 0,
        }
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch my transactions
            const transactionsResponse = await axios.get(
                `${API_BASE_URL}/transactions/my-transactions?limit=10`,
                { headers }
            );

            // Fetch available books
            const booksResponse = await axios.get(
                `${API_BASE_URL}/books?limit=10&available=true`,
                { headers }
            );

            console.log('Transactions Response:', transactionsResponse.data);
            console.log('Books Response:', booksResponse.data);

            const transactions = transactionsResponse.data.data?.transactions || [];
            const books = booksResponse.data.data?.books || [];

            console.log('Processed transactions:', transactions);
            console.log('Processed books:', books);

            // Calculate stats
            const stats = {
                booksIssued: transactions.filter(t => t.status === 'issued').length,
                booksReturned: transactions.filter(t => t.status === 'returned').length,
                overdueBooks: transactions.filter(t => {
                    if (t.status === 'issued' && t.dueDate) {
                        return new Date(t.dueDate) < new Date();
                    }
                    return false;
                }).length,
                totalTransactions: transactions.length,
            };

            setDashboardData({
                myTransactions: transactions,
                availableBooks: books,
                stats
            });

        } catch (error) {
            console.error('Error fetching student dashboard data:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
                    <div className="flex items-center justify-center h-16 px-4 bg-green-600">
                        <BookOpen className="h-8 w-8 text-white mr-2" />
                        <h1 className="text-xl font-bold text-white">LibraryMS</h1>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-600">Student • ID: {user?.studentId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4">
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview'
                                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <TrendingUp className="h-5 w-5 mr-3" />
                                Dashboard
                            </button>

                            <button
                                onClick={() => setActiveTab('current-books')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'current-books'
                                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <BookOpen className="h-5 w-5 mr-3" />
                                My Current Books
                            </button>

                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history'
                                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <History className="h-5 w-5 mr-3" />
                                Transaction History
                            </button>

                            <button
                                onClick={() => setActiveTab('browse')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'browse'
                                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Book className="h-5 w-5 mr-3" />
                                Browse Books
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {activeTab === 'overview' && 'Dashboard Overview'}
                                    {activeTab === 'current-books' && 'My Current Books'}
                                    {activeTab === 'history' && 'Transaction History'}
                                    {activeTab === 'browse' && 'Browse Available Books'}
                                </h1>
                                <p className="text-gray-600">Welcome back, {user?.name}!</p>
                            </div>

                            {/* Stats Summary */}
                            <div className="flex items-center space-x-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Books Issued</p>
                                    <p className="text-lg font-bold text-green-600">{dashboardData.stats.booksIssued}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Returned</p>
                                    <p className="text-lg font-bold text-blue-600">{dashboardData.stats.booksReturned}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Overdue</p>
                                    <p className="text-lg font-bold text-red-600">{dashboardData.stats.overdueBooks}</p>
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
                <main className="flex-1 overflow-auto p-6">
                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Books Issued</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.booksIssued}</p>
                                        </div>
                                        <BookOpen className="h-12 w-12 text-blue-500" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Books Returned</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.booksReturned}</p>
                                        </div>
                                        <CheckCircle className="h-12 w-12 text-green-500" />
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

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalTransactions}</p>
                                        </div>
                                        <Calendar className="h-12 w-12 text-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions Section */}
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                                </div>
                                <div className="p-6">
                                    {dashboardData.myTransactions.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No recent transactions</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {dashboardData.myTransactions.slice(0, 5).map((transaction) => (
                                                <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-600">
                                                            Due: {formatDate(transaction.dueDate)}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === 'issued'
                                                        ? isOverdue(transaction.dueDate)
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        : transaction.status === 'returned'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {transaction.status === 'issued' && isOverdue(transaction.dueDate)
                                                            ? 'Overdue'
                                                            : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                                                        }
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'current-books' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">My Current Books</h2>
                            </div>
                            <div className="p-6">
                                {dashboardData.myTransactions.filter(t => t.status === 'issued').length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No books currently issued</p>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData.myTransactions
                                            .filter(t => t.status === 'issued')
                                            .map((transaction) => (
                                                <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">
                                                            {transaction.bookId?.title || 'Unknown Book'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            Author: {transaction.bookId?.author?.join(', ') || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Due: {formatDate(transaction.dueDate)}
                                                        </p>
                                                        {isOverdue(transaction.dueDate) && (
                                                            <p className="text-sm text-red-600 font-medium">OVERDUE</p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 text-sm text-gray-500">
                                                        Contact librarian to return
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'browse' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Available Books</h2>
                            </div>
                            <div className="p-6">
                                {dashboardData.availableBooks.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No books available</p>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardData.availableBooks.slice(0, 5).map((book) => (
                                            <div key={book._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{book.title}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Author: {book.author?.join(', ') || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Available: {book.availableCopies} / {book.totalCopies}
                                                    </p>
                                                </div>
                                                <span className="ml-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    Available
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                            </div>
                            <div className="p-6">
                                {dashboardData.myTransactions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No transaction history</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Book
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Issue Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Due Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {dashboardData.myTransactions.map((transaction) => (
                                                    <tr key={transaction._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {transaction.bookId?.title || 'Unknown Book'}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {transaction.bookId?.author?.join(', ') || 'Unknown Author'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(transaction.issueDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(transaction.dueDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === 'issued'
                                                                ? isOverdue(transaction.dueDate)
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                                : transaction.status === 'returned'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {transaction.status === 'issued' && isOverdue(transaction.dueDate)
                                                                    ? 'Overdue'
                                                                    : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                                                                }
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
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
