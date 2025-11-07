import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookCheck,
    Search,
    AlertCircle,
    CheckCircle,
    X,
    User,
    BookMarked,
    Calendar,
    DollarSign
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const ReturnBook = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [activeTransactions, setActiveTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [condition, setCondition] = useState('good');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchActiveTransactions();
    }, []);

    const fetchActiveTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'issued' }
            });

            if (response.data.success) {
                setActiveTransactions(response.data.data.transactions || []);
                setFilteredTransactions(response.data.data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to load active transactions');
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            setFilteredTransactions(activeTransactions);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = activeTransactions.filter(transaction =>
            transaction.student?.name?.toLowerCase().includes(query) ||
            transaction.student?.studentId?.toLowerCase().includes(query) ||
            transaction.book?.title?.toLowerCase().includes(query) ||
            transaction.book?.ISBN?.toLowerCase().includes(query)
        );
        setFilteredTransactions(filtered);
    }, [searchQuery, activeTransactions]);

    const calculateFine = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 0;
        return diffDays * 10; // ₹10 per day
    };

    const handleReturnBook = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedTransaction) {
            setError('Please select a transaction');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/transactions/return`,
                {
                    transactionId: selectedTransaction._id,
                    bookCondition: condition,
                    notes
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess('Book returned successfully!');
                setTimeout(() => {
                    navigate('/admin/transactions/history');
                }, 1500);
            }
        } catch (error) {
            console.error('Error returning book:', error);
            setError(error.response?.data?.message || 'Failed to return book');
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
                    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Return Book</h1>
                                <p className="text-slate-600">Process book returns and calculate fines</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/transactions/history')}
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Active Transactions List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Active Transactions</h3>

                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by student or book..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="max-h-[600px] overflow-y-auto space-y-3">
                                    {filteredTransactions.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No active transactions found</p>
                                    ) : (
                                        filteredTransactions.map((transaction) => {
                                            const fine = calculateFine(transaction.dueDate);
                                            const isOverdue = fine > 0;

                                            return (
                                                <button
                                                    key={transaction._id}
                                                    onClick={() => setSelectedTransaction(transaction)}
                                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedTransaction?._id === transaction._id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                {transaction.student?.name?.[0] || 'S'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900">{transaction.student?.name}</h4>
                                                                <p className="text-sm text-slate-600">{transaction.student?.studentId}</p>
                                                            </div>
                                                        </div>
                                                        {isOverdue && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="pl-13 space-y-1">
                                                        <p className="font-medium text-slate-800 text-sm">{transaction.book?.title}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-600">
                                                            <span>Due: {new Date(transaction.dueDate).toLocaleDateString()}</span>
                                                            {isOverdue && (
                                                                <span className="text-red-600 font-semibold">Fine: ₹{fine}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Return Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Return Details</h3>

                                {selectedTransaction ? (
                                    <form onSubmit={handleReturnBook}>
                                        {/* Transaction Info */}
                                        <div className="mb-6 p-4 bg-slate-50 rounded-xl space-y-3">
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Student</p>
                                                    <p className="font-semibold text-slate-900">{selectedTransaction.student?.name}</p>
                                                    <p className="text-sm text-slate-600">{selectedTransaction.student?.studentId}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <BookMarked className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Book</p>
                                                    <p className="font-semibold text-slate-900">{selectedTransaction.book?.title}</p>
                                                    <p className="text-sm text-slate-600">{selectedTransaction.book?.ISBN}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-slate-600">Issued</p>
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {new Date(selectedTransaction.issueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-slate-600">Due</p>
                                                        <p className={`font-semibold text-sm ${calculateFine(selectedTransaction.dueDate) > 0
                                                                ? 'text-red-600'
                                                                : 'text-slate-900'
                                                            }`}>
                                                            {new Date(selectedTransaction.dueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {calculateFine(selectedTransaction.dueDate) > 0 && (
                                                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <DollarSign className="w-5 h-5 text-red-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-red-600 font-medium">Late Fee</p>
                                                        <p className="font-bold text-red-700 text-lg">
                                                            ₹{calculateFine(selectedTransaction.dueDate)}
                                                        </p>
                                                        <p className="text-xs text-red-600">
                                                            {Math.ceil((new Date() - new Date(selectedTransaction.dueDate)) / (1000 * 60 * 60 * 24))} days overdue @ ₹10/day
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Condition */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Book Condition <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={condition}
                                                onChange={(e) => setCondition(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="excellent">Excellent</option>
                                                <option value="good">Good</option>
                                                <option value="fair">Fair</option>
                                                <option value="poor">Poor</option>
                                                <option value="damaged">Damaged</option>
                                            </select>
                                        </div>

                                        {/* Notes */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows="3"
                                                placeholder="Any additional notes about the return..."
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTransaction(null)}
                                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <BookCheck className="w-5 h-5" />
                                                        Return Book
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center py-16 text-slate-500">
                                        <BookCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p>Select a transaction to process return</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReturnBook;
