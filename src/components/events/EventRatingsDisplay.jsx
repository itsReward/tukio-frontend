// src/components/events/EventRatingsDisplay.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { StarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import eventService from '../../services/eventService';
import Loader from '../common/Loader';
import Button from '../common/Button';

/**
 * EventRatingsDisplay Component
 * Shows all ratings and reviews for an event
 */
const EventRatingsDisplay = ({ eventId, className = '' }) => {
    const [ratings, setRatings] = useState([]);
    const [ratingSummary, setRatingSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const pageSize = 10;

    useEffect(() => {
        fetchRatings();
        fetchRatingSummary();
    }, [eventId]);

    const fetchRatings = async (pageNum = 0, append = false) => {
        try {
            if (pageNum === 0) setLoading(true);
            else setLoadingMore(true);

            const response = await eventService.getEventRatings(eventId, {
                page: pageNum,
                size: pageSize,
                sort: 'createdAt,desc'
            });

            const newRatings = response.data.content || response.data;

            if (append) {
                setRatings(prev => [...prev, ...newRatings]);
            } else {
                setRatings(newRatings);
            }

            // Check if there are more ratings
            if (response.data.content) {
                setHasMore(!response.data.last);
            } else {
                setHasMore(newRatings.length === pageSize);
            }

            setPage(pageNum);
        } catch (err) {
            console.error('Error fetching ratings:', err);
            setError('Failed to load ratings');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchRatingSummary = async () => {
        try {
            const response = await eventService.getEventRatingSummary(eventId);
            setRatingSummary(response.data);
        } catch (err) {
            console.error('Error fetching rating summary:', err);
            // Don't set error for summary, it's optional
        }
    };

    const loadMoreRatings = () => {
        if (!loadingMore && hasMore) {
            fetchRatings(page + 1, true);
        }
    };

    const StarRating = ({ rating, size = 'sm' }) => {
        const sizeClasses = {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6'
        };

        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                        {rating >= star ? (
                            <StarIconSolid className={`${sizeClasses[size]} text-amber-400`} />
                        ) : (
                            <StarIcon className={`${sizeClasses[size]} text-neutral-300`} />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    const RatingDistribution = ({ summary }) => {
        if (!summary || !summary.ratingDistribution) return null;

        const distribution = summary.ratingDistribution;
        const total = summary.totalRatings;

        return (
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                    const count = distribution[stars] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={stars} className="flex items-center text-sm">
                            <span className="w-8 text-neutral-600">{stars}</span>
                            <StarIcon className="h-4 w-4 text-amber-400 mx-1" />
                            <div className="flex-1 mx-2">
                                <div className="bg-neutral-200 rounded-full h-2">
                                    <div
                                        className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                            <span className="w-12 text-right text-neutral-600">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const CategoryRatingBar = ({ category, rating, maxRating = 5 }) => {
        const percentage = (rating / maxRating) * 100;

        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 capitalize">{category}</span>
                <div className="flex items-center">
                    <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="w-8 text-neutral-900 font-medium">
                        {rating.toFixed(1)}
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`flex justify-center py-8 ${className}`}>
                <Loader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-neutral-600">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => fetchRatings()}
                    className="mt-4"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (!ratingSummary || ratingSummary.totalRatings === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100 mb-4">
                    <StarIcon className="h-6 w-6 text-neutral-500" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Ratings Yet</h3>
                <p className="text-neutral-600">
                    Be the first to rate this event after attending!
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-card border border-neutral-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                    Event Ratings & Reviews
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Rating */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="text-4xl font-bold text-neutral-900 mr-4">
                                {ratingSummary.averageRating.toFixed(1)}
                            </div>
                            <div>
                                <StarRating rating={Math.round(ratingSummary.averageRating)} size="md" />
                                <p className="text-sm text-neutral-600 mt-1">
                                    {ratingSummary.totalRatings} rating{ratingSummary.totalRatings !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <RatingDistribution summary={ratingSummary} />
                    </div>

                    {/* Category Ratings */}
                    {ratingSummary.categoryAverages && Object.keys(ratingSummary.categoryAverages).length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">
                                Category Breakdown
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(ratingSummary.categoryAverages).map(([category, rating]) => (
                                    <CategoryRatingBar
                                        key={category}
                                        category={category}
                                        rating={rating}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Ratings */}
            <div className="space-y-4">
                {ratings.map((rating, index) => (
                    <div
                        key={rating.id || index}
                        className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                                    {rating.userProfilePicture ? (
                                        <img
                                            src={rating.userProfilePicture}
                                            alt={rating.userName}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-6 w-6 text-neutral-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-neutral-900">
                                        {rating.userName || 'Anonymous'}
                                    </h4>
                                    <p className="text-sm text-neutral-500">
                                        {format(new Date(rating.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <StarRating rating={rating.overallRating} />
                                <span className="ml-2 text-sm font-medium text-neutral-700">
                                    {rating.overallRating}/5
                                </span>
                            </div>
                        </div>

                        {/* Category Ratings */}
                        {rating.categoryRatings && Object.keys(rating.categoryRatings).length > 0 && (
                            <div className="mb-3 p-3 bg-neutral-50 rounded-lg">
                                <h5 className="text-sm font-medium text-neutral-700 mb-2">
                                    Category Ratings
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                    {Object.entries(rating.categoryRatings).map(([category, categoryRating]) => (
                                        <div key={category} className="flex items-center justify-between">
                                            <span className="text-neutral-600 capitalize">{category}:</span>
                                            <div className="flex items-center">
                                                <StarRating rating={categoryRating} size="xs" />
                                                <span className="ml-1 text-neutral-700">{categoryRating}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comment */}
                        {rating.comment && (
                            <div className="mt-3">
                                <p className="text-neutral-700 leading-relaxed">
                                    {rating.comment}
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                    <div className="text-center pt-4">
                        <Button
                            variant="outline"
                            onClick={loadMoreRatings}
                            loading={loadingMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? 'Loading...' : 'Load More Reviews'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

EventRatingsDisplay.propTypes = {
    /** Event ID to fetch ratings for */
    eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    /** Additional CSS classes */
    className: PropTypes.string,
};

export default EventRatingsDisplay;