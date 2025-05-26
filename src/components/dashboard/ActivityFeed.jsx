import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import gamificationService from '../../services/gamificationService';

const ActivityFeed = ({ userId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('=== ACTIVITY FEED DEBUG ===');
                console.log('Fetching activities for user ID:', userId);

                const response = await gamificationService.getUserTransactions(userId, 0, 10);
                console.log('Activity response:', response);
                console.log('Activity data:', response.data);

                // Handle different possible response structures
                let activityData = [];
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        activityData = response.data;
                    } else if (response.data.content && Array.isArray(response.data.content)) {
                        activityData = response.data.content;
                    } else if (response.data.transactions && Array.isArray(response.data.transactions)) {
                        activityData = response.data.transactions;
                    }
                }

                console.log('Processed activity data:', activityData);
                console.log('Activity count:', activityData.length);

                // Process and validate each activity
                const processedActivities = activityData.map((activity, index) => {
                    console.log(`Processing activity ${index + 1}:`, activity);

                    return {
                        id: activity.id || `activity-${index}`,
                        activityType: activity.activityType || activity.type || 'UNKNOWN',
                        description: activity.description || activity.message || 'Activity recorded',
                        points: activity.points || activity.pointsEarned || 0,
                        timestamp: activity.timestamp || activity.createdAt || activity.date || new Date().toISOString(),
                        eventId: activity.eventId || activity.referenceId,
                        eventTitle: activity.eventTitle || activity.eventName,
                        // Additional fields that might be present
                        badgeId: activity.badgeId,
                        badgeName: activity.badgeName,
                        level: activity.level,
                        ...activity // Include any other fields
                    };
                });

                console.log('Final processed activities:', processedActivities);
                setActivities(processedActivities);

            } catch (error) {
                console.error('Error fetching activities:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response,
                    stack: error.stack
                });
                setError(`Failed to load recent activities: ${error.message}`);
                setActivities([]); // Ensure we show empty state instead of mock data
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [userId]);

    // Format relative time with error handling
    const getRelativeTime = (date) => {
        if (!date) return 'Recently';

        try {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return 'Recently';
            }
            return formatDistance(parsedDate, new Date(), { addSuffix: true });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Recently';
        }
    };

    // Get activity icon and color based on activity type
    const getActivityDetails = (activityType) => {
        const type = activityType?.toUpperCase() || 'UNKNOWN';

        switch (type) {
            case 'EVENT_REGISTRATION':
            case 'REGISTER':
                return {
                    icon: '📝',
                    color: 'bg-primary-100 text-primary-700',
                    label: 'Registered for an event'
                };
            case 'EVENT_ATTENDANCE':
            case 'ATTEND':
                return {
                    icon: '✅',
                    color: 'bg-success-100 text-success-700',
                    label: 'Attended an event'
                };
            case 'EVENT_RATING':
            case 'RATE':
                return {
                    icon: '⭐',
                    color: 'bg-warning-100 text-warning-700',
                    label: 'Rated an event'
                };
            case 'EVENT_SHARING':
            case 'SHARE':
                return {
                    icon: '🔗',
                    color: 'bg-secondary-100 text-secondary-700',
                    label: 'Shared an event'
                };
            case 'BADGE_EARNED':
            case 'BADGE':
                return {
                    icon: '🏆',
                    color: 'bg-accent-100 text-accent-700',
                    label: 'Earned a badge'
                };
            case 'LEVEL_UP':
            case 'LEVEL':
                return {
                    icon: '🌟',
                    color: 'bg-secondary-100 text-secondary-700',
                    label: 'Leveled up'
                };
            case 'EVENT_VIEW':
            case 'VIEW':
                return {
                    icon: '👀',
                    color: 'bg-blue-100 text-blue-700',
                    label: 'Viewed an event'
                };
            case 'EVENT_FAVORITE':
            case 'FAVORITE':
                return {
                    icon: '❤️',
                    color: 'bg-pink-100 text-pink-700',
                    label: 'Favorited an event'
                };
            case 'POINTS_EARNED':
            case 'POINTS':
                return {
                    icon: '💎',
                    color: 'bg-purple-100 text-purple-700',
                    label: 'Earned points'
                };
            default:
                return {
                    icon: '📊',
                    color: 'bg-neutral-100 text-neutral-700',
                    label: 'Activity recorded'
                };
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Unable to load activities</h3>
                <p className="text-neutral-600 text-sm mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-outline btn-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Empty state - only show when there are genuinely no activities
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                    <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No activity yet</h3>
                <p className="text-neutral-600 mb-4">
                    Your recent activities will appear here once you start participating in events.
                </p>
                <Link to="/events" className="btn btn-primary">
                    Browse Events
                </Link>
            </div>
        );
    }

    // Activity feed with real data
    return (
        <div>
            <div className="flow-root">
                <ul className="-mb-8">
                    {activities.map((activity, activityIdx) => {
                        const { icon, color, label } = getActivityDetails(activity.activityType);

                        return (
                            <li key={activity.id || activityIdx}>
                                <div className="relative pb-8">
                                    {activityIdx !== activities.length - 1 && (
                                        <span
                                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div className="relative flex items-start space-x-3">
                                        {/* Activity Icon */}
                                        <div className="relative">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
                                                <span className="text-lg">{icon}</span>
                                            </div>
                                        </div>

                                        {/* Activity Content */}
                                        <div className="min-w-0 flex-1">
                                            <div>
                                                <div className="text-sm">
                                                    <span className="font-medium text-neutral-900">
                                                        {activity.description || label}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-sm text-neutral-500">
                                                    {getRelativeTime(activity.timestamp)}
                                                </p>
                                            </div>

                                            {/* Additional Activity Details */}
                                            <div className="mt-2 text-sm text-neutral-700">
                                                {/* Points earned */}
                                                {activity.points && activity.points > 0 && (
                                                    <div className="text-primary-600 font-medium">
                                                        +{activity.points} points
                                                    </div>
                                                )}

                                                {/* Badge information */}
                                                {activity.badgeName && (
                                                    <div className="text-accent-600 font-medium">
                                                        🏆 {activity.badgeName}
                                                    </div>
                                                )}

                                                {/* Level information */}
                                                {activity.level && (
                                                    <div className="text-secondary-600 font-medium">
                                                        🌟 Level {activity.level}
                                                    </div>
                                                )}

                                                {/* Event link */}
                                                {activity.eventId && (
                                                    <div className="mt-1">
                                                        <Link
                                                            to={`/events/${activity.eventId}`}
                                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                                        >
                                                            {activity.eventTitle ? `View "${activity.eventTitle}"` : 'View Event'}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Show link to view more activities if there are many */}
            {activities.length >= 10 && (
                <div className="mt-6 text-center">
                    <Link
                        to="/profile#activity"
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                        View all activity →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;