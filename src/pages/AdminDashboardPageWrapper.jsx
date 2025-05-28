// src/pages/AdminDashboardPageWrapper.jsx
import React from 'react';
import AdminDashboardPage from './AdminDashboardPage';


/**
 * Wrapper component for the Admin Dashboard Page
 */
const AdminDashboardPageWrapper = () => {
    return (
        <div className="pt-16">
            <AdminDashboardPage />
        </div>
    );
};

export default AdminDashboardPageWrapper;