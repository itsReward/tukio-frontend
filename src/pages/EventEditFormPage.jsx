// src/pages/EventEditFormPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import EventEditForm from '../components/admin/EventEditForm';

/**
 * Event Edit Form Page Wrapper
 * This page allows admins to edit event details
 */
const EventEditFormPage = () => {
    return (
        <>
            <Helmet>
                <title>Edit Event | Tukio Admin</title>
                <meta
                    name="description"
                    content="Edit event details, update information, and manage event settings."
                />
            </Helmet>

            <EventEditForm />
        </>
    );
};

export default EventEditFormPage;