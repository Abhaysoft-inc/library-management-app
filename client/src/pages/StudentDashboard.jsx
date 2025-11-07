import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../store/slices/authSlice';
import {
    BookOpen, Clock, CheckCircle, AlertCircle, Calendar,
    TrendingUp, History, Book, LogOut, Search,
    ArrowRight, BookMarked, Award, Sparkles, Library,
    ChevronRight, Bell, Menu, X as XIcon, User
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [transactionsResponse, booksResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/transactions/my-transactions?limit=20`, { headers }),
                axios.get(`${API_BASE_URL}/books?limit=20&available=true`, { headers })
            ]);

            const transactions = transactionsResponse.data.data?.transactions || [];
            const books = booksResponse.data.data?.books || [];

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
        } catch (err) {
            console.error('Error fetching student dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

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

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredBooks = dashboardData.availableBooks.filter(book =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <BookOpen className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="mt-6 text-slate-700 font-medium">Loading your library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col md:flex-row">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Collapsible Sidebar */}
            <div className={`
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                ${isSidebarOpen ? 'w-72' : 'md:w-20'}
                fixed md:relative
                inset-y-0 left-0
                bg-white shadow-2xl 
                transition-all duration-300 ease-in-out 
                flex flex-col
                z-50
            `}>
                <div className="p-4 md:p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-3 ${!isSidebarOpen && 'md:justify-center'}`}>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Library className="w-6 h-6 text-white" />
                            </div>
                            {isSidebarOpen && (
                                <div>
                                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        EE Library
                                    </h2>
                                    <p className="text-xs text-slate-500">Student Portal</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? <XIcon className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                        </button>
                    </div>
                </div>

                {isSidebarOpen && (
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                                <span className="text-white font-bold text-xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-600 truncate">ID: {user?.studentId}</p>
                                <p className="text-xs text-blue-600 font-medium mt-0.5">Year {user?.year || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'overview'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Dashboard</span>}
                        {activeTab === 'overview' && isSidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('current-books')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'current-books'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <BookOpen className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>My Books</span>}
                        {dashboardData.stats.booksIssued > 0 && isSidebarOpen && (
                            <span className="ml-auto bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                {dashboardData.stats.booksIssued}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'history'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <History className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>History</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'browse'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Book className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Browse Books</span>}
                    </button>

                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"
                        >
                            <User className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span>Profile</span>}
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200 sticky top-0 z-30">
                    <div className="px-4 md:px-8 py-4 md:py-6">
                        <div className="flex items-center justify-between gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-6 h-6 text-slate-600" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 truncate">
                                    {activeTab === 'overview' && 'Welcome Back!'}
                                    {activeTab === 'current-books' && 'My Books'}
                                    {activeTab === 'history' && 'History'}
                                    {activeTab === 'browse' && 'Browse'}
                                </h1>
                                <p className="text-xs md:text-sm text-slate-600 truncate">{user?.name}</p>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4">
                                <button className="p-2 md:p-3 hover:bg-slate-100 rounded-xl transition-colors relative">
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    {dashboardData.stats.overdueBooks > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold">
                                            {dashboardData.stats.overdueBooks}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 md:gap-3">
                                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 text-xs md:text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 md:space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Books Issued</p>
                                    <p className="text-3xl md:text-4xl font-bold text-slate-900">{dashboardData.stats.booksIssued}</p>
                                    <p className="text-xs text-slate-500 mt-1 md:mt-2">Currently borrowed</p>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <Award className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Books Returned</p>
                                    <p className="text-3xl md:text-4xl font-bold text-slate-900">{dashboardData.stats.booksReturned}</p>
                                    <p className="text-xs text-slate-500 mt-1 md:mt-2">Total returned</p>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        {dashboardData.stats.overdueBooks > 0 && (
                                            <span className="animate-pulse w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Overdue Books</p>
                                    <p className="text-3xl md:text-4xl font-bold text-slate-900">{dashboardData.stats.overdueBooks}</p>
                                    <p className="text-xs text-slate-500 mt-1 md:mt-2">Needs attention</p>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <History className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">Total Transactions</p>
                                    <p className="text-3xl md:text-4xl font-bold text-slate-900">{dashboardData.stats.totalTransactions}</p>
                                    <p className="text-xs text-slate-500 mt-1 md:mt-2">All time</p>
                                </div>
                            </div>

                            {/* Currently Reading Section */}
                            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
                                    <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <BookMarked className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                        <span className="hidden sm:inline">Currently Reading</span>
                                        <span className="sm:hidden">My Books</span>
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('current-books')}
                                        className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline">View All</span>
                                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>
                                <div className="p-4 md:p-6">
                                    {dashboardData.myTransactions.filter(t => t.status === 'issued').length === 0 ? (
                                        <div className="text-center py-8 md:py-12">
                                            <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-slate-300" />
                                            <p className="text-slate-500 text-base md:text-lg font-medium">No books currently issued</p>
                                            <p className="text-slate-400 text-xs md:text-sm mt-2">Browse our library to find your next read!</p>
                                            <button
                                                onClick={() => setActiveTab('browse')}
                                                className="mt-3 md:mt-4 px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm md:text-base rounded-xl hover:shadow-lg transition-all"
                                            >
                                                Browse Books
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            {dashboardData.myTransactions
                                                .filter(t => t.status === 'issued')
                                                .slice(0, 4)
                                                .map((transaction) => {
                                                    const daysLeft = getDaysUntilDue(transaction.dueDate);
                                                    const isOverdueBool = daysLeft < 0;

                                                    return (
                                                        <div key={transaction._id} className="p-3 md:p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                                                            <div className="flex items-start justify-between mb-2 md:mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-sm md:text-base text-slate-900 mb-1 line-clamp-2">
                                                                        {transaction.bookId?.title || 'Unknown Book'}
                                                                    </h3>
                                                                    <p className="text-xs md:text-sm text-slate-600 mb-1 md:mb-2 line-clamp-1">
                                                                        {transaction.bookId?.author?.join(', ') || 'Unknown Author'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 md:pt-3 border-t border-slate-200">
                                                                <div className="flex items-center gap-1 md:gap-2">
                                                                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                                                                    <span className="text-xs md:text-sm text-slate-600">
                                                                        {formatDate(transaction.dueDate)}
                                                                    </span>
                                                                </div>
                                                                {isOverdueBool ? (
                                                                    <span className="px-2 md:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg whitespace-nowrap">
                                                                        {Math.abs(daysLeft)}d overdue
                                                                    </span>
                                                                ) : (
                                                                    <span className={`px-2 md:px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${daysLeft <= 3
                                                                            ? 'bg-amber-100 text-amber-700'
                                                                            : 'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                        {daysLeft}d left
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-slate-200 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <History className="w-5 h-5 text-purple-600" />
                                        Recent Activity
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                    >
                                        View All
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    {dashboardData.myTransactions.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">No recent transactions</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {dashboardData.myTransactions.slice(0, 5).map((transaction) => (
                                                <div key={transaction._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.status === 'returned'
                                                                ? 'bg-emerald-100'
                                                                : isOverdue(transaction.dueDate)
                                                                    ? 'bg-red-100'
                                                                    : 'bg-blue-100'
                                                            }`}>
                                                            {transaction.status === 'returned' ? (
                                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                            ) : isOverdue(transaction.dueDate) ? (
                                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                                            ) : (
                                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-sm">
                                                                {transaction.bookId?.title || 'Unknown Book'}
                                                            </p>
                                                            <p className="text-xs text-slate-600">
                                                                Due: {formatDate(transaction.dueDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${transaction.status === 'issued'
                                                            ? isOverdue(transaction.dueDate)
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            : 'bg-emerald-100 text-emerald-700'
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
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    My Current Books ({dashboardData.myTransactions.filter(t => t.status === 'issued').length})
                                </h2>
                            </div>
                            <div className="p-6">
                                {dashboardData.myTransactions.filter(t => t.status === 'issued').length === 0 ? (
                                    <div className="text-center py-16">
                                        <BookOpen className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                                        <p className="text-slate-500 text-lg font-medium mb-2">No books currently issued</p>
                                        <p className="text-slate-400 text-sm mb-6">Visit the library to borrow books</p>
                                        <button
                                            onClick={() => setActiveTab('browse')}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                                        >
                                            Browse Library
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {dashboardData.myTransactions
                                            .filter(t => t.status === 'issued')
                                            .map((transaction) => {
                                                const daysLeft = getDaysUntilDue(transaction.dueDate);
                                                const isOverdueBool = daysLeft < 0;

                                                return (
                                                    <div key={transaction._id} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all">
                                                        <div className="mb-4">
                                                            <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                                                <BookMarked className="w-16 h-16 text-white" />
                                                            </div>
                                                            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">
                                                                {transaction.bookId?.title || 'Unknown Book'}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mb-1">
                                                                {transaction.bookId?.author?.join(', ') || 'Unknown Author'}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                ISBN: {transaction.bookId?.isbn || 'N/A'}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-3 pt-4 border-t border-slate-200">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">Issue Date</span>
                                                                <span className="font-semibold text-slate-900">{formatDate(transaction.issueDate)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">Due Date</span>
                                                                <span className="font-semibold text-slate-900">{formatDate(transaction.dueDate)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-slate-600">Status</span>
                                                                {isOverdueBool ? (
                                                                    <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                                                        <AlertCircle className="w-3 h-3" />
                                                                        {Math.abs(daysLeft)} days overdue
                                                                    </span>
                                                                ) : (
                                                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${daysLeft <= 3
                                                                            ? 'bg-amber-100 text-amber-700'
                                                                            : 'bg-emerald-100 text-emerald-700'
                                                                        }`}>
                                                                        {daysLeft} days remaining
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'browse' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search books by title or author..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Library className="w-5 h-5 text-emerald-600" />
                                        Available Books ({filteredBooks.length})
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {filteredBooks.length === 0 ? (
                                        <div className="text-center py-16">
                                            <Book className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                                            <p className="text-slate-500 text-lg">No books found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filteredBooks.map((book) => (
                                                <div key={book._id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-xl transition-all group">
                                                    <div className="w-full h-48 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-shadow">
                                                        <Book className="w-20 h-20 text-white" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2 min-h-[3rem]">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 mb-3 line-clamp-1">
                                                        {book.author?.join(', ') || 'Unknown Author'}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                                        <div className="text-sm">
                                                            <span className="text-slate-600">Available: </span>
                                                            <span className="font-bold text-emerald-600">
                                                                {book.availableCopies}/{book.totalCopies}
                                                            </span>
                                                        </div>
                                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                                                            {book.category || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-slate-200">
                                <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <History className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                    <span className="hidden sm:inline">Complete Transaction History ({dashboardData.myTransactions.length})</span>
                                    <span className="sm:hidden">History ({dashboardData.myTransactions.length})</span>
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                {dashboardData.myTransactions.length === 0 ? (
                                    <div className="text-center py-12 md:py-16">
                                        <History className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 text-slate-300" />
                                        <p className="text-slate-500 text-base md:text-lg">No transaction history yet</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Book</th>
                                                <th className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Issue Date</th>
                                                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                                                <th className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Return Date</th>
                                                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {dashboardData.myTransactions.map((transaction) => (
                                                <tr key={transaction._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-3 md:px-6 py-3 md:py-4">
                                                        <div>
                                                            <div className="text-xs md:text-sm font-semibold text-slate-900 line-clamp-2">
                                                                {transaction.bookId?.title || 'Unknown Book'}
                                                            </div>
                                                            <div className="text-xs text-slate-500 line-clamp-1">
                                                                {transaction.bookId?.author?.join(', ') || 'Unknown Author'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-slate-700">
                                                        {formatDate(transaction.issueDate)}
                                                    </td>
                                                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-slate-700">
                                                        {formatDate(transaction.dueDate)}
                                                    </td>
                                                    <td className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-slate-700">
                                                        {transaction.returnDate ? formatDate(transaction.returnDate) : (
                                                            <span className="text-slate-400">Not returned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-lg ${transaction.status === 'issued'
                                                                ? isOverdue(transaction.dueDate)
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                                : transaction.status === 'returned'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {transaction.status === 'issued' && isOverdue(transaction.dueDate) ? (
                                                                <>
                                                                    <AlertCircle className="w-3 h-3 hidden sm:inline" />
                                                                    <span className="hidden sm:inline">Overdue</span>
                                                                    <span className="sm:hidden">!</span>
                                                                </>
                                                            ) : transaction.status === 'returned' ? (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3 hidden sm:inline" />
                                                                    <span className="hidden sm:inline">Returned</span>
                                                                    <span className="sm:hidden">✓</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <BookOpen className="w-3 h-3 hidden sm:inline" />
                                                                    <span className="hidden sm:inline">Issued</span>
                                                                    <span className="sm:hidden">→</span>
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
