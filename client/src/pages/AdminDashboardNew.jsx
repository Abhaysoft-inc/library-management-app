import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    BookMarked,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    ArrowRight,
    Eye,
    MoreVertical
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboardNew = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        approvedStudents: 0,
        pendingStudents: 0,
        totalBooks: 0,
        availableBooks: 0,
        issuedBooks: 0,
        totalFines: 0,
        overdueBooks: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            // Fetch students
            const studentsResponse = await axios.get(`${API_BASE_URL}/students?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch books
            const booksResponse = await axios.get(`${API_BASE_URL}/books?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch transactions
            const transactionsResponse = await axios.get(`${API_BASE_URL}/transactions?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (studentsResponse.data.success) {
                const students = studentsResponse.data.data.students || [];
                const approved = students.filter(s => s.isApproved).length;
                const pending = students.filter(s => !s.isApproved).length;

                setStats(prev => ({
                    ...prev,
                    totalStudents: students.length,
                    approvedStudents: approved,
                    pendingStudents: pending
                }));

                setPendingApprovals(students.filter(s => !s.isApproved).slice(0, 5));
            }

            if (booksResponse.data.success) {
                const books = booksResponse.data.data.books || [];
                const available = books.filter(b => b.availableCopies > 0).length;
                const issued = books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0);

                setStats(prev => ({
                    ...prev,
                    totalBooks: books.length,
                    availableBooks: available,
                    issuedBooks: issued
                }));

                // Get popular books (sorted by borrow count or rating)
                const sortedBooks = [...books]
                    .sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
                    .slice(0, 5);
                setPopularBooks(sortedBooks);
            }

            if (transactionsResponse.data.success) {
                const transactions = transactionsResponse.data.data.transactions || [];

                // Calculate overdue books
                const overdue = transactions.filter(t =>
                    t.status === 'issued' && new Date(t.dueDate) < new Date()
                ).length;

                // Calculate total fines
                const totalFines = transactions.reduce((sum, t) => sum + (t.fine || 0), 0);

                setStats(prev => ({
                    ...prev,
                    overdueBooks: overdue,
                    totalFines: totalFines
                }));

                // Recent activities
                setRecentActivities(transactions.slice(0, 10));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Total Books',
            value: stats.totalBooks,
            change: '+8%',
            trend: 'up',
            icon: BookOpen,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Issued Books',
            value: stats.issuedBooks,
            change: '+15%',
            trend: 'up',
            icon: BookMarked,
            color: 'emerald',
            bgGradient: 'from-emerald-500 to-emerald-600'
        },
        {
            title: 'Total Fines',
            value: `₹${stats.totalFines}`,
            change: '-5%',
            trend: 'down',
            icon: DollarSign,
            color: 'amber',
            bgGradient: 'from-amber-500 to-amber-600'
        }
    ];

    const quickStats = [
        { label: 'Approved Students', value: stats.approvedStudents, icon: CheckCircle, color: 'text-emerald-600' },
        { label: 'Pending Approvals', value: stats.pendingStudents, icon: Clock, color: 'text-amber-600' },
        { label: 'Available Books', value: stats.availableBooks, icon: BookOpen, color: 'text-blue-600' },
        { label: 'Overdue Books', value: stats.overdueBooks, icon: AlertCircle, color: 'text-red-600' }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading dashboard...</p>
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
                    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
                            <p className="text-slate-600">Welcome back! Here's what's happening with your library today.</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statsCards.map((stat, index) => {
                                const Icon = stat.icon;
                                const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

                                return (
                                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    <TrendIcon className="w-3 h-3" />
                                                    <span className="text-xs font-semibold">{stat.change}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                                                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {quickStats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-8 h-8 ${stat.color}`} />
                                            <div>
                                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                                <p className="text-xs text-slate-600">{stat.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Recent Activities & Popular Books */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Recent Activities */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                                        <button
                                            onClick={() => navigate('/admin/transactions/history')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {recentActivities.slice(0, 5).map((activity, index) => (
                                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                                                                    {activity.studentId?.name?.[0] || 'S'}
                                                                </div>
                                                                <div className="text-sm font-medium text-slate-900">
                                                                    {activity.studentId?.name || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-slate-900">{activity.bookId?.title || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${activity.status === 'issued'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                {activity.status === 'issued' ? 'Issued' : 'Returned'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                            {formatDate(activity.issueDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {activity.status === 'issued' && new Date(activity.dueDate) < new Date() ? (
                                                                <span className="text-red-600 text-xs font-semibold">Overdue</span>
                                                            ) : (
                                                                <span className="text-emerald-600 text-xs font-semibold">Active</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Popular Books */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900">Popular Books</h2>
                                        <button
                                            onClick={() => navigate('/admin/books')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {popularBooks.map((book, index) => (
                                                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                                    <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                                        #{index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-slate-900 truncate">{book.title}</h4>
                                                        <p className="text-sm text-slate-600 truncate">{book.author?.join(', ')}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-slate-500">{book.category}</span>
                                                            <span className="text-xs text-slate-400">•</span>
                                                            <span className="text-xs text-emerald-600 font-medium">
                                                                {book.availableCopies}/{book.totalCopies} Available
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/admin/books/${book._id}`)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5 text-blue-600" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Pending Approvals */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                            {stats.pendingStudents}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        {pendingApprovals.length > 0 ? (
                                            <div className="space-y-4">
                                                {pendingApprovals.map((student, index) => (
                                                    <div key={index} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                                {student.name[0]}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-slate-900 truncate">{student.name}</h4>
                                                                <p className="text-sm text-slate-600 truncate">{student.email}</p>
                                                                <p className="text-xs text-slate-500 mt-1">Roll: {student.studentId}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-3">
                                                            <button className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                                                                Approve
                                                            </button>
                                                            <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => navigate('/admin/students/pending')}
                                                    className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    View All Pending
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                                <p className="text-slate-600 text-sm">No pending approvals</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg overflow-hidden text-white p-6">
                                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => navigate('/admin/transactions/issue')}
                                            className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-left font-medium transition-colors"
                                        >
                                            Issue Book
                                        </button>
                                        <button
                                            onClick={() => navigate('/admin/transactions/return')}
                                            className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-left font-medium transition-colors"
                                        >
                                            Return Book
                                        </button>
                                        <button
                                            onClick={() => navigate('/admin/books/add')}
                                            className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-left font-medium transition-colors"
                                        >
                                            Add New Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardNew;
