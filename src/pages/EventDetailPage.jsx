// src/pages/EventDetailPage.jsx - Fixed attendance state management
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
import AttendanceModal from '../components/events/AttendanceModal';
import RatingModal from '../components/events/RatingModal';
import RecommendationsWidget from "../components/common/RecommendationsWidget.jsx";

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
    UserPlusIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const { trackView, trackRegistration, trackShare, trackRating } = useEventTracking();

    // Track attendance function
    const trackAttendance = async (eventId) => {
        if (!currentUser?.id || !eventId) return;
        console.log('Tracking attendance for event:', eventId);
    };

    const [event, setEvent] = useState(null);
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [rating, setRating] = useState(null);
    const [ratingSummary, setRatingSummary] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [viewStartTime, setViewStartTime] = useState(null);

    // Fetch attendance data
    const fetchAttendanceData = async () => {
        if (!isAuthenticated || !currentUser?.id) return;

        try {
            console.log('=== FETCHING ATTENDANCE DATA ===');
            console.log('Event ID:', id);
            console.log('User ID:', currentUser.id);

            // Try to get attendance record
            const attendanceResponse = await eventService.getMyAttendance(id, currentUser.id);
            console.log('Attendance response:', attendanceResponse.data);

            if (attendanceResponse.data) {
                setAttendance(attendanceResponse.data);
                console.log('Set attendance state:', attendanceResponse.data);
            } else {
                console.log('No attendance record found');
                setAttendance(null);
            }
        } catch (error) {
            console.log('No attendance record found or error fetching attendance:', error.message);
            setAttendance(null);
        }
    };

    // Fetch rating data
    const fetchRatingData = async () => {
        if (!isAuthenticated || !currentUser?.id) return;

        try {
            // Check rating
            const ratingResponse = await eventService.getMyRating(id, currentUser.id);
            setRating(ratingResponse.data);
        } catch (error) {
            // User hasn't rated yet
            setRating(null);
        }

        try {
            // Get rating summary
            const ratingSummaryResponse = await eventService.getEventRatingSummary(id);
            setRatingSummary(ratingSummaryResponse.data);
        } catch (error) {
            // No ratings yet
            setRatingSummary(null);
        }
    };

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setLoading(true);
                setViewStartTime(Date.now()); // Track when user started viewing

                // Fetch event details
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
                        // Check registration status
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

    // Separate useEffect for attendance and rating data
    useEffect(() => {
        if (isAuthenticated && currentUser?.id && event) {
            fetchAttendanceData();
            fetchRatingData();
        }
    }, [isAuthenticated, currentUser?.id, event, id]);

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

    // Handle attendance update - FIXED VERSION
    const handleAttendanceUpdate = async (attended) => {
        if (!isAuthenticated || !currentUser?.id) {
            return;
        }

        try {
            console.log('=== UPDATING ATTENDANCE ===');
            console.log('Event ID:', id);
            console.log('User ID:', currentUser.id);
            console.log('Attended status:', attended);

            const attendanceData = {
                userId: currentUser.id,
                attended: attended
            };

            console.log('Sending attendance data:', JSON.stringify(attendanceData, null, 2));

            const response = await eventService.recordAttendance(id, attendanceData);
            console.log('Attendance update response:', response.data);

            // Update local state immediately
            const updatedAttendance = {
                ...response.data,
                attended: attended // Ensure the attended status is set correctly
            };

            setAttendance(updatedAttendance);
            console.log('Updated local attendance state:', updatedAttendance);

            // Record activity for gamification if attended
            if (attended) {
                await gamificationService.recordEventAttendance(currentUser.id, parseInt(id));
                await trackAttendance(parseInt(id));
            }

            toast.success(`Attendance ${attended ? 'confirmed' : 'updated'} successfully!`);

            // If user can now rate, show notification
            if (attended && eventService.canRateEvent(event, updatedAttendance)) {
                setTimeout(() => {
                    toast.success('You can now rate this event!', {
                        duration: 4000,
                        icon: '⭐'
                    });
                }, 1000);
            }

            // Refresh attendance data to ensure consistency
            setTimeout(() => {
                fetchAttendanceData();
            }, 500);

        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error(error.response?.data?.message || 'Failed to update attendance');
            throw error; // Re-throw to handle in modal
        }
    };

    // Handle rating submission
    const handleRatingSubmit = async (ratingData) => {
        if (!isAuthenticated || !currentUser?.id) {
            return;
        }

        try {
            const submitData = {
                ...ratingData,
                userId: currentUser.id,
                userName: `${currentUser.firstName} ${currentUser.lastName}`
            };

            console.log('Sending rating data:', submitData);

            const response = await eventService.submitEventRating(id, submitData);

            setRating(response.data);

            // Record activity for gamification
            await gamificationService.recordEventRating(currentUser.id, parseInt(id), ratingData.overallRating);
            await trackRating(parseInt(id), ratingData.overallRating);

            // Refresh rating summary
            try {
                const ratingSummaryResponse = await eventService.getEventRatingSummary(id);
                setRatingSummary(ratingSummaryResponse.data);
            } catch (error) {
                console.error('Error refreshing rating summary:', error);
            }

            toast.success(rating ? 'Rating updated successfully!' : 'Thank you for your rating!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error(error.response?.data?.message || 'Failed to submit rating');
            throw error; // Re-throw to handle in modal
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
            return 'Event has started';
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

    // Check if user can mark attendance
    const canMarkAttendance = () => {
        if (!event || !isAuthenticated || registrationStatus !== 'REGISTERED') return false;
        return eventService.canMarkAttendance(event);
    };

    // Check if user can rate event
    const canRateEvent = () => {
        if (!event || !isAuthenticated || !attendance) return false;
        return eventService.canRateEvent(event, attendance);
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

                                {/* User Status Badges */}
                                {isAuthenticated && (
                                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                        {registrationStatus === 'REGISTERED' && (
                                            <span className="badge bg-success-500 text-white">
                                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                Registered
                                            </span>
                                        )}
                                        {attendance?.attended === true && (
                                            <span className="badge bg-blue-500 text-white">
                                                <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                                                Attended
                                            </span>
                                        )}
                                        {rating && (
                                            <span className="badge bg-amber-500 text-white">
                                                <StarIcon className="h-4 w-4 mr-1" />
                                                Rated
                                            </span>
                                        )}
                                    </div>
                                )}
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

                                {/* Rating Summary */}
                                {ratingSummary && ratingSummary.totalRatings > 0 && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon
                                                            key={star}
                                                            className={`h-5 w-5 ${
                                                                star <= Math.round(ratingSummary.averageRating)
                                                                    ? 'text-amber-400 fill-current'
                                                                    : 'text-neutral-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-amber-800">
                                                    {ratingSummary.averageRating.toFixed(1)}
                                                    ({ratingSummary.totalRatings} rating{ratingSummary.totalRatings !== 1 ? 's' : ''})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                    {/* Registration Button */}
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

                                    {/* Cancel Registration Button */}
                                    {canCancelRegistration() && (
                                        <button
                                            onClick={handleCancelRegistration}
                                            className="btn btn-outline text-accent-700 hover:bg-accent-50 border-accent-200 flex-1"
                                            disabled={isRegistering}
                                        >
                                            Cancel Registration
                                        </button>
                                    )}

                                    {/* Attendance Button */}
                                    {canMarkAttendance() && (
                                        <button
                                            onClick={() => setShowAttendanceModal(true)}
                                            className={`btn flex-1 ${
                                                attendance ? 'btn-outline' : 'btn-secondary'
                                            }`}
                                        >
                                            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                                            {attendance ? 'Update Attendance' : 'Mark Attendance'}
                                        </button>
                                    )}

                                    {/* Rating Button */}
                                    {canRateEvent() && (
                                        <button
                                            onClick={() => setShowRatingModal(true)}
                                            className={`btn flex-1 ${
                                                rating ? 'btn-outline' : 'btn-accent'
                                            }`}
                                        >
                                            <StarIcon className="h-5 w-5 mr-2" />
                                            {rating ? 'Update Rating' : 'Rate Event'}
                                        </button>
                                    )}

                                    {/* Share Button */}
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="btn btn-outline flex-1"
                                    >
                                        <ShareIcon className="h-5 w-5 mr-2" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Status Card */}
                        {isAuthenticated && registrationStatus && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
                            >
                                <div className="p-5 border-b border-neutral-200">
                                    <h2 className="text-lg font-semibold text-neutral-900">Your Status</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Registration Status */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">Registration</span>
                                        <span className={`badge ${
                                            registrationStatus === 'REGISTERED' ? 'badge-success' :
                                                registrationStatus === 'CANCELLED' ? 'badge-error' :
                                                    'badge-neutral'
                                        }`}>
                                            {registrationStatus}
                                        </span>
                                    </div>

                                    {/* Attendance Status - Debug version */}
                                    {attendance && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-600">Attendance</span>
                                            <span className={`badge ${
                                                attendance.attended ? 'badge-success' : 'badge-warning'
                                            }`}>
                                                {attendance.attended ? 'Attended' : 'Did Not Attend'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Rating Status */}
                                    {rating && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-600">Your Rating</span>
                                            <div className="flex items-center">
                                                <div className="flex items-center mr-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= rating.overallRating
                                                                    ? 'text-amber-400 fill-current'
                                                                    : 'text-neutral-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {rating.overallRating}/5
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Available Actions */}
                                    <div className="pt-4 border-t border-neutral-200">
                                        <h3 className="text-sm font-medium text-neutral-700 mb-3">Available Actions</h3>
                                        <div className="space-y-2">
                                            {canMarkAttendance() && (
                                                <button
                                                    onClick={() => setShowAttendanceModal(true)}
                                                    className="w-full text-left text-sm text-primary-600 hover:text-primary-800"
                                                >
                                                    {attendance ? '• Update attendance status' : '• Mark your attendance'}
                                                </button>
                                            )}
                                            {canRateEvent() && (
                                                <button
                                                    onClick={() => setShowRatingModal(true)}
                                                    className="w-full text-left text-sm text-primary-600 hover:text-primary-800"
                                                >
                                                    {rating ? '• Update your rating' : '• Rate this event'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                        {/* Venue Info Card */}
                        {venue && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
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

            {/* Attendance Modal */}
            <AttendanceModal
                isOpen={showAttendanceModal}
                onClose={() => setShowAttendanceModal(false)}
                event={event}
                currentAttendance={attendance}
                onAttendanceUpdate={handleAttendanceUpdate}
            />

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                event={event}
                currentRating={rating}
                onRatingSubmit={handleRatingSubmit}
            />

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