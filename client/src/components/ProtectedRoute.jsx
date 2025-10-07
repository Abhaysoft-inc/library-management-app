import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user is approved (for students)
    if (user && !user.isApproved && user.role === 'student') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⏳</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
                    <p className="text-gray-600 mb-6">
                        Your account is currently under review. Please wait for an administrator to approve your account before you can access the library system.
                    </p>
                    <p className="text-sm text-gray-500">
                        If you have any questions, please contact the library administration.
                    </p>
                </div>
            </div>
        );
    }

    // Check role-based access
    if (requiredRole) {
        const hasRequiredRole = Array.isArray(requiredRole)
            ? requiredRole.includes(user?.role)
            : user?.role === requiredRole;

        if (!hasRequiredRole) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚫</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                        <p className="text-gray-600 mb-6">
                            You don't have permission to access this page. This page is restricted to {
                                Array.isArray(requiredRole) ? requiredRole.join(' and ') : requiredRole
                            } users only.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }
    }

    // Render the protected component
    return children;
};

export default ProtectedRoute;