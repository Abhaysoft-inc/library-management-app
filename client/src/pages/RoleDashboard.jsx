import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Import role-specific dashboards
import AdminDashboard from './AdminDashboard';
import LibrarianDashboard from './LibrarianDashboard';
import StudentDashboard from './StudentDashboard';

const RoleDashboard = () => {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Render appropriate dashboard based on user role
    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'librarian':
            return <LibrarianDashboard />;
        case 'student':
            return <StudentDashboard />;
        default:
            // If role is not recognized, redirect to login
            console.error('Unknown user role:', user.role);
            return <Navigate to="/login" replace />;
    }
};

export default RoleDashboard;