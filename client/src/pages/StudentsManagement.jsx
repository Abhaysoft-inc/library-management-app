import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    AlertCircle
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'https://library-management-server-fk6j.onrender.com/api';

const StudentsManagement = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filterStatus]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                status: filterStatus !== 'all' ? filterStatus : undefined
            };

            const response = await axios.get(`${API_BASE_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success) {
                setStudents(response.data.data.students || []);
                setTotalPages(response.data.data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchStudents();
    };

    const handleApprove = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/students/${studentId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchStudents();
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Failed to approve student');
        }
    };

    const handleReject = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/students/${studentId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchStudents();
        } catch (error) {
            console.error('Error rejecting student:', error);
            alert('Failed to reject student');
        }
    };

    const stats = {
        total: students.length,
        approved: students.filter(s => s.isApproved).length,
        pending: students.filter(s => !s.isApproved).length,
        active: students.filter(s => s.isActive).length
    };

    if (loading && students.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading students...</p>
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
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Management</h1>
                            <p className="text-slate-600">Manage student registrations and approvals</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-medium mb-1">Total Students</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-medium mb-1">Approved</p>
                                        <h3 className="text-3xl font-bold text-emerald-600">{stats.approved}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-medium mb-1">Pending</p>
                                        <h3 className="text-3xl font-bold text-amber-600">{stats.pending}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-medium mb-1">Active</p>
                                        <h3 className="text-3xl font-bold text-purple-600">{stats.active}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or roll number..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </form>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="all">All Students</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                </select>

                                <button
                                    onClick={fetchStudents}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Filter className="w-4 h-4" />
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Roll Number</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Year</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Registered</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {students.map((student) => (
                                            <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {student.name[0]}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{student.name}</h4>
                                                            <p className="text-sm text-slate-600">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {student.studentId}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone className="w-4 h-4" />
                                                        {student.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                        Year {student.year}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(student.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.isApproved ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!student.isApproved && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(student._id)}
                                                                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(student._id)}
                                                                    className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => navigate(`/admin/students/${student._id}`)}
                                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {students.length === 0 && !loading && (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No students found</h3>
                                        <p className="text-slate-600">No students match your current filters</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                    <div className="text-sm text-slate-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentsManagement;
