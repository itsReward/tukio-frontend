import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, MapPinIcon, TagIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import eventService from '../../services/eventService';
import venueService from '../../services/venueService';
import { EVENT_STATUSES, VENUE_TYPES } from '../../utils/constants';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

// Load ApiTester for debugging
useEffect(() => {
    loadApiTester();

    // Modify eventService to add BASE_URL if not present
    if (!eventService.BASE_URL) {
        eventService.BASE_URL = 'tukio-events-service/api/events';
        console.log("Set BASE_URL for event service:", eventService.BASE_URL);
    }
}, []);

/**
 * Event Form Component
 * Used for both creating and editing events
 */
const EventForm = ({ isEditing = false }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    // Check for venueId in query params
    const queryParams = new URLSearchParams(location.search);
    const venueIdParam = queryParams.get('venueId');

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [venues, setVenues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [venuesLoading, setVenuesLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');

    // Form validation schema
    const validationSchema = Yup.object({
        title: Yup.string()
            .required('Event title is required')
            .max(100, 'Title must be 100 characters or less'),
        description: Yup.string()
            .required('Description is required')
            .max(2000, 'Description must be 2000 characters or less'),
        startTime: Yup.date()
            .required('Start time is required')
            .min(new Date(), 'Start time must be in the future'),
        endTime: Yup.date()
            .required('End time is required')
            .min(
                Yup.ref('startTime'),
                'End time must be after start time'
            ),
        categoryId: Yup.number()
            .required('Category is required'),
        location: Yup.string()
            .when('venueId', {
                is: (value) => !value,
                then: Yup.string().required('Location is required if no venue is selected'),
                otherwise: Yup.string()
            }),
        venueId: Yup.number()
            .nullable()
            .when('location', {
                is: (value) => !value,
                then: Yup.number().required('Venue or location is required'),
                otherwise: Yup.number().nullable()
            }),
        maxParticipants: Yup.number()
            .required('Maximum participants is required')
            .min(1, 'Maximum participants must be at least 1')
            .integer('Maximum participants must be a whole number'),
        imageUrl: Yup.string()
            .url('Invalid URL format')
            .nullable(),
        status: Yup.string()
            .required('Status is required')
            .oneOf(Object.values(EVENT_STATUSES), 'Invalid status')
    });

    // Initialize form with default values
    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            categoryId: '',
            location: '',
            venueId: venueIdParam || null,
            maxParticipants: 50,
            imageUrl: '',
            tags: [],
            status: EVENT_STATUSES.SCHEDULED,
            organizer: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown Organizer',
            organizerId: currentUser?.id || 0
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setSubmitError(null);

                // Format dates properly for API
                const formattedValues = {
                    ...values,
                    startTime: new Date(values.startTime).toISOString(),
                    endTime: new Date(values.endTime).toISOString(),
                    categoryId: Number(values.categoryId),
                    maxParticipants: Number(values.maxParticipants),
                    venueId: values.venueId ? Number(values.venueId) : null,
                    organizer: values.organizer || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Unknown Organizer'
                };

                let response;

                if (isEditing) {
                    response = await eventService.updateEvent(id, formattedValues);
                    toast.success('Event updated successfully!');
                } else {
                    response = await eventService.createEvent(formattedValues);
                    toast.success('Event created successfully!');
                }

                // Navigate to the event details page
                navigate(`/events/${response.data.id}`);
            } catch (error) {
                console.error('Error submitting event:', error);

                // Try to extract more detailed error information
                let errorMessage = 'Failed to save event. Please try again.';

                if (error.response) {
                    console.log("Error response status:", error.response.status);
                    console.log("Error response headers:", error.response.headers);
                    console.log("Error response data:", error.response.data);

                    // Try to parse the responseText if available
                    if (error.request && error.request.responseText) {
                        try {
                            const errorResponseText = error.request.responseText;
                            console.log("Raw error response text:", errorResponseText);

                            const parsedError = JSON.parse(errorResponseText);
                            console.log("Parsed error response:", parsedError);

                            if (parsedError.message) {
                                errorMessage = parsedError.message;
                            } else if (parsedError.error) {
                                errorMessage = parsedError.error;
                            }
                        } catch (e) {
                            console.error("Error parsing error response:", e);
                        }
                    }

                    if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data && typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    }
                }

                setSubmitError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        }
    });

    // Fetch event data if editing
    useEffect(() => {
        const fetchEventData = async () => {
            if (isEditing && id) {
                try {
                    setLoading(true);
                    const response = await eventService.getEventById(id);
                    const event = response.data;

                    // Format dates for form inputs
                    const startTime = new Date(event.startTime);
                    const endTime = new Date(event.endTime);

                    // Set form values
                    formik.setValues({
                        title: event.title || '',
                        description: event.description || '',
                        startTime: startTime.toISOString().slice(0, 16),
                        endTime: endTime.toISOString().slice(0, 16),
                        categoryId: event.categoryId || '',
                        location: event.location || '',
                        venueId: event.venueId || null,
                        maxParticipants: event.maxParticipants || 50,
                        imageUrl: event.imageUrl || '',
                        tags: event.tags || [],
                        status: event.status || EVENT_STATUSES.SCHEDULED,
                        organizerId: event.organizerId || currentUser?.id || 0,
                        organizer: event.organizer || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Unknown Organizer'
                    });
                } catch (error) {
                    console.error('Error fetching event:', error);
                    setSubmitError('Failed to load event data. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchEventData();
    }, [isEditing, id, currentUser]);

    // Fetch venues and categories
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setVenuesLoading(true);
                const response = await venueService.getAllVenues();
                setVenues(response.data);
            } catch (error) {
                console.error('Error fetching venues:', error);
            } finally {
                setVenuesLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await eventService.getAllCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchVenues();
        fetchCategories();
    }, []);

    // Handle tag input
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formik.values.tags.includes(tag)) {
            formik.setFieldValue('tags', [...formik.values.tags, tag]);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove) => {
        formik.setFieldValue(
            'tags',
            formik.values.tags.filter(tag => tag !== tagToRemove)
        );
    };

    if (loading && isEditing) {
        return (
            <div className="flex justify-center my-8">
                <Loader size="lg" text="Loading event data..." />
            </div>
        );
    }

    // For debugging - log form values and errors
    console.log("Form values being submitted:", formattedValues);
    console.log("Form errors:", formik.errors);
    console.log("Form is submitting:", loading);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="max-w-4xl mx-auto">
                <Card.Header>
                    <Card.Title>{isEditing ? 'Edit Event' : 'Create New Event'}</Card.Title>
                    <Card.Subtitle>
                        {isEditing
                            ? 'Update the details of your event'
                            : 'Fill in the details to create a new event'}
                    </Card.Subtitle>
                </Card.Header>

                <Card.Body>
                    {submitError && (
                        <div className="mb-6 p-4 bg-accent-50 text-accent-700 rounded-md border border-accent-200">
                            <p>{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={(e) => {
                        console.log("Form submit event triggered");
                        formik.handleSubmit(e);
                    }} className="space-y-6">
                        {/* Event Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                                Event Title *
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                className={`form-input ${
                                    formik.touched.title && formik.errors.title ? 'border-accent-500' : ''
                                }`}
                                placeholder="Enter a descriptive title for your event"
                                {...formik.getFieldProps('title')}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <p className="mt-1 text-sm text-accent-600">{formik.errors.title}</p>
                            )}
                        </div>

                        {/* Event Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                className={`form-input ${
                                    formik.touched.description && formik.errors.description ? 'border-accent-500' : ''
                                }`}
                                placeholder="Provide details about your event"
                                {...formik.getFieldProps('description')}
                            />
                            <div className="flex justify-between">
                                {formik.touched.description && formik.errors.description && (
                                    <p className="mt-1 text-sm text-accent-600">{formik.errors.description}</p>
                                )}
                                <p className="mt-1 text-xs text-neutral-500 text-right">
                                    {formik.values.description.length}/2000
                                </p>
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Start Date & Time *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-5 w-5 text-neutral-500" />
                                    </div>
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="datetime-local"
                                        className={`form-input pl-10 ${
                                            formik.touched.startTime && formik.errors.startTime ? 'border-accent-500' : ''
                                        }`}
                                        {...formik.getFieldProps('startTime')}
                                    />
                                </div>
                                {formik.touched.startTime && formik.errors.startTime && (
                                    <p className="mt-1 text-sm text-accent-600">{formik.errors.startTime}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 mb-1">
                                    End Date & Time *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ClockIcon className="h-5 w-5 text-neutral-500" />
                                    </div>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="datetime-local"
                                        className={`form-input pl-10 ${
                                            formik.touched.endTime && formik.errors.endTime ? 'border-accent-500' : ''
                                        }`}
                                        {...formik.getFieldProps('endTime')}
                                    />
                                </div>
                                {formik.touched.endTime && formik.errors.endTime && (
                                    <p className="mt-1 text-sm text-accent-600">{formik.errors.endTime}</p>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-1">
                                Category *
                            </label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                className={`form-select ${
                                    formik.touched.categoryId && formik.errors.categoryId ? 'border-accent-500' : ''
                                }`}
                                {...formik.getFieldProps('categoryId')}
                            >
                                <option value="">Select a category</option>
                                {categoriesLoading ? (
                                    <option disabled>Loading categories...</option>
                                ) : (
                                    categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {formik.touched.categoryId && formik.errors.categoryId && (
                                <p className="mt-1 text-sm text-accent-600">{formik.errors.categoryId}</p>
                            )}
                        </div>

                        {/* Location and Venue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Location
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPinIcon className="h-5 w-5 text-neutral-500" />
                                    </div>
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        className={`form-input pl-10 ${
                                            formik.touched.location && formik.errors.location ? 'border-accent-500' : ''
                                        }`}
                                        placeholder="Location name or address"
                                        {...formik.getFieldProps('location')}
                                    />
                                </div>
                                {formik.touched.location && formik.errors.location && (
                                    <p className="mt-1 text-sm text-accent-600">{formik.errors.location}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="venueId" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Campus Venue
                                </label>
                                <select
                                    id="venueId"
                                    name="venueId"
                                    className={`form-select ${
                                        formik.touched.venueId && formik.errors.venueId ? 'border-accent-500' : ''
                                    }`}
                                    {...formik.getFieldProps('venueId')}
                                >
                                    <option value="">Select a venue (optional)</option>
                                    {venuesLoading ? (
                                        <option disabled>Loading venues...</option>
                                    ) : (
                                        venues.map((venue) => (
                                            <option key={venue.id} value={venue.id}>
                                                {venue.name} ({venue.capacity} capacity)
                                            </option>
                                        ))
                                    )}
                                </select>
                                {formik.touched.venueId && formik.errors.venueId && (
                                    <p className="mt-1 text-sm text-accent-600">{formik.errors.venueId}</p>
                                )}
                                <p className="mt-1 text-xs text-neutral-500">
                                    Note: Either Location or Campus Venue is required
                                </p>
                            </div>
                        </div>

                        {/* Max Participants */}
                        <div>
                            <label htmlFor="maxParticipants" className="block text-sm font-medium text-neutral-700 mb-1">
                                Maximum Participants *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-neutral-500" />
                                </div>
                                <input
                                    id="maxParticipants"
                                    name="maxParticipants"
                                    type="number"
                                    min="1"
                                    step="1"
                                    className={`form-input pl-10 ${
                                        formik.touched.maxParticipants && formik.errors.maxParticipants ? 'border-accent-500' : ''
                                    }`}
                                    {...formik.getFieldProps('maxParticipants')}
                                />
                            </div>
                            {formik.touched.maxParticipants && formik.errors.maxParticipants && (
                                <p className="mt-1 text-sm text-accent-600">{formik.errors.maxParticipants}</p>
                            )}
                        </div>

                        {/* Image URL */}
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1">
                                Event Image URL
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                className={`form-input ${
                                    formik.touched.imageUrl && formik.errors.imageUrl ? 'border-accent-500' : ''
                                }`}
                                placeholder="https://example.com/image.jpg"
                                {...formik.getFieldProps('imageUrl')}
                            />
                            {formik.touched.imageUrl && formik.errors.imageUrl && (
                                <p className="mt-1 text-sm text-accent-600">{formik.errors.imageUrl}</p>
                            )}
                            <p className="mt-1 text-xs text-neutral-500">
                                Provide a URL to an image for your event (optional)
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 mb-1">
                                Tags
                            </label>
                            <div className="flex items-center">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TagIcon className="h-5 w-5 text-neutral-500" />
                                    </div>
                                    <input
                                        id="tagInput"
                                        type="text"
                                        className="form-input pl-10"
                                        placeholder="Add tags (press Enter or comma to add)"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                        onKeyDown={handleTagInputKeyDown}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="ml-2 btn btn-outline"
                                    onClick={addTag}
                                >
                                    Add
                                </button>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {formik.values.tags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm flex items-center"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            className="ml-1 text-primary-600 hover:text-primary-800"
                                            onClick={() => removeTag(tag)}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                                Add tags to help users find your event (optional)
                            </p>
                        </div>

                        {/* Status (only for editing) */}
                        {isEditing && (
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Event Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className={`form-select ${
                                        formik.touched.status && formik.errors.status ? 'border-accent-500' : ''
                                    }`}
                                    {...formik.getFieldProps('status')}
                                >
                                    {Object.entries(EVENT_STATUSES).map(([key, value]) => (
                                        <option key={key} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.status && formik.errors.status && (
                                    <p className="mt-1 text-sm text-accent-600">{formik.errors.status}</p>
                                )}
                            </div>
                        )}

                        {/* Submit buttons */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="outline-neutral"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={loading}
                                onClick={() => {
                                    console.log("Submit button clicked");
                                    console.log("Form is valid:", formik.isValid);
                                    console.log("Form errors:", formik.errors);
                                    console.log("Form values:", formik.values);
                                    // The formik.handleSubmit() will be called by the form's onSubmit
                                }}
                            >
                                {isEditing ? 'Update Event' : 'Create Event'}
                            </Button>
                        </div>
                    </form>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

export default EventForm;