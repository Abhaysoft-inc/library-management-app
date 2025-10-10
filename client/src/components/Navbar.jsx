import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  Home, BookOpen, LayoutDashboard, User,
  LogOut, Bell, Settings, Menu, X, ChevronDown
} from 'lucide-react';
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const isActiveRoute = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActiveRoute(to)
          ? 'bg-white text-blue-700 shadow-md hover:shadow-lg hover:scale-105'
          : 'text-white hover:bg-white/30 hover:text-white hover:scale-105'
        }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-blue-900/30 backdrop-blur-md dark:bg-blue-950/50'
        : 'bg-gradient-to-r from-blue-700 via-blue-900 to-blue-700 dark:from-blue-800 dark:via-blue-950 dark:to-blue-800'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity">
              <img
                src="/logo.png"
                alt="EE Library Logo"
                className="w-8 h-8 object-contain"
              />
              <span>EE Library</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavLink to="/" icon={Home}>Home</NavLink>
                <NavLink to="/books" icon={BookOpen}>Books</NavLink>
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>

                {/* Theme Toggler */}
                <AnimatedThemeToggler className="p-2 text-white hover:text-white hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out hover:scale-110" />

                {/* Notifications */}
                <button className="relative p-2 text-white hover:text-white hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out hover:scale-110">
                  <Bell size={20} className="transition-transform duration-200" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold text-white transition-all duration-300 hover:bg-white/30">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block">{user?.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Animated dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 transform transition-all duration-300 ease-in-out ${isProfileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                  >
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200" onClick={() => setIsProfileMenuOpen(false)}>
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200" onClick={() => setIsProfileMenuOpen(false)}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'librarian') && (
                      <Link to={user.role === 'admin' ? '/admin' : '/librarian'} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200" onClick={() => setIsProfileMenuOpen(false)}>
                        <Settings size={16} /> {user.role === 'admin' ? 'Admin Panel' : 'Librarian Panel'}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/" icon={Home}>Home</NavLink>
                <AnimatedThemeToggler className="p-2 text-white hover:text-white hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out hover:scale-110" />
                <NavLink to="/login" icon={User}>Login</NavLink>
                <Link to="/register" className="bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 hover:shadow-md transition-all duration-200 hover:scale-105">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden py-2 space-y-1 transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          {isAuthenticated ? (
            <>
              <NavLink to="/" icon={Home}>Home</NavLink>
              <NavLink to="/books" icon={BookOpen}>Books</NavLink>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <div className="px-4 py-2">
                <AnimatedThemeToggler className="p-2 text-white hover:text-white hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out hover:scale-110" />
              </div>
              {(user?.role === 'admin' || user?.role === 'librarian') && (
                <NavLink to={user.role === 'admin' ? '/admin' : '/librarian'} icon={Settings}>
                  {user.role === 'admin' ? 'Admin Panel' : 'Librarian Panel'}
                </NavLink>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-white/30 hover:text-red-200 rounded-md w-full transition-all duration-200 hover:scale-105">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" icon={Home}>Home</NavLink>
              <NavLink to="/login" icon={User}>Login</NavLink>
              <NavLink to="/register" icon={User}>Register</NavLink>
              <div className="px-4 py-2">
                <AnimatedThemeToggler className="p-2 text-white hover:text-white hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out hover:scale-110" />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
