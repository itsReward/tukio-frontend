// src/components/auth/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';

/**
 * Admin Protected Route Component
 * Ensures only admin users can access admin-only routes
 */
const AdminProtectedRoute = () => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();

    // Show loading spinner while authentication is being verified
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Verifying admin access..." />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin role
    const isAdmin = currentUser?.roles?.includes('ADMIN') || currentUser?.role === 'ADMIN';

    // Redirect to dashboard if not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="mt-2 text-xl font-bold text-gray-900">Access Denied</h1>
                    <p className="mt-1 text-gray-600">You don't have permission to access this area.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render the protected admin content
    return <Outlet />;
};

export default AdminProtectedRoute;