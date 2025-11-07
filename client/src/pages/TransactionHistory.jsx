import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookMarked,
    Search,
    Filter,
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    Plus,
    RotateCcw
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const TransactionHistory = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [stats, setStats] = useState({
        total: 0,
        issued: 0,
        returned: 0,
        overdue: 0
    });

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const txns = response.data.data.transactions || [];
                setTransactions(txns);
                setFilteredTransactions(txns);
                calculateStats(txns);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txns) => {
        const now = new Date();
        setStats({
            total: txns.length,
            issued: txns.filter(t => t.status === 'issued').length,
            returned: txns.filter(t => t.status === 'returned').length,
            overdue: txns.filter(t =>
                t.status === 'issued' && new Date(t.dueDate) < now
            ).length
        });
    };

    useEffect(() => {
        let filtered = [...transactions];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.student?.name?.toLowerCase().includes(query) ||
                t.student?.studentId?.toLowerCase().includes(query) ||
                t.book?.title?.toLowerCase().includes(query) ||
                t.book?.ISBN?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'overdue') {
                const now = new Date();
                filtered = filtered.filter(t =>
                    t.status === 'issued' && new Date(t.dueDate) < now
                );
            } else {
                filtered = filtered.filter(t => t.status === statusFilter);
            }
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(t =>
                        new Date(t.issueDate) >= filterDate
                    );
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(t =>
                        new Date(t.issueDate) >= filterDate
                    );
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(t =>
                        new Date(t.issueDate) >= filterDate
                    );
                    break;
                default:
                    break;
            }
        }

        setFilteredTransactions(filtered);
        setCurrentPage(1);
    }, [searchQuery, statusFilter, dateFilter, transactions]);

    const getStatusBadge = (transaction) => {
        if (transaction.status === 'returned') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Returned
                </span>
            );
        }

        const isOverdue = new Date(transaction.dueDate) < new Date();
        if (isOverdue) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Overdue
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                Issued
            </span>
        );
    };

    const calculateFine = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 0;
        return diffDays * 10;
    };

    const exportToCSV = () => {
        const headers = ['Transaction ID', 'Student Name', 'Student ID', 'Book Title', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine'];
        const csvData = filteredTransactions.map(t => [
            t._id,
            t.student?.name || 'N/A',
            t.student?.studentId || 'N/A',
            t.book?.title || 'N/A',
            new Date(t.issueDate).toLocaleDateString(),
            new Date(t.dueDate).toLocaleDateString(),
            t.returnDate ? new Date(t.returnDate).toLocaleDateString() : 'Not returned',
            t.status,
            t.fine || 0
        ]);

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Transaction History</h1>
                                <p className="text-slate-600">Track all book issue and return transactions</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => navigate('/admin/transactions/issue')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="w-4 h-4" />
                                    Issue Book
                                </button>
                                <button
                                    onClick={() => navigate('/admin/transactions/return')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Return Book
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Total Transactions</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <BookMarked className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Currently Issued</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.issued}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Returned</p>
                                        <p className="text-3xl font-bold text-emerald-600">{stats.returned}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Overdue</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by student, book, or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="issued">Issued</option>
                                        <option value="returned">Returned</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>

                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : currentTransactions.length === 0 ? (
                                <div className="text-center py-16">
                                    <BookMarked className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500 text-lg">No transactions found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Issue Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Return Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fine</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {currentTransactions.map((transaction) => (
                                                    <tr key={transaction._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                    {transaction.student?.name?.[0] || 'S'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{transaction.student?.name}</p>
                                                                    <p className="text-sm text-slate-600">{transaction.student?.studentId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-slate-900">{transaction.book?.title}</p>
                                                            <p className="text-sm text-slate-600">{transaction.book?.ISBN}</p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                            {new Date(transaction.issueDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                            {new Date(transaction.dueDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                            {transaction.returnDate
                                                                ? new Date(transaction.returnDate).toLocaleDateString()
                                                                : <span className="text-slate-400">-</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(transaction)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {transaction.fine || calculateFine(transaction.dueDate) ? (
                                                                <span className="text-red-600 font-semibold">
                                                                    ₹{transaction.fine || calculateFine(transaction.dueDate)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                            <p className="text-sm text-slate-600">
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                                                </button>
                                                <span className="px-4 py-2 text-sm font-medium text-slate-700">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TransactionHistory;
