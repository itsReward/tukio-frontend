import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    BuildingOffice2Icon,
    MapPinIcon,
    UserGroupIcon,
    XMarkIcon,
    CheckIcon,
    PhotoIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

// Components
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';

// Services and hooks
import { useAuth } from '../../hooks/useAuth';
import venueService from '../../services/venueService';
import { VENUE_TYPES } from '../../utils/constants';

const VenueForm = () => {
    const { id } = useParams(); // If id exists, we're editing
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);
    const [amenityInput, setAmenityInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const isEditing = !!id;
    const isAdmin = currentUser?.roles?.includes('ADMIN');

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            toast.error('Access denied. Admin privileges required.');
        }
    }, [isAdmin, navigate]);

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(3, 'Name must be at least 3 characters')
            .max(100, 'Name must not exceed 100 characters')
            .required('Venue name is required'),
        description: Yup.string()
            .max(1000, 'Description must not exceed 1000 characters'),
        location: Yup.string()
            .min(5, 'Location must be at least 5 characters')
            .max(200, 'Location must not exceed 200 characters')
            .required('Location is required'),
        capacity: Yup.number()
            .min(1, 'Capacity must be at least 1')
            .max(10000, 'Capacity must not exceed 10,000')
            .required('Capacity is required'),
        type: Yup.string()
            .required('Venue type is required'),
        building: Yup.string()
            .max(100, 'Building name must not exceed 100 characters'),
        floor: Yup.string()
            .max(20, 'Floor must not exceed 20 characters'),
        imageUrl: Yup.string()
            .url('Please enter a valid URL'),
        amenities: Yup.array()
            .of(Yup.string())
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            location: '',
            capacity: '',
            type: '',
            building: '',
            floor: '',
            imageUrl: '',
            amenities: [],
            isAccessible: false,
            availabilityStatus: true
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const venueData = {
                    ...values,
                    capacity: parseInt(values.capacity),
                    amenities: values.amenities.filter(amenity => amenity.trim() !== ''),
                    // Handle empty imageUrl - convert empty string to null or remove the field
                    imageUrl: values.imageUrl?.trim() || null,
                    // Clean up other string fields
                    description: values.description?.trim() || null,
                    building: values.building?.trim() || null,
                    floor: values.floor?.trim() || null

                };

                if (isEditing) {
                    await venueService.updateVenue(id, venueData);
                    toast.success('Venue updated successfully!');
                } else {
                    await venueService.createVenue(venueData);
                    toast.success('Venue created successfully!');
                }

                navigate('/admin/venues');
            } catch (error) {
                console.error('Error saving venue:', error);
                toast.error(error.response?.data?.message || 'Failed to save venue');
            } finally {
                setLoading(false);
            }
        }
    });

    // Load venue data if editing
    useEffect(() => {
        const loadVenue = async () => {
            if (!isEditing) return;

            try {
                setInitialLoading(true);
                const response = await venueService.getVenueById(id);
                const venue = response.data;

                formik.setValues({
                    name: venue.name || '',
                    description: venue.description || '',
                    location: venue.location || '',
                    capacity: venue.capacity?.toString() || '',
                    type: venue.type || '',
                    building: venue.building || '',
                    floor: venue.floor || '',
                    imageUrl: venue.imageUrl || '',
                    amenities: venue.amenities || [],
                    isAccessible: venue.isAccessible || false,
                    availabilityStatus: venue.availabilityStatus !== false
                });

                if (venue.imageUrl) {
                    setImagePreview(venue.imageUrl);
                }
            } catch (error) {
                console.error('Error loading venue:', error);
                toast.error('Failed to load venue data');
                navigate('/admin/venues');
            } finally {
                setInitialLoading(false);
            }
        };

        loadVenue();
    }, [id, isEditing, navigate]);

    // Handle amenity input
    const handleAmenityInputChange = (e) => {
        setAmenityInput(e.target.value);
    };

    const handleAmenityInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addAmenity();
        }
    };

    const addAmenity = () => {
        const amenity = amenityInput.trim();
        if (amenity && !formik.values.amenities.includes(amenity)) {
            formik.setFieldValue('amenities', [...formik.values.amenities, amenity]);
        }
        setAmenityInput('');
    };

    const removeAmenity = (amenityToRemove) => {
        formik.setFieldValue(
            'amenities',
            formik.values.amenities.filter(amenity => amenity !== amenityToRemove)
        );
    };

    // Handle image URL change
    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        formik.handleChange(e);

        // Update preview
        if (url && url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    };

    // Common amenities for quick adding
    const commonAmenities = [
        'Wi-Fi', 'Projector', 'Sound System', 'Air Conditioning', 'Whiteboard',
        'Wheelchair Access', 'Catering', 'Computer Workstations', 'Video Conferencing',
        'Microphones', 'Stage', 'Parking', 'Security System', 'Kitchen Facilities'
    ];

    if (!isAdmin) {
        return null; // Don't render anything if not admin
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" text="Loading venue data..." />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">
                                {isEditing ? 'Edit Venue' : 'Create New Venue'}
                            </h1>
                            <p className="mt-2 text-neutral-600">
                                {isEditing ? 'Update venue information and settings.' : 'Add a new venue to the campus system.'}
                            </p>
                        </div>
                        <Button
                            variant="outline-neutral"
                            onClick={() => navigate('/admin/venues')}
                        >
                            Back to Venues
                        </Button>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card>
                        <Card.Body>
                            <form onSubmit={formik.handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Venue Name */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Venue Name *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <BuildingOffice2Icon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    className={`form-input pl-10 ${
                                                        formik.touched.name && formik.errors.name ? 'border-accent-500' : ''
                                                    }`}
                                                    placeholder="Enter venue name"
                                                    {...formik.getFieldProps('name')}
                                                />
                                            </div>
                                            {formik.touched.name && formik.errors.name && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.name}</p>
                                            )}
                                        </div>

                                        {/* Venue Type */}
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Venue Type *
                                            </label>
                                            <select
                                                id="type"
                                                name="type"
                                                className={`form-select ${
                                                    formik.touched.type && formik.errors.type ? 'border-accent-500' : ''
                                                }`}
                                                {...formik.getFieldProps('type')}
                                            >
                                                <option value="">Select venue type</option>
                                                {VENUE_TYPES.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {formik.touched.type && formik.errors.type && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.type}</p>
                                            )}
                                        </div>

                                        {/* Capacity */}
                                        <div>
                                            <label htmlFor="capacity" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Capacity *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserGroupIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="capacity"
                                                    name="capacity"
                                                    type="number"
                                                    min="1"
                                                    max="10000"
                                                    className={`form-input pl-10 ${
                                                        formik.touched.capacity && formik.errors.capacity ? 'border-accent-500' : ''
                                                    }`}
                                                    placeholder="Maximum capacity"
                                                    {...formik.getFieldProps('capacity')}
                                                />
                                            </div>
                                            {formik.touched.capacity && formik.errors.capacity && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.capacity}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Location Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Location */}
                                        <div className="md:col-span-3">
                                            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Location *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPinIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="location"
                                                    name="location"
                                                    type="text"
                                                    className={`form-input pl-10 ${
                                                        formik.touched.location && formik.errors.location ? 'border-accent-500' : ''
                                                    }`}
                                                    placeholder="e.g., Main Campus, Building A, Room 101"
                                                    {...formik.getFieldProps('location')}
                                                />
                                            </div>
                                            {formik.touched.location && formik.errors.location && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.location}</p>
                                            )}
                                        </div>

                                        {/* Building */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="building" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Building
                                            </label>
                                            <input
                                                id="building"
                                                name="building"
                                                type="text"
                                                className={`form-input ${
                                                    formik.touched.building && formik.errors.building ? 'border-accent-500' : ''
                                                }`}
                                                placeholder="e.g., Science Building"
                                                {...formik.getFieldProps('building')}
                                            />
                                            {formik.touched.building && formik.errors.building && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.building}</p>
                                            )}
                                        </div>

                                        {/* Floor */}
                                        <div>
                                            <label htmlFor="floor" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Floor
                                            </label>
                                            <input
                                                id="floor"
                                                name="floor"
                                                type="text"
                                                className={`form-input ${
                                                    formik.touched.floor && formik.errors.floor ? 'border-accent-500' : ''
                                                }`}
                                                placeholder="e.g., 2nd Floor"
                                                {...formik.getFieldProps('floor')}
                                            />
                                            {formik.touched.floor && formik.errors.floor && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.floor}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        className={`form-input ${
                                            formik.touched.description && formik.errors.description ? 'border-accent-500' : ''
                                        }`}
                                        placeholder="Describe the venue's features, layout, and any special characteristics..."
                                        {...formik.getFieldProps('description')}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {formik.touched.description && formik.errors.description && (
                                            <p className="text-sm text-accent-600">{formik.errors.description}</p>
                                        )}
                                        <p className="text-xs text-neutral-500 ml-auto">
                                            {formik.values.description.length}/1000 characters
                                        </p>
                                    </div>
                                </div>

                                {/* Image */}
                                <div>
                                    <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Venue Image URL
                                    </label>
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <PhotoIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="imageUrl"
                                                    name="imageUrl"
                                                    type="url"
                                                    className={`form-input pl-10 ${
                                                        formik.touched.imageUrl && formik.errors.imageUrl ? 'border-accent-500' : ''
                                                    }`}
                                                    placeholder="https://example.com/image.jpg"
                                                    onChange={handleImageUrlChange}
                                                    value={formik.values.imageUrl}
                                                />
                                            </div>
                                            {formik.touched.imageUrl && formik.errors.imageUrl && (
                                                <p className="mt-1 text-sm text-accent-600">{formik.errors.imageUrl}</p>
                                            )}
                                        </div>
                                        {imagePreview && (
                                            <div className="w-20 h-20 rounded-lg border border-neutral-300 overflow-hidden">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImagePreview(null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Amenities
                                    </label>

                                    {/* Quick Add Common Amenities */}
                                    <div className="mb-3">
                                        <p className="text-xs text-neutral-500 mb-2">Quick add common amenities:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {commonAmenities.map((amenity) => (
                                                <button
                                                    key={amenity}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!formik.values.amenities.includes(amenity)) {
                                                            formik.setFieldValue('amenities', [...formik.values.amenities, amenity]);
                                                        }
                                                    }}
                                                    disabled={formik.values.amenities.includes(amenity)}
                                                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                                        formik.values.amenities.includes(amenity)
                                                            ? 'bg-primary-100 text-primary-700 border-primary-300 cursor-not-allowed'
                                                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {formik.values.amenities.includes(amenity) && (
                                                        <CheckIcon className="h-3 w-3 inline mr-1" />
                                                    )}
                                                    {amenity}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Amenity Input */}
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            className="form-input flex-1"
                                            placeholder="Add custom amenity (press Enter or comma to add)"
                                            value={amenityInput}
                                            onChange={handleAmenityInputChange}
                                            onKeyDown={handleAmenityInputKeyDown}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addAmenity}
                                            disabled={!amenityInput.trim()}
                                        >
                                            Add
                                        </Button>
                                    </div>

                                    {/* Selected Amenities */}
                                    {formik.values.amenities.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {formik.values.amenities.map((amenity) => (
                                                <div
                                                    key={amenity}
                                                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
                                                >
                                                    <span>{amenity}</span>
                                                    <button
                                                        type="button"
                                                        className="ml-2 text-primary-600 hover:text-primary-800"
                                                        onClick={() => removeAmenity(amenity)}
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Settings */}
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Settings</h3>
                                    <div className="space-y-4">
                                        {/* Accessibility */}
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="isAccessible"
                                                    name="isAccessible"
                                                    type="checkbox"
                                                    className="form-checkbox"
                                                    checked={formik.values.isAccessible}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="isAccessible" className="text-sm font-medium text-neutral-700">
                                                    Wheelchair Accessible
                                                </label>
                                                <p className="text-sm text-neutral-500">
                                                    This venue is accessible to people with mobility impairments
                                                </p>
                                            </div>
                                        </div>

                                        {/* Availability Status */}
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="availabilityStatus"
                                                    name="availabilityStatus"
                                                    type="checkbox"
                                                    className="form-checkbox"
                                                    checked={formik.values.availabilityStatus}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="availabilityStatus" className="text-sm font-medium text-neutral-700">
                                                    Available for Booking
                                                </label>
                                                <p className="text-sm text-neutral-500">
                                                    Allow this venue to be booked for events
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Venue Management Tips
                                            </h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Provide accurate capacity information for optimal event allocation</li>
                                                    <li>Include detailed amenities to help organizers choose the right venue</li>
                                                    <li>Use clear, descriptive names that indicate the venue's purpose</li>
                                                    <li>High-quality images help event organizers visualize their events</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                                    <Button
                                        type="button"
                                        variant="outline-neutral"
                                        onClick={() => navigate('/admin/venues')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={loading}
                                        disabled={loading || !formik.isValid}
                                    >
                                        {isEditing ? 'Update Venue' : 'Create Venue'}
                                    </Button>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default VenueForm;