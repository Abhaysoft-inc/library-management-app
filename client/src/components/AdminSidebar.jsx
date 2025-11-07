import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserCheck,
    BookMarked,
    BookmarkCheck,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Library,
    FileText,
    Bell,
    Clock
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            path: '/admin/dashboard',
            exact: true
        },
        {
            name: 'Books Management',
            icon: BookOpen,
            subItems: [
                { name: 'All Books', path: '/admin/books', icon: Library },
                { name: 'Add New Book', path: '/admin/books/add', icon: BookMarked },
                { name: 'Categories', path: '/admin/categories', icon: FileText }
            ]
        },
        {
            name: 'Students',
            icon: Users,
            subItems: [
                { name: 'All Students', path: '/admin/students', icon: Users },
                { name: 'Pending Approvals', path: '/admin/students/pending', icon: Clock },
                { name: 'Approved Students', path: '/admin/students/approved', icon: UserCheck }
            ]
        },
        {
            name: 'Transactions',
            icon: BookmarkCheck,
            subItems: [
                { name: 'Issue Book', path: '/admin/transactions/issue', icon: BookMarked },
                { name: 'Return Book', path: '/admin/transactions/return', icon: BookmarkCheck },
                { name: 'Transaction History', path: '/admin/transactions/history', icon: Clock }
            ]
        },
        {
            name: 'Fine Management',
            icon: DollarSign,
            path: '/admin/fines'
        },
        {
            name: 'Reports',
            icon: BarChart3,
            subItems: [
                { name: 'Overview', path: '/admin/reports/overview', icon: BarChart3 },
                { name: 'Book Reports', path: '/admin/reports/books', icon: BookOpen },
                { name: 'Student Reports', path: '/admin/reports/students', icon: Users }
            ]
        },
        {
            name: 'Notifications',
            icon: Bell,
            path: '/admin/notifications'
        },
        {
            name: 'Settings',
            icon: Settings,
            path: '/admin/settings'
        }
    ];

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === item.path;
        }
        if (item.subItems) {
            return item.subItems.some(subItem => location.pathname === subItem.path);
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                    text-white w-72 transform transition-transform duration-300 ease-in-out z-50
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static
                    shadow-2xl border-r border-slate-700
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Library className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">EE Library</h1>
                            <p className="text-xs text-slate-400">Management System</p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-white truncate">
                                {user?.name || 'Administrator'}
                            </div>
                            <div className="text-xs text-emerald-400 font-medium">
                                Admin
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isExpanded = expandedMenus[item.name];

                        return (
                            <div key={index}>
                                {hasSubItems ? (
                                    <div>
                                        <button
                                            onClick={() => toggleMenu(item.name)}
                                            className={`
                                                w-full flex items-center justify-between px-4 py-3 rounded-xl
                                                transition-all duration-200 group
                                                ${active
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                                <span className="font-medium text-sm">{item.name}</span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-700 pl-4">
                                                {item.subItems.map((subItem, subIndex) => {
                                                    const SubIcon = subItem.icon;
                                                    const subActive = location.pathname === subItem.path;

                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            to={subItem.path}
                                                            className={`
                                                                flex items-center gap-3 px-4 py-2.5 rounded-lg
                                                                transition-all duration-200 text-sm group
                                                                ${subActive
                                                                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                                                                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'
                                                                }
                                                            `}
                                                        >
                                                            <SubIcon className="w-4 h-4" />
                                                            <span>{subItem.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl
                                            transition-all duration-200 group
                                            ${active
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
                    >
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(71, 85, 105, 0.8);
                }
            `}</style>
        </>
    );
};

export default AdminSidebar;
