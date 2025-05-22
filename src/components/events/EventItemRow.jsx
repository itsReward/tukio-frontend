import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

/**
 * EventItemRow Component
 *
 * A robust component to display event information with proper formatting
 * and fallbacks for missing or invalid data
 */
const EventItemRow = ({ event }) => {
    // Get a safe title with fallbacks
    const getEventTitle = () => {
        return event.eventTitle || event.title || "Untitled Event";
    };

    // Format date with fallback
    const formatDate = (dateString) => {
        if (!dateString) return "Date unavailable";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Date unavailable";

            // Format as "May 20, 2024"
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Date formatting error:", e);
            return "Date unavailable";
        }
    };

    // Format time with fallback
    const formatTime = (dateString) => {
        if (!dateString) return "Time unavailable";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Time unavailable";

            // Format as "2:30 PM"
            const options = { hour: '2-digit', minute: '2-digit' };
            return date.toLocaleTimeString(undefined, options);
        } catch (e) {
            console.error("Time formatting error:", e);
            return "Time unavailable";
        }
    };

    // Get location with fallbacks
    const getLocation = () => {
        return event.location || event.venueName || "Location TBD";
    };

    // Get event ID for links
    const getEventId = () => {
        return event.eventId || event.id;
    };

    // Get status with fallback
    const getStatus = () => {
        return event.status || "REGISTERED";
    };

    // Get status color
    const getStatusColor = () => {
        const status = getStatus();

        switch(status) {
            case 'REGISTERED':
                return 'bg-primary-100 text-primary-800';
            case 'ATTENDED':
                return 'bg-success-100 text-success-800';
            case 'CANCELLED':
                return 'bg-accent-100 text-accent-800';
            default:
                return 'bg-neutral-100 text-neutral-800';
        }
    };

    return (
        <div className="py-4 flex flex-col sm:flex-row sm:items-center border-b border-neutral-200 last:border-b-0">
            <div className="flex-grow">
                <h3 className="text-lg font-medium text-neutral-900">
                    {getEventTitle()}
                </h3>
                <div className="mt-1 flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-1">
                    <span className="flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                        {formatDate(event.startTime)}
                    </span>
                    <span className="flex items-center">
                        <ClockIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                        {formatTime(event.startTime)}
                    </span>
                    <span className="flex items-center">
                        <MapPinIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                        {getLocation()}
                    </span>
                </div>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center">
                <span className={`mr-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {getStatus()}
                </span>
                <Link
                    to={`/events/${getEventId()}`}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                    View Event
                </Link>
            </div>
        </div>
    );
};

EventItemRow.propTypes = {
    /** Event object */
    event: PropTypes.object.isRequired
};

export default EventItemRow;