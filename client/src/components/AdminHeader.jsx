import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Menu,
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Moon,
    Sun
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const AdminHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    // Mock notifications
    const notifications = [
        {
            id: 1,
            message: 'New student registration pending approval',
            time: '5 minutes ago',
            unread: true,
            type: 'info'
        },
        {
            id: 2,
            message: 'Book "Power Systems" is overdue',
            time: '1 hour ago',
            unread: true,
            type: 'warning'
        },
        {
            id: 3,
            message: 'Student "John Doe" returned 2 books',
            time: '2 hours ago',
            unread: false,
            type: 'success'
        }
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Implement search functionality
            console.log('Searching for:', searchQuery);
        }
    };

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-slate-700" />
                    </button>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search students, books, transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                            />
                        </div>
                    </form>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Search Icon (Mobile) */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <Search className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Toggle theme"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-slate-600" />
                        ) : (
                            <Moon className="w-5 h-5 text-slate-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-slate-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''
                                                }`}
                                        >
                                            <p className={`text-sm ${notification.unread ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {user?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="hidden lg:block text-left">
                                <div className="text-sm font-medium text-slate-900">
                                    {user?.name || 'Administrator'}
                                </div>
                                <div className="text-xs text-slate-500">Admin</div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                    <div className="font-semibold text-slate-900">{user?.name || 'Administrator'}</div>
                                    <div className="text-sm text-slate-500">{user?.email}</div>
                                </div>

                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            navigate('/admin/profile');
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="text-sm">My Profile</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigate('/admin/settings');
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm">Settings</span>
                                    </button>
                                </div>

                                <div className="border-t border-slate-200 py-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
