import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import eventService from '../../services/eventService';
import EventItemRow from './EventItemRow';
import Loader from '../common/Loader';

/**
 * MyEvents Component (Fixed)
 *
 * Displays user's events with robust error handling and data validation
 */
const MyEvents = () => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        const fetchUserEvents = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch user registrations
                const response = await eventService.getRegistrationsByUser(currentUser.id);

                if (response?.data) {
                    setEvents(response.data);
                } else {
                    setEvents([]);
                }
            } catch (err) {
                console.error('Error fetching user events:', err);
                setError('Failed to load events. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserEvents();
    }, [currentUser]);

    // Filter events based on active tab
    const getFilteredEvents = () => {
        if (!events || events.length === 0) return [];

        const now = new Date();

        return events.filter(event => {
            try {
                // Try to create a date object from the startTime if it exists
                const eventDate = event.startTime ? new Date(event.startTime) : null;
                const isValidDate = eventDate && !isNaN(eventDate.getTime());

                if (activeTab === 'upcoming') {
                    // For upcoming, include events with valid future dates or invalid/missing dates
                    return isValidDate ? eventDate > now : true;
                } else if (activeTab === 'past') {
                    // For past, only include events with valid past dates
                    return isValidDate && eventDate <= now;
                } else if (activeTab === 'created') {
                    // For created events tab, check for organizer match
                    return event.organizerId === currentUser.id || event.isCreator === true;
                }

                // Default: include the event
                return true;
            } catch (error) {
                console.error('Error filtering event:', error);
                return true; // Include events that cause errors in the default tab
            }
        });
    };

    const filteredEvents = getFilteredEvents();

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader />
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
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">My Events</h2>

            {/* Filter tabs */}
            <div className="flex border-b border-neutral-200 mb-4">
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
                        <EventItemRow
                            key={event.id || event.eventId || `event-${Math.random()}`}
                            event={event}
                        />
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

export default MyEvents;