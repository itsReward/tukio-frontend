import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import venueService from '../../services/venueService';
import eventService from '../../services/eventService';

// Components
import Loader from '../common/Loader';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';

// Icons
import {
    MapPinIcon,
    UserGroupIcon,
    CheckIcon,
    BuildingOffice2Icon,
    CalendarIcon,
    ClockIcon,
    ArrowLeftIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const VenueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [venue, setVenue] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVenueData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch venue details
                const venueResponse = await venueService.getVenueById(id);
                setVenue(venueResponse.data);

                // Fetch upcoming events at this venue
                try {
                    // This is a hypothetical endpoint - in a real app, you would need to implement
                    // a way to fetch events by venue
                    const now = new Date().toISOString();
                    const searchParams = { venueId: id, startFrom: now };
                    const eventsResponse = await eventService.searchEvents(searchParams);
                    setUpcomingEvents(eventsResponse.data.slice(0, 5) || []);
                } catch (err) {
                    console.error('Error fetching venue events:', err);
                    // Don't fail the whole component if events can't be fetched
                    setUpcomingEvents([]);
                }
            } catch (err) {
                console.error('Error fetching venue data:', err);
                setError(err.response?.data?.message || 'Failed to load venue details');
            } finally {
                setLoading(false);
            }
        };

        fetchVenueData();
    }, [id]);

    // Format date
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'EEE, MMM d, yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Format time
    const formatTime = (dateString) => {
        try {
            return format(parseISO(dateString), 'h:mm a');
        } catch (error) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader size="lg" />
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Venue Not Found</h2>
                <p className="text-neutral-600 mb-6">{error || 'The requested venue could not be found.'}</p>
                <Button variant="primary" as="link" to="/venues">
                    Browse All Venues
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-neutral-600 hover:text-neutral-900"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Back
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
                    >
                        {/* Venue Image */}
                        <div className="relative h-64 md:h-80 bg-neutral-200">
                            {venue.imageUrl ? (
                                <img
                                    src={venue.imageUrl}
                                    alt={venue.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <BuildingOffice2Icon className="h-24 w-24 text-neutral-400" />
                                </div>
                            )}

                            {/* Venue Type Badge */}
                            <div className="absolute top-4 left-4">
                                <Badge variant="secondary" size="md">
                                    {venue.type?.replace('_', ' ')}
                                </Badge>
                            </div>

                            {/* Availability Badge */}
                            <div className="absolute top-4 right-4">
                                <Badge
                                    variant={venue.availabilityStatus ? 'success' : 'accent'}
                                    size="md"
                                >
                                    {venue.availabilityStatus ? 'Available' : 'Unavailable'}
                                </Badge>
                            </div>
                        </div>

                        {/* Venue Info */}
                        <div className="p-6">
                            <h1 className="text-3xl font-bold text-neutral-900 mb-4">{venue.name}</h1>

                            {/* Venue Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-start">
                                    <MapPinIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-neutral-700">Location</p>
                                        <p className="text-neutral-900 font-medium">{venue.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <UserGroupIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-neutral-700">Capacity</p>
                                        <p className="text-neutral-900 font-medium">{venue.capacity} people</p>
                                    </div>
                                </div>
                            </div>

                            {/* Venue Description */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-neutral-900 mb-3">About This Venue</h2>
                                <div className="prose prose-neutral max-w-none">
                                    {venue.description ? (
                                        <p className="text-neutral-700">{venue.description}</p>
                                    ) : (
                                        <p className="text-neutral-500 italic">No description available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Amenities */}
                            {venue.amenities && venue.amenities.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-neutral-900 mb-3">Amenities</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {venue.amenities.map((amenity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center bg-neutral-100 rounded-full px-3 py-1.5"
                                            >
                                                <CheckIcon className="h-4 w-4 text-success-600 mr-1.5" />
                                                <span className="text-sm text-neutral-700">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="border-t border-neutral-200 pt-6">
                                <Button
                                    variant="primary"
                                    as="link"
                                    to={`/events/create?venueId=${venue.id}`}
                                    fullWidth
                                >
                                    Book This Venue
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Events */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
                    >
                        <div className="p-5 border-b border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900">Upcoming Events</h2>
                        </div>
                        <div className="p-5">
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="block hover:bg-neutral-50 p-3 rounded-lg transition-colors"
                                        >
                                            <h3 className="font-medium text-neutral-900 mb-1">{event.title}</h3>
                                            <div className="flex items-center text-sm text-neutral-500 mb-1">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                <span>{formatDate(event.startTime)}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-neutral-500">
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-3">
                                        <CalendarIcon className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <p className="text-neutral-500">No upcoming events at this venue</p>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-neutral-200">
                                <Button
                                    variant="outline"
                                    as="link"
                                    to="/events"
                                    fullWidth
                                >
                                    Browse All Events
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Venue Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
                    >
                        <div className="p-5 border-b border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900">Venue Information</h2>
                        </div>
                        <div className="p-5">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-neutral-700">Venue Type</dt>
                                    <dd className="mt-1 text-neutral-900">{venue.type?.replace('_', ' ')}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-neutral-700">Building</dt>
                                    <dd className="mt-1 text-neutral-900">{venue.building || 'Not specified'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-neutral-700">Floor</dt>
                                    <dd className="mt-1 text-neutral-900">{venue.floor || 'Not specified'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-neutral-700">Accessible</dt>
                                    <dd className="mt-1 text-neutral-900">
                                        {venue.isAccessible ? (
                                            <span className="flex items-center text-success-600">
                        <CheckIcon className="h-5 w-5 mr-1" />
                        Yes
                      </span>
                                        ) : (
                                            'No'
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </motion.div>

                    {/* Contact & Booking Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
                    >
                        <div className="p-5 border-b border-neutral-200">
                            <h2 className="text-lg font-semibold text-neutral-900">Booking Information</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0">
                                    <InformationCircleIcon className="h-6 w-6 text-primary-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-neutral-700">
                                        To book this venue for your event, you can create a new event and select this venue during the creation process.
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                as="link"
                                to={`/events/create?venueId=${venue.id}`}
                                fullWidth
                            >
                                Create Event with This Venue
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VenueDetail;