// src/components/admin/EventEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Components
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import Loader from '../common/Loader.jsx';

// Services
import eventService from '../../services/eventService.js';
import venueService from '../../services/venueService.js';

// Icons
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    TagIcon,
    UserIcon,
    XMarkIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const EventEditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [event, setEvent] = useState(null);
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Validation schema
    const validationSchema = Yup.object({
        title: Yup.string()
            .min(3, 'Title must be at least 3 characters')
            .max(100, 'Title must be less than 100 characters')
            .required('Title is required'),
        description: Yup.string()
            .min(10, 'Description must be at least 10 characters')
            .max(2000, 'Description must be less than 2000 characters')
            .required('Description is required'),
        startTime: Yup.date()
            .min(new Date(), 'Start time must be in the future')
            .required('Start time is required'),
        endTime: Yup.date()
            .min(Yup.ref('startTime'), 'End time must be after start time')
            .required('End time is required'),
        categoryId: Yup.number()
            .positive('Please select a category')
            .required('Category is required'),
        maxParticipants: Yup.number()
            .min(1, 'Must allow at least 1 participant')
            .max(10000, 'Too many participants')
            .required('Maximum participants is required'),
        organizer: Yup.string()
            .min(2, 'Organizer name must be at least 2 characters')
            .required('Organizer is required'),
        location: Yup.string().when('venueId', {
            is: (venueId) => !venueId,
            then: Yup.string().required('Either location or venue is required'),
            otherwise: Yup.string()
        }),
        imageUrl: Yup.string().url('Must be a valid URL')
    });

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            categoryId: '',
            location: '',
            venueId: '',
            maxParticipants: '',
            organizer: '',
            imageUrl: '',
            tags: [],
            status: 'SCHEDULED'
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setSubmitting(true);
                await eventService.updateEvent(id, values);
                toast.success('Event updated successfully!');
                navigate('/admin/events');
            } catch (error) {
                console.error('Error updating event:', error);
                toast.error(error.response?.data?.message || 'Failed to update event');
            } finally {
                setSubmitting(false);
            }
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch event, categories, and venues in parallel
                const [eventResponse, categoriesResponse, venuesResponse] = await Promise.all([
                    eventService.getEventById(id),
                    eventService.getAllCategories(),
                    venueService.getAllVenues()
                ]);

                const eventData = eventResponse.data;
                setEvent(eventData);
                setCategories(categoriesResponse.data || []);
                setVenues(venuesResponse.data || []);

                // Set form values
                formik.setValues({
                    title: eventData.title || '',
                    description: eventData.description || '',
                    startTime: eventData.startTime ? eventData.startTime.slice(0, 16) : '',
                    endTime: eventData.endTime ? eventData.endTime.slice(0, 16) : '',
                    categoryId: eventData.categoryId || '',
                    location: eventData.location || '',
                    venueId: eventData.venueId || '',
                    maxParticipants: eventData.maxParticipants || '',
                    organizer: eventData.organizer || '',
                    imageUrl: eventData.imageUrl || '',
                    tags: eventData.tags || [],
                    status: eventData.status || 'SCHEDULED'
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load event data');
                navigate('/admin/events');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

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

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-64">
                    <Loader size="lg" text="Loading event data..." />
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                    <p className="text-gray-600 mb-6">The event you're trying to edit doesn't exist.</p>
                    <Button onClick={() => navigate('/admin/events')}>
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/admin/events')}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
                                <p className="text-gray-600">Update event details and settings</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formik.values.status}
                            onChange={(e) => formik.setFieldValue('status', e.target.value)}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="RESCHEDULED">Rescheduled</option>
                        </select>
                    </div>
                </div>

                {/* Form */}
                <Card className="p-6">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Event Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Event Title *
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                    formik.touched.title && formik.errors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter a descriptive title for your event"
                                {...formik.getFieldProps('title')}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
                            )}
                        </div>

                        {/* Event Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                    formik.touched.description && formik.errors.description ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Provide details about your event"
                                {...formik.getFieldProps('description')}
                            />
                            <div className="flex justify-between">
                                {formik.touched.description && formik.errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 text-right">
                                    {formik.values.description.length}/2000
                                </p>
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date & Time *
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="datetime-local"
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            formik.touched.startTime && formik.errors.startTime ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        {...formik.getFieldProps('startTime')}
                                    />
                                </div>
                                {formik.touched.startTime && formik.errors.startTime && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.startTime}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date & Time *
                                </label>
                                <div className="relative">
                                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="datetime-local"
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            formik.touched.endTime && formik.errors.endTime ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        {...formik.getFieldProps('endTime')}
                                    />
                                </div>
                                {formik.touched.endTime && formik.errors.endTime && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.endTime}</p>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                    formik.touched.categoryId && formik.errors.categoryId ? 'border-red-300' : 'border-gray-300'
                                }`}
                                {...formik.getFieldProps('categoryId')}
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.categoryId && formik.errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.categoryId}</p>
                            )}
                        </div>

                        {/* Location and Venue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            formik.touched.location && formik.errors.location ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Location name or address"
                                        {...formik.getFieldProps('location')}
                                    />
                                </div>
                                {formik.touched.location && formik.errors.location && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.location}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="venueId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Campus Venue
                                </label>
                                <select
                                    id="venueId"
                                    name="venueId"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    {...formik.getFieldProps('venueId')}
                                >
                                    <option value="">Select a venue (optional)</option>
                                    {venues.map((venue) => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name} ({venue.capacity} capacity)
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Note: Either Location or Campus Venue is required
                                </p>
                            </div>
                        </div>

                        {/* Max Participants and Organizer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Participants *
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="maxParticipants"
                                        name="maxParticipants"
                                        type="number"
                                        min="1"
                                        step="1"
                                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            formik.touched.maxParticipants && formik.errors.maxParticipants ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        {...formik.getFieldProps('maxParticipants')}
                                    />
                                </div>
                                {formik.touched.maxParticipants && formik.errors.maxParticipants && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.maxParticipants}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                                    Organizer *
                                </label>
                                <input
                                    id="organizer"
                                    name="organizer"
                                    type="text"
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                        formik.touched.organizer && formik.errors.organizer ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    {...formik.getFieldProps('organizer')}
                                />
                                {formik.touched.organizer && formik.errors.organizer && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.organizer}</p>
                                )}
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                Event Image URL
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                    formik.touched.imageUrl && formik.errors.imageUrl ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="https://example.com/image.jpg"
                                {...formik.getFieldProps('imageUrl')}
                            />
                            {formik.touched.imageUrl && formik.errors.imageUrl && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.imageUrl}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Provide a URL to an image for your event (optional)
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                Tags
                            </label>
                            <div className="flex items-center">
                                <div className="relative flex-grow">
                                    <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="tagInput"
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add tags (press Enter or comma to add)"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                        onKeyDown={handleTagInputKeyDown}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="ml-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                    onClick={addTag}
                                >
                                    Add
                                </button>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {formik.values.tags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                            onClick={() => removeTag(tag)}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Add tags to help users find your event (optional)
                            </p>
                        </div>

                        {/* Submit buttons */}
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/events')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? 'Updating...' : 'Update Event'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default EventEditForm;