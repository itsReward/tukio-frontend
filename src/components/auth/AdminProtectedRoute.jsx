// src/components/auth/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Admin Protected Route Component
 * Renders the children only if the user is authenticated AND has admin role
 * Otherwise, redirects to the dashboard with an error message
 */
const AdminProtectedRoute = () => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but not admin, redirect to dashboard
    if (!currentUser?.roles?.includes('ADMIN')) {
        return <Navigate to="/dashboard" state={{
            error: 'Access denied. Administrator privileges required.'
        }} replace />;
    }

    // If authenticated and admin, render the protected content
    return <Outlet />;
};

export default AdminProtectedRoute;