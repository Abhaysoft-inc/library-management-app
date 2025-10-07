import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Users,
    BookOpen,
    UserCheck,
    UserX,
    Plus,
    Search,
    Filter,
    BarChart3,
    TrendingUp,
    Calendar,
    Settings,
    Loader,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState({
        totalUsers: 0,
        approvedUsers: 0,
        pendingUsers: 0,
        rejectedUsers: 0,
        totalBooks: 0,
        availableBooks: 0,
        issuedBooks: 0,
        librarians: 0
    });

    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to view admin dashboard');
                return;
            }

            // Fetch students data
            const studentsResponse = await axios.get(
                `${API_BASE_URL}/students?limit=100`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Fetch books data
            const booksResponse = await axios.get(
                `${API_BASE_URL}/books?limit=100`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (studentsResponse.data.success && booksResponse.data.success) {
                const students = studentsResponse.data.data.students || [];
                const books = booksResponse.data.data.books || [];

                // Calculate user stats
                const approved = students.filter(s => s.isApproved === true).length;
                const pending = students.filter(s => s.isApproved === false).length;
                const librarians = students.filter(s => s.role === 'librarian').length;

                setStats({
                    totalUsers: students.length,
                    approvedUsers: approved,
                    pendingUsers: pending,
                    rejectedUsers: 0, // Not implemented in current schema
                    totalBooks: books.length,
                    availableBooks: books.filter(b => b.availableCopies > 0).length,
                    issuedBooks: books.filter(b => b.availableCopies < b.totalCopies).length,
                    librarians: librarians
                });

                // Set pending users
                const pendingUsersList = students
                    .filter(s => s.isApproved === false)
                    .slice(0, 10)
                    .map(s => ({
                        id: s._id,
                        name: s.name,
                        rollNumber: s.studentId,
                        email: s.email,
                        branch: s.branch,
                        registrationDate: s.createdAt
                    }));

                setPendingUsers(pendingUsersList);
                setAllUsers(students);
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
            setError('Failed to load dashboard data');

            // Fallback to mock data
            setStats({
                totalUsers: 500,
                approvedUsers: 450,
                pendingUsers: 35,
                rejectedUsers: 15,
                totalBooks: 2500,
                availableBooks: 2100,
                issuedBooks: 400,
                librarians: 5
            });

            setPendingUsers([
                {
                    id: 1,
                    name: 'John Doe',
                    rollNumber: '24305',
                    email: 'john@example.com',
                    branch: 'Computer Science',
                    registrationDate: '2024-10-01'
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    rollNumber: '24306',
                    email: 'jane@example.com',
                    branch: 'Electrical Engineering',
                    registrationDate: '2024-10-02'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/students/${userId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh dashboard data
            fetchDashboardData();
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user. Please try again.');
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/students/${userId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh dashboard data
            fetchDashboardData();
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Failed to reject user. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg">Loading admin dashboard...</span>
            </div>
        );
    }

    const filteredPendingUsers = pendingUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const recentActivity = [
        { id: 1, action: 'User Approved', details: 'John Doe approved for library access', time: '10 minutes ago' },
        { id: 2, action: 'Book Added', details: 'New book "Clean Code" added to collection', time: '1 hour ago' },
        { id: 3, action: 'User Registered', details: 'Jane Smith registered for library access', time: '2 hours ago' },
        { id: 4, action: 'Librarian Added', details: 'New librarian Sarah Wilson added', time: '1 day ago' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your library system</p>
                    {error && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-yellow-800">{error}</span>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                            </div>
                            <Users className="h-12 w-12 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved Users</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.approvedUsers}</p>
                                <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
                            </div>
                            <UserCheck className="h-12 w-12 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pendingUsers}</p>
                                <p className="text-xs text-orange-600 mt-1">Requires attention</p>
                            </div>
                            <UserX className="h-12 w-12 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Books</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.availableBooks} available</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Settings
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Pending User Approvals */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Pending User Approvals</h3>
                                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {pendingUsers.length} pending
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {pendingUsers.map((user) => (
                                            <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                                                        <p className="text-sm text-gray-600">Roll: {user.rollNumber} • {user.branch}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                        <p className="text-xs text-gray-500">Registered: {new Date(user.registrationDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApproveUser(user.id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectUser(user.id)}
                                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md mb-4">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-full">
                                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                    <p className="text-xs text-gray-600">{activity.details}</p>
                                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <Plus className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium text-gray-900">Add New Book</span>
                                            </div>
                                        </button>
                                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <UserCheck className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-gray-900">Add Librarian</span>
                                            </div>
                                        </button>
                                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                                <span className="font-medium text-gray-900">View Reports</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Add User</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Filter className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 text-center py-8">User management interface will be implemented here.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="text-center py-12 text-gray-600">
                                Chart will be implemented here
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Book Usage</h3>
                                <BookOpen className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="text-center py-12 text-gray-600">
                                Chart will be implemented here
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <Settings className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 text-center py-8">System settings interface will be implemented here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;