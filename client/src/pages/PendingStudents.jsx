import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Mail,
    Phone,
    Calendar
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'https://library-management-server-fk6j.onrender.com/api';

const PendingStudents = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    const fetchPendingStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const allStudents = response.data.data.students || [];
                // Filter only pending students
                const pending = allStudents.filter(s => !s.isApproved);
                setStudents(pending);
                setFilteredStudents(pending);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            setFilteredStudents(students);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = students.filter(student =>
            student.name?.toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query) ||
            student.studentId?.toLowerCase().includes(query)
        );
        setFilteredStudents(filtered);
        setCurrentPage(1);
    }, [searchQuery, students]);

    const handleApprove = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/students/${studentId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchPendingStudents(); // Refresh the list
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Failed to approve student');
        }
    };

    const handleReject = async (studentId) => {
        if (!window.confirm('Are you sure you want to reject this student?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE_URL}/students/${studentId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchPendingStudents(); // Refresh the list
        } catch (error) {
            console.error('Error rejecting student:', error);
            alert('Failed to reject student');
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pending Approvals</h1>
                            <p className="text-slate-600">Review and approve student registrations</p>
                        </div>

                        {/* Stats Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Pending Approvals</p>
                                        <p className="text-3xl font-bold text-amber-600">{students.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Today's Requests</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {students.filter(s => {
                                                const today = new Date().toDateString();
                                                return new Date(s.createdAt).toDateString() === today;
                                            }).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Awaiting Action</p>
                                        <p className="text-3xl font-bold text-red-600">{filteredStudents.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-white" />
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
                                    placeholder="Search by name, email, or student ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Students List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : currentStudents.length === 0 ? (
                                <div className="text-center py-16">
                                    <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500 text-lg">No pending approvals</p>
                                    <p className="text-slate-400 text-sm mt-2">All students have been reviewed</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Year</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registered</th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {currentStudents.map((student) => (
                                                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                                                    {student.name?.[0]?.toUpperCase() || 'S'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{student.name}</p>
                                                                    <p className="text-sm text-slate-600">{student.studentId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                                    {student.email}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                                    {student.phone || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                                                                Year {student.year || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                            {new Date(student.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleApprove(student._id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(student._id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                    Reject
                                                                </button>
                                                            </div>
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
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
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

export default PendingStudents;
