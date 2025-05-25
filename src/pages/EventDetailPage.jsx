import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useEventTracking } from '../hooks/useRecommendations';
import eventService from '../services/eventService';
import venueService from '../services/venueService';
import gamificationService from '../services/gamificationService';

// Components
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

// Icons
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
    TagIcon,
    ShareIcon,
    StarIcon,
    CheckIcon,
    ArrowLeftIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import RecommendationsWidget from "../components/common/RecommendationsWidget.jsx";

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const { trackView, trackRegistration, trackShare, trackRating } = useEventTracking();

    const [event, setEvent] = useState(null);
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [viewStartTime, setViewStartTime] = useState(null);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setLoading(true);
                setViewStartTime(Date.now()); // Track when user started viewing

                const eventResponse = await eventService.getEventById(id);
                setEvent(eventResponse.data);

                // Track event view
                if (isAuthenticated && currentUser?.id) {
                    await trackView(parseInt(id));
                }

                // If venue ID exists, fetch venue details
                if (eventResponse.data.venueId) {
                    try {
                        const venueResponse = await venueService.getVenueById(eventResponse.data.venueId);
                        setVenue(venueResponse.data);
                    } catch (error) {
                        console.error('Error fetching venue:', error);
                    }
                }

                // If user is logged in, check registration status
                if (isAuthenticated && currentUser?.id) {
                    try {
                        const registrationsResponse = await eventService.getRegistrationsByUser(currentUser.id);
                        const userRegistration = registrationsResponse.data.find(reg => reg.eventId === parseInt(id));
                        if (userRegistration) {
                            setRegistrationStatus(userRegistration.status);
                        }
                    } catch (error) {
                        console.error('Error checking registration status:', error);
                    }
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();

        // Track view duration when component unmounts
        return () => {
            if (viewStartTime && isAuthenticated && currentUser?.id) {
                const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000);
                if (viewDuration > 5) { // Only track if viewed for more than 5 seconds
                    trackView(parseInt(id), viewDuration);
                }
            }
        };
    }, [id, isAuthenticated, currentUser, trackView]);

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'EEEE, MMMM d, yyyy');
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

    // Handle event registration
    const handleRegister = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to register for events');
            navigate('/login');
            return;
        }

        try {
            setIsRegistering(true);

            const registrationData = {
                eventId: parseInt(id),
                userId: currentUser.id,
                userName: `${currentUser.firstName} ${currentUser.lastName}`,
                userEmail: currentUser.email
            };

            await eventService.registerForEvent(registrationData);

            // Record activity for gamification
            await gamificationService.recordEventRegistration(currentUser.id, parseInt(id));

            // Track registration activity for recommendations
            await trackRegistration(parseInt(id));

            setRegistrationStatus('REGISTERED');
            toast.success('Successfully registered for the event!');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Failed to register for event');
        } finally {
            setIsRegistering(false);
        }
    };

    // Handle registration cancellation
    const handleCancelRegistration = async () => {
        if (!isAuthenticated) {
            return;
        }

        try {
            setIsRegistering(true);

            // Find registration ID
            const registrationsResponse = await eventService.getRegistrationsByUser(currentUser.id);
            const userRegistration = registrationsResponse.data.find(reg => reg.eventId === parseInt(id));

            if (userRegistration) {
                await eventService.cancelRegistration(userRegistration.id);
                setRegistrationStatus('CANCELLED');
                toast.success('Registration cancelled successfully');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            toast.error('Failed to cancel registration');
        } finally {
            setIsRegistering(false);
        }
    };

    // Handle rating submission
    const handleSubmitRating = async () => {
        if (!isAuthenticated || !rating) {
            return;
        }

        try {
            setSubmittingFeedback(true);
            await eventService.submitFeedback(parseInt(id), currentUser.id, feedback, rating);

            // Record activity for gamification
            await gamificationService.recordEventRating(currentUser.id, parseInt(id), rating);

            // Track rating activity for recommendations
            await trackRating(parseInt(id), rating);

            toast.success('Thank you for your feedback!');
            setShowRatingModal(false);
            setRating(0);
            setFeedback('');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    // Handle sharing event
    const handleShare = async (platform) => {
        const url = window.location.href;
        const text = `Check out this event: ${event.title}`;

        let shareUrl;
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            default:
                // Copy to clipboard
                try {
                    await navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard!');
                    setShowShareModal(false);

                    // If authenticated, record sharing activity
                    if (isAuthenticated && currentUser?.id) {
                        gamificationService.recordEventSharing(currentUser.id, parseInt(id));
                        trackShare(parseInt(id));
                    }
                    return;
                } catch (err) {
                    console.error('Failed to copy link:', err);
                    toast.error('Failed to copy link');
                    return;
                }
        }

        // Open share dialog
        window.open(shareUrl, '_blank', 'width=600,height=400');
        setShowShareModal(false);

        // If authenticated, record sharing activity
        if (isAuthenticated && currentUser?.id) {
            gamificationService.recordEventSharing(currentUser.id, parseInt(id));
            trackShare(parseInt(id));
        }
    };

    // Get appropriate registration button text and status
    const getRegistrationButtonText = () => {
        const now = new Date();
        const eventStart = event ? new Date(event.startTime) : null;

        if (!eventStart) return 'Register';

        if (eventStart < now) {
            return 'Event has ended';
        }

        switch (registrationStatus) {
            case 'REGISTERED':
                return 'Registered';
            case 'ATTENDED':
                return 'Attended';
            case 'CANCELLED':
                return 'Registration Cancelled';
            default:
                return 'Register';
        }
    };

    // Check if registration is possible
    const canRegister = () => {
        if (!event) return false;

        const now = new Date();
        const eventStart = new Date(event.startTime);

        if (eventStart < now) return false;
        if (registrationStatus === 'REGISTERED' || registrationStatus === 'ATTENDED') return false;
        if (event.currentRegistrations >= event.maxParticipants) return false;

        return true;
    };

    // Check if user can cancel registration
    const canCancelRegistration = () => {
        if (!event || !isAuthenticated) return false;

        const now = new Date();
        const eventStart = new Date(event.startTime);

        if (eventStart < now) return false;
        if (registrationStatus !== 'REGISTERED') return false;

        return true;
    };

    // Check if rating is possible
    const canRate = () => {
        if (!event || !isAuthenticated) return false;

        const now = new Date();
        const eventEnd = new Date(event.endTime);

        if (eventEnd > now) return false;
        if (registrationStatus !== 'ATTENDED') return false;

        return true;
    };

    // Calculate progress to event
    const calculateEventProgress = () => {
        if (!event) return { status: 'upcoming', progressPercentage: 0 };

        const now = new Date();
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);

        if (now < start) {
            return { status: 'upcoming', progressPercentage: 0 };
        } else if (now > end) {
            return { status: 'completed', progressPercentage: 100 };
        } else {
            const totalDuration = end - start;
            const elapsed = now - start;
            const progressPercentage = Math.round((elapsed / totalDuration) * 100);
            return { status: 'ongoing', progressPercentage };
        }
    };

    const eventProgress = event ? calculateEventProgress() : { status: 'upcoming', progressPercentage: 0 };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader size="xl" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Event Not Found</h2>
                    <p className="text-neutral-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
                    <Link to="/events" className="btn btn-primary">
                        Browse All Events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back button */}
                <div className="py-4">
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
                            {/* Event Image */}
                            <div className="relative h-64 md:h-96 bg-neutral-200">
                                {event.imageUrl ? (
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-6xl">🎟️</span>
                                    </div>
                                )}

                                {/* Event Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="badge badge-secondary">
                                        {event.categoryName}
                                    </span>
                                </div>

                                {/* Event Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`badge ${
                                        eventProgress.status === 'upcoming' ? 'badge-primary' :
                                            eventProgress.status === 'ongoing' ? 'badge-warning' :
                                                'badge-success'
                                    }`}>
                                        {eventProgress.status === 'upcoming' ? 'Upcoming' :
                                            eventProgress.status === 'ongoing' ? 'Ongoing' :
                                                'Completed'}
                                    </span>
                                </div>
                            </div>

                            {/* Event Info */}
                            <div className="p-6">
                                <h1 className="text-3xl font-bold text-neutral-900 mb-2">{event.title}</h1>

                                {/* Event Progress Bar (if upcoming or ongoing) */}
                                {eventProgress.status !== 'completed' && (
                                    <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-4">
                                        <div
                                            className={`h-2.5 rounded-full ${eventProgress.status === 'upcoming' ? 'bg-primary-500' : 'bg-warning-500'}`}
                                            style={{ width: `${eventProgress.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                )}

                                {/* Event Meta */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-start">
                                        <CalendarIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-neutral-700">Date</p>
                                            <p className="text-neutral-900 font-medium">{formatDate(event.startTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <ClockIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-neutral-700">Time</p>
                                            <p className="text-neutral-900 font-medium">
                                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPinIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-neutral-700">Location</p>
                                            <p className="text-neutral-900 font-medium">
                                                {venue?.name || event.location || 'TBD'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <UserGroupIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-neutral-700">Participants</p>
                                            <p className="text-neutral-900 font-medium">
                                                {event.currentRegistrations || 0} / {event.maxParticipants}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Description */}
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-neutral-900 mb-3">About This Event</h2>
                                    <div className="prose prose-neutral max-w-none">
                                        {event.description.split('\n').map((paragraph, index) => (
                                            <p key={index} className="mb-4 text-neutral-700">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Event Tags */}
                                {event.tags && event.tags.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-semibold text-neutral-900 mb-3">Tags</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {event.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Organizer Info */}
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-neutral-900 mb-3">Organizer</h2>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <span className="text-primary-700 font-medium">
                                                {event.organizer.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-neutral-900 font-medium">{event.organizer}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 border-t border-neutral-200 pt-6">
                                    {canRegister() ? (
                                        <button
                                            onClick={handleRegister}
                                            className="btn btn-primary flex-1"
                                            disabled={isRegistering}
                                        >
                                            {isRegistering ? (
                                                <>
                                                    <Loader size="sm" color="white" />
                                                    <span className="ml-2">Registering...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlusIcon className="h-5 w-5 mr-2" />
                                                    Register Now
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            className={`btn flex-1 ${
                                                registrationStatus === 'REGISTERED' || registrationStatus === 'ATTENDED'
                                                    ? 'bg-success-500 hover:bg-success-600 text-white'
                                                    : 'btn-outline'
                                            }`}
                                            disabled={true}
                                        >
                                            {registrationStatus === 'REGISTERED' || registrationStatus === 'ATTENDED' ? (
                                                <>
                                                    <CheckIcon className="h-5 w-5 mr-2" />
                                                    {getRegistrationButtonText()}
                                                </>
                                            ) : (
                                                getRegistrationButtonText()
                                            )}
                                        </button>
                                    )}

                                    {canCancelRegistration() && (
                                        <button
                                            onClick={handleCancelRegistration}
                                            className="btn btn-outline text-accent-700 hover:bg-accent-50 border-accent-200 flex-1"
                                            disabled={isRegistering}
                                        >
                                            Cancel Registration
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="btn btn-outline flex-1"
                                    >
                                        <ShareIcon className="h-5 w-5 mr-2" />
                                        Share
                                    </button>

                                    {canRate() && (
                                        <button
                                            onClick={() => setShowRatingModal(true)}
                                            className="btn btn-outline flex-1"
                                        >
                                            <StarIcon className="h-5 w-5 mr-2" />
                                            Rate Event
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Venue Info Card */}
                        {venue && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
                            >
                                <div className="p-5 border-b border-neutral-200">
                                    <h2 className="text-lg font-semibold text-neutral-900">Venue Details</h2>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-medium text-neutral-900 mb-1">{venue.name}</h3>
                                    <p className="text-neutral-600 mb-4">{venue.location}</p>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start">
                                            <UserGroupIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-neutral-700">Capacity</p>
                                                <p className="text-neutral-900 font-medium">{venue.capacity} people</p>
                                            </div>
                                        </div>
                                        {venue.description && (
                                            <div className="flex items-start">
                                                <div className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0">
                                                    ℹ️
                                                </div>
                                                <div>
                                                    <p className="text-neutral-700">Description</p>
                                                    <p className="text-neutral-600">{venue.description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {venue.amenities && venue.amenities.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-neutral-700 mb-2">Amenities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {venue.amenities.map((amenity, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
                                                    >
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Recommended Events */}
                        <RecommendationsWidget
                            userId={currentUser?.id}
                            maxItems={3}
                        />

                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            <Modal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                title="Rate This Event"
            >
                <div className="p-5">
                    <p className="text-neutral-600 mb-4">
                        Your feedback helps improve future events. Please rate your experience.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Your Rating
                        </label>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                                        rating >= star ? 'text-amber-400' : 'text-neutral-300'
                                    }`}
                                >
                                    <StarIcon
                                        className={`h-8 w-8 ${
                                            rating >= star ? 'fill-current' : 'stroke-current'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="feedback" className="block text-sm font-medium text-neutral-700 mb-2">
                            Your Feedback (Optional)
                        </label>
                        <textarea
                            id="feedback"
                            name="feedback"
                            rows={4}
                            className="form-input"
                            placeholder="Tell us about your experience..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowRatingModal(false)}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmitRating}
                            className="btn btn-primary"
                            disabled={!rating || submittingFeedback}
                        >
                            {submittingFeedback ? (
                                <>
                                    <Loader size="sm" color="white" />
                                    <span className="ml-2">Submitting...</span>
                                </>
                            ) : (
                                'Submit Rating'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Share Modal */}
            <Modal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title="Share This Event"
            >
                <div className="p-5">
                    <p className="text-neutral-600 mb-4">
                        Share this event with your friends and colleagues.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => handleShare('facebook')}
                            className="btn btn-outline flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                            </svg>
                            Facebook
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className="btn btn-outline flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                            Twitter
                        </button>
                        <button
                            onClick={() => handleShare('linkedin')}
                            className="btn btn-outline flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.223 0h.002z" />
                            </svg>
                            LinkedIn
                        </button>
                        <button
                            onClick={() => handleShare('copy')}
                            className="btn btn-outline flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Link
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EventDetailPage;