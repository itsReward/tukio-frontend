import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const UpcomingEvents = ({ events = [] }) => {
    // Format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'EEE, MMM d, yyyy');
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    };

    // Format time
    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'h:mm a');
        } catch (error) {
            console.error('Time formatting error:', error);
            return dateString;
        }
    };

    // Filter events to show only upcoming ones
    const upcomingEvents = events.filter(event =>
        new Date(event.startTime) > new Date()
    ).sort((a, b) =>
        new Date(a.startTime) - new Date(b.startTime)
    ).slice(0, 5); // Limit to 5 events

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
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
        <div>
            {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex flex-col sm:flex-row sm:items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-200 hover:bg-primary-50 transition-colors">
                            {/* Event Date Box */}
                            <div className="w-full sm:w-auto flex-shrink-0 mb-4 sm:mb-0">
                                <div className="w-full sm:w-20 h-20 rounded-lg bg-primary-600 text-white flex flex-col items-center justify-center">
                  <span className="text-xs font-medium uppercase">
                    {formatDate(event.startTime).split(',')[0]}
                  </span>
                                    <span className="text-2xl font-bold">
                    {new Date(event.startTime).getDate()}
                  </span>
                                    <span className="text-xs">
                    {format(new Date(event.startTime), 'MMM yyyy')}
                  </span>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="sm:ml-4 flex-grow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-base font-semibold text-neutral-900">
                                        <Link to={`/events/${event.eventId}`} className="hover:text-primary-600">
                                            {event.title}
                                        </Link>
                                    </h3>
                                    <div className="mt-2 sm:mt-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                                    </div>
                                </div>

                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="flex items-center text-sm text-neutral-600">
                                        <ClockIcon className="h-4 w-4 mr-1 text-neutral-500" />
                                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                    </div>
                                    <div className="flex items-center text-sm text-neutral-600">
                                        <MapPinIcon className="h-4 w-4 mr-1 text-neutral-500" />
                                        {event.location || 'Location TBD'}
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 sm:mt-0 sm:ml-4">
                                <Link
                                    to={`/events/${event.eventId}`}
                                    className="inline-flex items-center text-primary-600 hover:text-primary-800"
                                >
                                    <span>View</span>
                                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2 text-center">
                        <Link
                            to="/events/my-events"
                            className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
                        >
                            View all my events
                            <ArrowRightIcon className="ml-1 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                        <CalendarIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No upcoming events</h3>
                    <p className="text-neutral-600 mb-4">
                        You don't have any upcoming events. Browse and register for events to see them here.
                    </p>
                    <Link
                        to="/events"
                        className="btn btn-primary"
                    >
                        Browse Events
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UpcomingEvents;