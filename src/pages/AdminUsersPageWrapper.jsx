// src/pages/AdminUsersPageWrapper.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminUsersPage from '../components/admin/AdminUsersPage';

/**
 * Admin Users Page Wrapper
 * This page allows admins to manage user accounts and permissions
 */
const AdminUsersPageWrapper = () => {
    return (
        <div className="pt-16">
            <Helmet>
                <title>User Management | Tukio Admin</title>
                <meta
                    name="description"
                    content="Manage user accounts, roles, permissions, and user activities."
                />
            </Helmet>

            <AdminUsersPage />
        </div>
    );
};

export default AdminUsersPageWrapper;