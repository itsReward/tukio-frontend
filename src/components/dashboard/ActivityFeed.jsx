import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import gamificationService from '../../services/gamificationService';

const ActivityFeed = ({ userId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await gamificationService.getUserTransactions(userId);
                setActivities(response.data.content || []);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchActivities();
        }
    }, [userId]);

    // Format relative time
    const getRelativeTime = (date) => {
        try {
            return formatDistance(new Date(date), new Date(), { addSuffix: true });
        } catch (error) {
            console.error('Date formatting error:', error);
            return date;
        }
    };

    // Get activity icon and color
    const getActivityDetails = (activityType) => {
        switch (activityType) {
            case 'EVENT_REGISTRATION':
                return {
                    icon: '📝',
                    color: 'bg-primary-100 text-primary-700',
                    label: 'Registered for an event'
                };
            case 'EVENT_ATTENDANCE':
                return {
                    icon: '✓',
                    color: 'bg-success-100 text-success-700',
                    label: 'Attended an event'
                };
            case 'EVENT_RATING':
                return {
                    icon: '⭐',
                    color: 'bg-warning-100 text-warning-700',
                    label: 'Rated an event'
                };
            case 'EVENT_SHARING':
                return {
                    icon: '🔗',
                    color: 'bg-secondary-100 text-secondary-700',
                    label: 'Shared an event'
                };
            case 'BADGE_EARNED':
                return {
                    icon: '🏆',
                    color: 'bg-accent-100 text-accent-700',
                    label: 'Earned a badge'
                };
            case 'LEVEL_UP':
                return {
                    icon: '🌟',
                    color: 'bg-secondary-100 text-secondary-700',
                    label: 'Leveled up'
                };
            default:
                return {
                    icon: '•',
                    color: 'bg-neutral-100 text-neutral-700',
                    label: 'Activity'
                };
        }
    };

    return (
        <div>
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {activities.length > 0 ? (
                        <div className="flow-root">
                            <ul className="-mb-8">
                                {activities.map((activity, activityIdx) => {
                                    const { icon, color, label } = getActivityDetails(activity.activityType);
                                    return (
                                        <li key={activity.id}>
                                            <div className="relative pb-8">
                                                {activityIdx !== activities.length - 1 ? (
                                                    <span
                                                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                                <div className="relative flex items-start space-x-3">
                                                    <div className="relative">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
                                                            <span className="text-lg">{icon}</span>
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div>
                                                            <div className="text-sm">
                                                                <span className="font-medium text-neutral-900">{label}</span>
                                                            </div>
                                                            <p className="mt-0.5 text-sm text-neutral-500">
                                                                {getRelativeTime(activity.timestamp)}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 text-sm text-neutral-700">
                                                            <p>{activity.description}</p>
                                                            {activity.points && (
                                                                <div className="mt-1 text-primary-600 font-medium">
                                                                    +{activity.points} points
                                                                </div>
                                                            )}
                                                            {activity.eventId && (
                                                                <div className="mt-1">
                                                                    <Link
                                                                        to={`/events/${activity.eventId}`}
                                                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                                                    >
                                                                        View Event
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
                    ) : (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                                <span className="text-2xl">📋</span>
                            </div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">No activity yet</h3>
                            <p className="text-neutral-600">
                                Your recent activities will appear here once you start participating in events.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ActivityFeed;