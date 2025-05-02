import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { CalendarIcon, MapPinIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';

const EventCard = ({ event }) => {
    const { isAuthenticated } = useAuth();

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM dd, yyyy • h:mm a');
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    };

    // Default placeholder image if no image is provided
    const defaultImage = '/assets/images/event-placeholder.jpg';

    // Get event status color
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'SCHEDULED':
                return 'badge-primary';
            case 'RESCHEDULED':
                return 'badge-warning';
            case 'CANCELLED':
                return 'badge-accent';
            case 'COMPLETED':
                return 'badge-success';
            default:
                return 'badge-secondary';
        }
    };

    return (
        <motion.div
            className="card overflow-hidden flex flex-col h-full"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl || defaultImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
          <span className={`badge ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
                </div>
            </div>

            {/* Event Info */}
            <div className="flex-1 p-4 flex flex-col">
                <div className="mb-2">
          <span className="badge badge-secondary text-xs">
            {event.categoryName}
          </span>
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {event.title}
                </h3>

                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>

                <div className="mt-auto space-y-2 text-sm text-neutral-600">
                    <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{formatDate(event.startTime)}</span>
                    </div>

                    <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location || event.venueName || 'Location TBD'}</span>
                    </div>

                    {event.maxParticipants && (
                        <div className="flex items-start">
                            <UserGroupIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>{event.currentRegistrations || 0} / {event.maxParticipants} participants</span>
                        </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                        <div className="flex items-start">
                            <TagIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div className="flex flex-wrap gap-1">
                                {event.tags.slice(0, 2).map((tag, index) => (
                                    <span key={index} className="text-xs text-neutral-500">
                    #{tag}{index < Math.min(event.tags.length, 2) - 1 ? ', ' : ''}
                  </span>
                                ))}
                                {event.tags.length > 2 && (
                                    <span className="text-xs text-neutral-500">+{event.tags.length - 2} more</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-neutral-200">
                <Link
                    to={`/events/${event.id}`}
                    className="btn btn-primary w-full"
                >
                    {isAuthenticated ? 'View Details' : 'View & Register'}
                </Link>
            </div>
        </motion.div>
    );
};

export default EventCard;