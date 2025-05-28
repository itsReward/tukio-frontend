import React from 'react';
import CreateEventPage from './CreateEventPage';

/**
 * Event creation page wrapper
 */
const CreateEventWrapper = () => {
    console.log("Mounting Create Event page");

    return (
        <div className="pt-16">
            <CreateEventPage />
        </div>
    );
};

export default CreateEventWrapper;