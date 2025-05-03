import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import eventService from '../../services/eventService';
import gamificationService from '../../services/gamificationService';

// Components
import Loader from '../common/Loader';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';

// Icons
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
    CheckIcon,
    XMarkIcon,
    TicketIcon,
    UserIcon,
    EnvelopeIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const EventRegistration = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        additionalInfo: '',
        acceptTerms: false
    });

    // Fetch event data
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setLoading(true);
                const eventResponse = await eventService.getEventById(id);
                setEvent(eventResponse.data);

                // Pre-fill form with user data if authenticated
                if (isAuthenticated && currentUser) {
                    setFormData({
                        ...formData,
                        firstName: currentUser.firstName || '',
                        lastName: currentUser.lastName || '',
                        email: currentUser.email || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Failed to load event details');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [id, isAuthenticated, currentUser, navigate]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Form validation
        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!formData.acceptTerms) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        try {
            setSubmitting(true);

            const registrationData = {
                eventId: parseInt(id),
                userId: isAuthenticated ? currentUser.id : null,
                userName: `${formData.firstName} ${formData.lastName}`,
                userEmail: formData.email,
                additionalInfo: formData.additionalInfo || null
            };

            await eventService.registerForEvent(registrationData);

            // Record activity for gamification if user is authenticated
            if (isAuthenticated && currentUser?.id) {
                await gamificationService.recordEventRegistration(currentUser.id, parseInt(id));
            }

            toast.success('Successfully registered for the event!');
            navigate(`/events/${id}?registered=true`);
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Failed to register for event');
        } finally {
            setSubmitting(false);
        }
    };

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

    // Check if registration is possible
    const canRegister = () => {
        if (!event) return false;

        const now = new Date();
        const eventStart = new Date(event.startTime);

        if (eventStart < now) return false;
        if (event.currentRegistrations >= event.maxParticipants) return false;

        return true;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader size="lg" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Event Not Found</h2>
                <p className="text-neutral-600 mb-6">The event you're trying to register for doesn't exist or has been removed.</p>
                <Button variant="primary" as="link" to="/events">
                    Browse All Events
                </Button>
            </div>
        );
    }

    if (!canRegister()) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Registration Unavailable</h2>
                <p className="text-neutral-600 mb-6">
                    {event.currentRegistrations >= event.maxParticipants
                        ? 'This event has reached its maximum capacity.'
                        : 'Registration for this event is no longer available.'}
                </p>
                <Button variant="primary" as="link" to={`/events/${id}`}>
                    View Event Details
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Register for Event</h1>
                <p className="text-neutral-600">
                    Complete the form below to register for this event.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Registration Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <Card.Header>
                            <Card.Title>Registration Form</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">
                                            First Name <span className="text-accent-600">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="form-input pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">
                                            Last Name <span className="text-accent-600">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="form-input pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Email Address <span className="text-accent-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="form-input pl-10"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        We'll email you a confirmation and reminder before the event.
                                    </p>
                                </div>

                                {/* Additional Information */}
                                <div>
                                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Additional Information (Optional)
                                    </label>
                                    <textarea
                                        id="additionalInfo"
                                        name="additionalInfo"
                                        rows={4}
                                        value={formData.additionalInfo}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Any special requirements or questions?"
                                    />
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="acceptTerms"
                                            name="acceptTerms"
                                            type="checkbox"
                                            checked={formData.acceptTerms}
                                            onChange={handleInputChange}
                                            className="form-checkbox"
                                            required
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="acceptTerms" className="text-neutral-600">
                                            I agree to the event terms and policies, including the cancellation policy.
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="outline-neutral"
                                        as="link"
                                        to={`/events/${id}`}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        icon={<TicketIcon className="h-5 w-5" />}
                                        iconPosition="left"
                                        loading={submitting}
                                        disabled={submitting}
                                    >
                                        Complete Registration
                                    </Button>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </motion.div>

                {/* Event Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card>
                        <Card.Header>
                            <Card.Title>Event Summary</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-900">{event.title}</h3>

                                {/* Event Badge */}
                                <div>
                                    <Badge variant="secondary" size="md">
                                        {event.categoryName}
                                    </Badge>
                                </div>

                                {/* Event Meta */}
                                <div className="space-y-3 text-sm">
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
                                                {event.location || 'TBD'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <UserGroupIcon className="h-5 w-5 mr-2 text-neutral-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-neutral-700">Availability</p>
                                            <p className="text-neutral-900 font-medium">
                                                {event.maxParticipants - event.currentRegistrations} spots left
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Registration Notes */}
                                <div className="border-t border-neutral-200 pt-4 mt-4">
                                    <h4 className="text-sm font-medium text-neutral-900 mb-2">
                                        Important Notes
                                    </h4>
                                    <ul className="space-y-2 text-sm text-neutral-600">
                                        <li className="flex items-start">
                                            <CheckCircleIcon className="h-5 w-5 mr-2 text-success-500 flex-shrink-0" />
                                            <span>You will receive a confirmation email after registration.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircleIcon className="h-5 w-5 mr-2 text-success-500 flex-shrink-0" />
                                            <span>Cancellations are allowed up to 24 hours before the event.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircleIcon className="h-5 w-5 mr-2 text-success-500 flex-shrink-0" />
                                            <span>Please arrive 15 minutes before the start time.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default EventRegistration;