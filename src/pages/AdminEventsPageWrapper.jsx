// src/pages/AdminEventsPageWrapper.jsx
import React from 'react';
import AdminEventsPage from '../components/admin/AdminEventsPage';

/**
 * Wrapper component for the Admin Events Page
 * This allows us to keep the page logic separate from routing
 */
const AdminEventsPageWrapper = () => {
    return <AdminEventsPage />;
};

export default AdminEventsPageWrapper;