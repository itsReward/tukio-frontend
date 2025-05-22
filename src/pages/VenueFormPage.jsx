// src/pages/VenueFormPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import VenueForm from '../components/venues/VenueForm';

const VenueFormPage = () => {
    const { id } = useParams();
    const isEditing = !!id;

    return (
        <>
            <Helmet>
                <title>{isEditing ? 'Edit Venue' : 'Create Venue'} | Tukio Admin</title>
                <meta
                    name="description"
                    content={`${isEditing ? 'Edit venue information' : 'Create a new venue'} for campus event management.`}
                />
            </Helmet>

            <VenueForm />
        </>
    );
};

export default VenueFormPage;