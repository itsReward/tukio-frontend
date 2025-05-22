import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Loader from '../common/Loader';
import eventService from '../../services/eventService';

/**
 * ProfileEventsTab Component
 * Displays the My Events tab content in the user's profile
 */
const ProfileEventsTab = ({ userId }) => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserEvents = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const response = await eventService.getRegistrationsByUser(userId);
                setEvents(response.data || []);
            } catch (err) {
                console.error('Error fetching user events:', err);
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        };

        fetchUserEvents();
    }, [userId]);

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
                // Assuming "Created by Me" tab shows events where the user is the organizer
                return event.isCreator === true || event.organizerId === userId;
            }
            return true;
        } catch (error) {
            // If date parsing fails, include the event
            return true;
        }
    });

    // Format date
    const formatDateString = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date unavailable';
            return format(date, 'MMM d, yyyy');
        } catch (error) {
            return 'Date unavailable';
        }
    };

    // Format time
    const formatTimeString = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Time unavailable';
            return format(date, 'h:mm a');
        } catch (error) {
            return 'Time unavailable';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-accent-600 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (events.length === 0) {
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

    return (
        <div>
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

            {/* Event list */}
            {filteredEvents.length > 0 ? (
                <div className="divide-y divide-neutral-200 mt-4">
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
                <div className="text-center py-6 mt-4">
                    <p className="text-neutral-600">No {activeTab} events found.</p>
                </div>
            )}

            {events.length > 5 && (
                <div className="mt-6 text-center">
                    <Link
                        to="/events/my-events"
                        className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                        View all {events.length} events
                    </Link>
                </div>
            )}
        </div>
    );
};

ProfileEventsTab.propTypes = {
    /** User ID to fetch events for */
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ProfileEventsTab;