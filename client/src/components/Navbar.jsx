import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
    Home,
    BookOpen,
    LayoutDashboard,
    User,
    LogOut,
    Bell,
    Settings,
    Menu,
    X
} from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        setIsProfileMenuOpen(false);
        navigate('/');
    };

    const isActiveRoute = (path) => location.pathname === path;

    const NavLink = ({ to, children, icon: Icon, className = "" }) => (
        <Link
            to={to}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActiveRoute(to)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                } ${className}`}
        >
            <Icon size={18} />
            <span>{children}</span>
        </Link>
    );

    return (
        <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
                            <BookOpen size={24} />
                            <span>📚 EE Library</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/" icon={Home}>Home</NavLink>
                                <NavLink to="/books" icon={BookOpen}>Books</NavLink>
                                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>

                                {/* Notifications */}
                                <button className="relative p-2 text-blue-100 hover:text-white transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        0
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center space-x-2 p-2 text-sm text-blue-100 hover:text-white transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden lg:block">{user?.name}</span>
                                    </button>

                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                            <Link
                                                to="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <User size={16} />
                                                <span>Profile</span>
                                            </Link>
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={16} />
                                                <span>Dashboard</span>
                                            </Link>
                                            {(user?.role === 'admin' || user?.role === 'librarian') && (
                                                <Link
                                                    to={user.role === 'admin' ? '/admin' : '/librarian'}
                                                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <Settings size={16} />
                                                    <span>{user.role === 'admin' ? 'Admin Panel' : 'Librarian Panel'}</span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut size={16} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <NavLink to="/" icon={Home}>Home</NavLink>
                                <NavLink to="/login" icon={User}>Login</NavLink>
                                <Link
                                    to="/register"
                                    className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-blue-100 hover:text-white p-2"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/" icon={Home} className="block">Home</NavLink>
                                <NavLink to="/books" icon={BookOpen} className="block">Books</NavLink>
                                <NavLink to="/dashboard" icon={LayoutDashboard} className="block">Dashboard</NavLink>
                                <NavLink to="/profile" icon={User} className="block">Profile</NavLink>
                                {(user?.role === 'admin' || user?.role === 'librarian') && (
                                    <NavLink
                                        to={user.role === 'admin' ? '/admin' : '/librarian'}
                                        icon={Settings}
                                        className="block"
                                    >
                                        {user.role === 'admin' ? 'Admin Panel' : 'Librarian Panel'}
                                    </NavLink>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-600 hover:text-white rounded-md w-full"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/" icon={Home} className="block">Home</NavLink>
                                <NavLink to="/login" icon={User} className="block">Login</NavLink>
                                <NavLink to="/register" icon={User} className="block">Register</NavLink>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;