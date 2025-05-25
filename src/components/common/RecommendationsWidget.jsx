import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    FireIcon,
    SparklesIcon,
    ClockIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { formatNumber } from '../../utils/formatters';
import recommendationService from '../../services/recommendationService';
import Loader from '../common/Loader';
import Badge from '../common/Badge';

/**
 * RecommendationsWidget Component
 *
 * Displays personalized event recommendations using the recommendation API
 */
const RecommendationsWidget = ({ userId, maxItems = 3, className = '' }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch recommendations
    const fetchRecommendations = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const recommendationsData = await recommendationService.getDashboardRecommendations(userId, maxItems);
            setRecommendations(recommendationsData || []);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    }, [userId, maxItems]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Handle event click - record view activity
    const handleEventClick = async (eventId) => {
        if (userId && eventId) {
            try {
                await recommendationService.recordEventView(userId, eventId);
            } catch (error) {
                console.error('Error recording event view:', error);
            }
        }
    };

    // Get recommendation type icon and color
    const getRecommendationTypeDisplay = (type) => {
        switch (type) {
            case 'PERSONALIZED':
                return {
                    icon: SparklesIcon,
                    label: 'For You',
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100'
                };
            case 'SIMILAR_EVENTS':
                return {
                    icon: CalendarIcon,
                    label: 'Similar',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100'
                };
            case 'POPULAR':
                return {
                    icon: FireIcon,
                    label: 'Popular',
                    color: 'text-red-600',
                    bgColor: 'bg-red-100'
                };
            case 'TRENDING':
                return {
                    icon: FireIcon,
                    label: 'Trending',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100'
                };
            case 'LOCATION_BASED':
                return {
                    icon: MapPinIcon,
                    label: 'Nearby',
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                };
            case 'TIME_BASED':
                return {
                    icon: ClockIcon,
                    label: 'Good Timing',
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-100'
                };
            default:
                return {
                    icon: CalendarIcon,
                    label: 'Recommended',
                    color: 'text-primary-600',
                    bgColor: 'bg-primary-100'
                };
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-card border border-neutral-200 p-6 ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <Loader size="sm" />
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-card border border-neutral-200 p-6 ${className}`}>
                <div className="text-center py-6">
                    <div className="text-accent-600 mb-2">{error}</div>
                    <button
                        onClick={fetchRecommendations}
                        className="text-sm text-primary-600 hover:text-primary-800"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // Render empty state
    if (recommendations.length === 0) {
        return (
            <div className={`bg-white rounded-xl shadow-card border border-neutral-200 p-6 ${className}`}>
                <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-3">
                        <SparklesIcon className="h-6 w-6 text-neutral-400" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900 mb-1">No recommendations available</h3>
                    <p className="text-xs text-neutral-500 mb-3">
                        Start by attending events to get personalized recommendations
                    </p>
                    <Link
                        to="/events"
                        className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                        Browse all events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center">
                    <FireIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-neutral-900">Recommended For You</h3>
                </div>
                <Link
                    to="/events"
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                    View All
                </Link>
            </div>

            {/* Recommendations List */}
            <div className="divide-y divide-neutral-200">
                {recommendations.map((event, index) => {
                    const typeDisplay = getRecommendationTypeDisplay(event.recommendationType);
                    const TypeIcon = typeDisplay.icon;

                    return (
                        <motion.div
                            key={event.eventId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 hover:bg-neutral-50 transition-colors duration-200"
                        >
                            <Link
                                to={`/events/${event.eventId}`}
                                onClick={() => handleEventClick(event.eventId)}
                                className="block"
                            >
                                <div className="flex items-start space-x-3">
                                    {/* Event Image/Icon */}
                                    <div className="flex-shrink-0">
                                        {event.imageUrl ? (
                                            <img
                                                src={event.imageUrl}
                                                alt={event.title}
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                                                <CalendarIcon className="h-6 w-6 text-primary-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-medium text-neutral-900 truncate pr-2">
                                                {event.title}
                                            </h4>
                                            <div className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${typeDisplay.bgColor} ${typeDisplay.color}`}>
                                                <TypeIcon className="h-3 w-3 mr-1" />
                                                {typeDisplay.label}
                                            </div>
                                        </div>

                                        <p className="text-xs text-neutral-600 mb-2 line-clamp-2">
                                            {event.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-3 w-3 mr-1" />
                                                <span>{formatDate(event.startTime, 'MMM d')}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                <span>{formatTime(event.startTime)}</span>
                                            </div>

                                            {event.location && (
                                                <div className="flex items-center">
                                                    <MapPinIcon className="h-3 w-3 mr-1" />
                                                    <span className="truncate max-w-20">{event.location}</span>
                                                </div>
                                            )}

                                            {event.registrationCount > 0 && (
                                                <div className="flex items-center">
                                                    <UserGroupIcon className="h-3 w-3 mr-1" />
                                                    <span>{formatNumber(event.registrationCount)} attending</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {event.tags.slice(0, 2).map((tag, tagIndex) => (
                                                    <Badge
                                                        key={tagIndex}
                                                        variant="neutral"
                                                        size="sm"
                                                        className="text-xs"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {event.tags.length > 2 && (
                                                    <Badge variant="neutral" size="sm" className="text-xs">
                                                        +{event.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Similarity Score (for similar events) */}
                                        {event.similarityScore && (
                                            <div className="mt-1">
                                                <span className="text-xs text-primary-600 font-medium">
                                                    {Math.round(event.similarityScore * 100)}% match
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className="flex-shrink-0">
                                        <ArrowRightIcon className="h-4 w-4 text-neutral-400" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50">
                <Link
                    to="/events"
                    className="block w-full text-center py-2 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-neutral-100 rounded-md transition-colors duration-200"
                >
                    Explore More Events
                </Link>
            </div>
        </div>
    );
};

export default RecommendationsWidget;