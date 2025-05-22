import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

/**
 * UserEventsList Component
 * Displays a user's events with filtering tabs
 */
const UserEventsList = ({ events }) => {
    const [activeTab, setActiveTab] = useState('upcoming');

    // Early return if no events
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                    <CalendarIcon className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
                <p className="text-neutral-600 mb-4">
                    You haven't registered for any events yet.
                </p>
                <Link
                    to="/events"
                    className="btn btn-primary"
                >
                    Browse Events
                </Link>
            </div>
        );
    }

    // Filter events based on active tab
    const now = new Date();

    const filteredEvents = events.filter(event => {
        try {
            const eventDate = new Date(event.startTime);

            if (activeTab === 'upcoming') {
                return eventDate > now;
            } else if (activeTab === 'past') {
                return eventDate <= now;
            } else if (activeTab === 'created') {
                // Assuming events created by the user have an `isCreator` property
                // This would need to be adjusted based on your actual data structure
                return event.isCreator === true;
            }
            return true;
        } catch (error) {
            console.error('Error processing event date:', error);
            return false;
        }
    });

    // Format date
    const formatDateString = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM d, yyyy');
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Date unavailable';
        }
    };

    // Format time
    const formatTimeString = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'h:mm a');
        } catch (error) {
            console.error('Time formatting error:', error);
            return 'Time unavailable';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter tabs */}
            <div className="flex border-b border-neutral-200">
                <button
                    className={`px-4 py-2 border-b-2 ${activeTab === 'upcoming'
                        ? 'border-primary-500 text-primary-600 font-medium'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`px-4 py-2 border-b-2 ${activeTab === 'past'
                        ? 'border-primary-500 text-primary-600 font-medium'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past
                </button>
                <button
                    className={`px-4 py-2 border-b-2 ${activeTab === 'created'
                        ? 'border-primary-500 text-primary-600 font-medium'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                    onClick={() => setActiveTab('created')}
                >
                    Created by Me
                </button>
            </div>

            {/* Events list */}
            {filteredEvents.length > 0 ? (
                <div className="divide-y divide-neutral-200">
                    {filteredEvents.map((event) => (
                        <div key={event.id || `event-${Math.random()}`} className="py-4 flex flex-col sm:flex-row sm:items-center">
                            <div className="flex-grow">
                                <h3 className="text-lg font-medium text-neutral-900">
                                    {event.eventTitle || event.title || 'Untitled Event'}
                                </h3>
                                <div className="mt-1 flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-1">
                                    <span className="flex items-center">
                                        <CalendarIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                        {formatDateString(event.startTime)}
                                    </span>
                                    <span className="flex items-center">
                                        <ClockIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                        {formatTimeString(event.startTime)}
                                    </span>
                                    <span className="flex items-center">
                                        <MapPinIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                        {event.location || event.venueName || 'Location TBD'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 sm:mt-0 flex items-center">
                                <span className={`mr-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    event.status === 'REGISTERED' ? 'bg-primary-100 text-primary-800' :
                                        event.status === 'ATTENDED' ? 'bg-success-100 text-success-800' :
                                            event.status === 'CANCELLED' ? 'bg-accent-100 text-accent-800' :
                                                'bg-neutral-100 text-neutral-800'
                                }`}>
                                    {event.status || 'REGISTERED'}
                                </span>
                                <Link
                                    to={`/events/${event.eventId || event.id}`}
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    View Event
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-neutral-600">No {activeTab} events found.</p>
                </div>
            )}
        </div>
    );
};

UserEventsList.propTypes = {
    /** Array of event objects */
    events: PropTypes.array.isRequired,
};

export default UserEventsList;