import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, MapPinIcon, TagIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';

const EventForm = ({ formik, categories, venues, loading }) => {
    const [tagInput, setTagInput] = React.useState('');

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="max-w-4xl mx-auto">
                <Card.Body>
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
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
                                    {venues.map((venue) => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name} ({venue.capacity} capacity)
                                        </option>
                                    ))}
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

                        {/* Organizer - Critical field */}
                        <div>
                            <label htmlFor="organizer" className="block text-sm font-medium text-neutral-700 mb-1">
                                Organizer *
                            </label>
                            <input
                                id="organizer"
                                name="organizer"
                                type="text"
                                className={`form-input ${
                                    formik.touched.organizer && formik.errors.organizer ? 'border-accent-500' : ''
                                }`}
                                {...formik.getFieldProps('organizer')}
                            />
                            {formik.touched.organizer && formik.errors.organizer && (
                                <p className="mt-1 text-sm text-accent-600">{formik.errors.organizer}</p>
                            )}
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

                        {/* Submit buttons */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="outline-neutral"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={loading}
                            >
                                Create Event
                            </Button>
                        </div>
                    </form>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

EventForm.propTypes = {
    formik: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    venues: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default EventForm;