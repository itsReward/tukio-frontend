// src/pages/AdminVenuesPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminVenuesPage from '../components/venues/AdminVenuesPage';

const AdminVenuesPageWrapper = () => {
    return (
        <div className="pt-16">
            <Helmet>
                <title>Venue Management | Tukio Admin</title>
                <meta
                    name="description"
                    content="Manage campus venues, their availability, and amenities for event scheduling."
                />
            </Helmet>

            <AdminVenuesPage />
        </div>
    );
};

export default AdminVenuesPageWrapper;