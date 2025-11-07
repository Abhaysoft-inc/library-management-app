import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    User,
    BookMarked,
    Calendar
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const FineManagement = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fines, setFines] = useState([]);
    const [filteredFines, setFilteredFines] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [stats, setStats] = useState({
        totalFines: 0,
        totalAmount: 0,
        paid: 0,
        unpaid: 0
    });

    useEffect(() => {
        fetchFines();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchFines = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const transactions = response.data.data.transactions || [];
                // Filter transactions with fines
                const fineTransactions = transactions.filter(t => t.fine && t.fine > 0);
                setFines(fineTransactions);
                setFilteredFines(fineTransactions);
                calculateStats(fineTransactions);
            }
        } catch (error) {
            console.error('Error fetching fines:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (fineData) => {
        const total = fineData.reduce((sum, f) => sum + (f.fine || 0), 0);
        const paid = fineData.filter(f => f.finePaid).reduce((sum, f) => sum + (f.fine || 0), 0);

        setStats({
            totalFines: fineData.length,
            totalAmount: total,
            paid: paid,
            unpaid: total - paid
        });
    };

    useEffect(() => {
        let filtered = [...fines];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.student?.name?.toLowerCase().includes(query) ||
                f.student?.studentId?.toLowerCase().includes(query) ||
                f.book?.title?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter === 'paid') {
            filtered = filtered.filter(f => f.finePaid);
        } else if (statusFilter === 'unpaid') {
            filtered = filtered.filter(f => !f.finePaid);
        }

        setFilteredFines(filtered);
        setCurrentPage(1);
    }, [searchQuery, statusFilter, fines]);

    const markAsPaid = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/transactions/${transactionId}/pay-fine`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchFines(); // Refresh the list
        } catch (error) {
            console.error('Error marking fine as paid:', error);
            alert('Failed to update fine status');
        }
    };

    const exportToCSV = () => {
        const headers = ['Student Name', 'Student ID', 'Book Title', 'Fine Amount', 'Due Date', 'Return Date', 'Status'];
        const csvData = filteredFines.map(f => [
            f.student?.name || 'N/A',
            f.student?.studentId || 'N/A',
            f.book?.title || 'N/A',
            f.fine || 0,
            new Date(f.dueDate).toLocaleDateString(),
            f.returnDate ? new Date(f.returnDate).toLocaleDateString() : 'Not returned',
            f.finePaid ? 'Paid' : 'Unpaid'
        ]);

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fines_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Pagination
    const totalPages = Math.ceil(filteredFines.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFines = filteredFines.slice(startIndex, endIndex);

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
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Fine Management</h1>
                                <p className="text-slate-600">Manage overdue fines and payments</p>
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Total Fines</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.totalFines}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Total Amount</p>
                                        <p className="text-3xl font-bold text-red-600">₹{stats.totalAmount}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Paid</p>
                                        <p className="text-3xl font-bold text-emerald-600">₹{stats.paid}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Unpaid</p>
                                        <p className="text-3xl font-bold text-red-600">₹{stats.unpaid}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by student or book..."
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
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fines Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : currentFines.length === 0 ? (
                                <div className="text-center py-16">
                                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500 text-lg">No fines found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Book</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Return Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fine Amount</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {currentFines.map((fine) => (
                                                    <tr key={fine._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                    {fine.student?.name?.[0] || 'S'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{fine.student?.name}</p>
                                                                    <p className="text-sm text-slate-600">{fine.student?.studentId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-slate-900">{fine.book?.title}</p>
                                                            <p className="text-sm text-slate-600">{fine.book?.ISBN}</p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                            {new Date(fine.dueDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                            {fine.returnDate
                                                                ? new Date(fine.returnDate).toLocaleDateString()
                                                                : <span className="text-amber-600 font-medium">Not returned</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-red-600 font-bold text-lg">₹{fine.fine}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {fine.finePaid ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                    Paid
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                    Unpaid
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {!fine.finePaid && (
                                                                <button
                                                                    onClick={() => markAsPaid(fine._id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Mark Paid
                                                                </button>
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
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredFines.length)} of {filteredFines.length} fines
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

export default FineManagement;
