// src/components/events/RatingModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * RatingModal Component
 * Allows users to rate an event they attended
 */
const RatingModal = ({
                         isOpen,
                         onClose,
                         event,
                         currentRating,
                         onRatingSubmit,
                         loading = false
                     }) => {
    const [formData, setFormData] = useState({
        overallRating: 0,
        categoryRatings: {
            venue: 0,
            content: 0,
            organization: 0
        },
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Initialize form data when modal opens or current rating changes
    useEffect(() => {
        if (isOpen) {
            if (currentRating) {
                setFormData({
                    overallRating: currentRating.overallRating || 0,
                    categoryRatings: {
                        venue: currentRating.categoryRatings?.venue || 0,
                        content: currentRating.categoryRatings?.content || 0,
                        organization: currentRating.categoryRatings?.organization || 0,
                        ...currentRating.categoryRatings
                    },
                    comment: currentRating.comment || ''
                });
            } else {
                setFormData({
                    overallRating: 0,
                    categoryRatings: {
                        venue: 0,
                        content: 0,
                        organization: 0
                    },
                    comment: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, currentRating]);

    // Handle overall rating change
    const handleOverallRatingChange = (rating) => {
        setFormData(prev => ({
            ...prev,
            overallRating: rating
        }));
        setErrors(prev => ({ ...prev, overallRating: null }));
    };

    // Handle category rating change
    const handleCategoryRatingChange = (category, rating) => {
        setFormData(prev => ({
            ...prev,
            categoryRatings: {
                ...prev.categoryRatings,
                [category]: rating
            }
        }));
    };

    // Handle comment change
    const handleCommentChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            comment: value
        }));

        // Clear comment error if within limit
        if (value.length <= 1000) {
            setErrors(prev => ({ ...prev, comment: null }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.overallRating || formData.overallRating < 1) {
            newErrors.overallRating = 'Please provide an overall rating';
        }

        if (formData.comment && formData.comment.length > 1000) {
            newErrors.comment = 'Comment must not exceed 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            // Clean up category ratings (remove 0 ratings)
            const cleanCategoryRatings = {};
            Object.entries(formData.categoryRatings).forEach(([key, value]) => {
                if (value > 0) {
                    cleanCategoryRatings[key] = value;
                }
            });

            const ratingData = {
                overallRating: formData.overallRating,
                categoryRatings: Object.keys(cleanCategoryRatings).length > 0 ? cleanCategoryRatings : undefined,
                comment: formData.comment.trim() || undefined
            };

            await onRatingSubmit(ratingData);
            onClose();
        } catch (error) {
            console.error('Error submitting rating:', error);
            // Error handling is done in the parent component
        } finally {
            setSubmitting(false);
        }
    };

    // Star rating component
    const StarRating = ({ rating, onRatingChange, size = 'md', disabled = false }) => {
        const sizeClasses = {
            sm: 'h-5 w-5',
            md: 'h-6 w-6',
            lg: 'h-8 w-8'
        };

        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !disabled && onRatingChange(star)}
                        disabled={disabled}
                        className={`rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 ${
                            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
                        } ${
                            rating >= star ? 'text-amber-400' : 'text-neutral-300'
                        }`}
                    >
                        {rating >= star ? (
                            <StarIconSolid className={sizeClasses[size]} />
                        ) : (
                            <StarIcon className={sizeClasses[size]} />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    if (!event) return null;

    const isEditing = !!currentRating;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Update Event Rating" : "Rate This Event"}
            size="lg"
            closeOnOverlayClick={!submitting}
        >
            <div className="space-y-6">
                {/* Event Info */}
                <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-neutral-600">
                        Your feedback helps improve future events and assists other users in discovering great events.
                    </p>
                </div>

                {/* Overall Rating */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-neutral-700">
                            Overall Rating *
                        </label>
                        {formData.overallRating > 0 && (
                            <span className="text-sm text-neutral-600">
                                {formData.overallRating} star{formData.overallRating !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <StarRating
                        rating={formData.overallRating}
                        onRatingChange={handleOverallRatingChange}
                        size="lg"
                        disabled={submitting}
                    />
                    {errors.overallRating && (
                        <p className="text-sm text-accent-600">{errors.overallRating}</p>
                    )}
                </div>

                {/* Category Ratings */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-neutral-700">
                        Category Ratings (Optional)
                    </h4>

                    <div className="space-y-4">
                        {/* Venue Rating */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-neutral-700">Venue & Location</label>
                                <p className="text-xs text-neutral-500">Quality of the venue and facilities</p>
                            </div>
                            <StarRating
                                rating={formData.categoryRatings.venue}
                                onRatingChange={(rating) => handleCategoryRatingChange('venue', rating)}
                                size="sm"
                                disabled={submitting}
                            />
                        </div>

                        {/* Content Rating */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-neutral-700">Content & Program</label>
                                <p className="text-xs text-neutral-500">Quality of the event content and activities</p>
                            </div>
                            <StarRating
                                rating={formData.categoryRatings.content}
                                onRatingChange={(rating) => handleCategoryRatingChange('content', rating)}
                                size="sm"
                                disabled={submitting}
                            />
                        </div>

                        {/* Organization Rating */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-neutral-700">Organization</label>
                                <p className="text-xs text-neutral-500">Event planning and execution</p>
                            </div>
                            <StarRating
                                rating={formData.categoryRatings.organization}
                                onRatingChange={(rating) => handleCategoryRatingChange('organization', rating)}
                                size="sm"
                                disabled={submitting}
                            />
                        </div>
                    </div>
                </div>

                {/* Comment */}
                <div className="space-y-3">
                    <label htmlFor="comment" className="block text-sm font-medium text-neutral-700">
                        Your Feedback (Optional)
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        rows={4}
                        className={`form-input ${errors.comment ? 'border-accent-500' : ''}`}
                        placeholder="Share your thoughts about the event..."
                        value={formData.comment}
                        onChange={handleCommentChange}
                        disabled={submitting}
                        maxLength={1000}
                    />
                    <div className="flex justify-between text-xs">
                        {errors.comment && (
                            <span className="text-accent-600">{errors.comment}</span>
                        )}
                        <span className={`ml-auto ${formData.comment.length > 900 ? 'text-amber-600' : 'text-neutral-500'}`}>
                            {formData.comment.length}/1000
                        </span>
                    </div>
                </div>

                {/* Existing Rating Notice */}
                {isEditing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-medium">ℹ️</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Updating Previous Rating
                                </h3>
                                <div className="text-sm text-blue-700">
                                    You can update your previous rating and feedback.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                    <Button
                        variant="outline-neutral"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={submitting}
                        icon={submitting ? null : <StarIcon className="h-5 w-5" />}
                    >
                        {submitting ? 'Submitting...' : isEditing ? 'Update Rating' : 'Submit Rating'}
                    </Button>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                        <Loader size="lg" />
                    </div>
                )}
            </div>
        </Modal>
    );
};

RatingModal.propTypes = {
    /** Whether the modal is open */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
    /** Event object */
    event: PropTypes.object,
    /** Current rating record */
    currentRating: PropTypes.object,
    /** Function to call when rating is submitted */
    onRatingSubmit: PropTypes.func.isRequired,
    /** Whether the modal is in loading state */
    loading: PropTypes.bool,
};

export default RatingModal;