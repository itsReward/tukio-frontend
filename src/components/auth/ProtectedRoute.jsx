import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // If authentication is loading, show a loading spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="xl" />
            </div>
        );
    }

    // If user is not authenticated, redirect to login
    // Save the current location they were trying to go to
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If they are authenticated, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;