import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import gamificationService from '../../services/gamificationService';
import eventService from '../../services/eventService';

// Components
import Loader from '../common/Loader';
import Card from '../common/Card';

// Icons
import {
    CalendarIcon,
    UserGroupIcon,
    TrophyIcon,
    StarIcon,
    TagIcon,
    ChartBarIcon,
    TicketIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const UserStats = ({ userId }) => {
    const [stats, setStats] = useState(null);
    const [eventStats, setEventStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch gamification stats
                const gamificationResponse = await gamificationService.getUserActivityStats(userId);
                setStats(gamificationResponse.data);

                // Fetch event stats
                const registrationsResponse = await eventService.getRegistrationsByUser(userId);

                // Process event data
                const events = registrationsResponse.data || [];
                const attendedEvents = events.filter(event => event.status === 'ATTENDED').length;
                const registeredEvents = events.length;
                const cancelledEvents = events.filter(event => event.status === 'CANCELLED').length;

                // Calculate category distribution
                const categories = {};
                events.forEach(event => {
                    if (event.eventCategory) {
                        categories[event.eventCategory] = (categories[event.eventCategory] || 0) + 1;
                    }
                });

                setEventStats({
                    attendedEvents,
                    registeredEvents,
                    cancelledEvents,
                    categories
                });
            } catch (err) {
                console.error('Error fetching user stats:', err);
                setError('Failed to load user statistics');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchStats();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader size="md" text="Loading statistics..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-accent-600">
                <p>{error}</p>
            </div>
        );
    }

    // Format date
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            {/* Key Stats */}
            <Card>
                <Card.Header>
                    <Card.Title>Activity Summary</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Points',
                                value: stats?.totalPoints || 0,
                                icon: TrophyIcon,
                                color: 'text-amber-500'
                            },
                            {
                                label: 'Events Attended',
                                value: eventStats?.attendedEvents || 0,
                                icon: TicketIcon,
                                color: 'text-primary-600'
                            },
                            {
                                label: 'Badges Earned',
                                value: stats?.badgesEarned || 0,
                                icon: StarIcon,
                                color: 'text-blue-500'
                            },
                            {
                                label: 'Level',
                                value: stats?.currentLevel || 1,
                                icon: ChartBarIcon,
                                color: 'text-purple-600'
                            }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="flex justify-center mb-2">
                                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                                <div className="text-sm text-neutral-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Level Progress */}
                    {stats?.currentLevel && stats?.pointsToNextLevel && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm font-medium text-neutral-700">
                                    Level {stats.currentLevel}
                                </div>
                                <div className="text-sm text-neutral-500">
                                    {stats.pointsToNextLevel} points to Level {stats.currentLevel + 1}
                                </div>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2.5">
                                <motion.div
                                    className="bg-primary-600 h-2.5 rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${(stats.levelProgress || 0) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                ></motion.div>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Event Activity */}
            <Card>
                <Card.Header>
                    <Card.Title>Event Activity</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Status */}
                        <div>
                            <h3 className="text-sm font-medium text-neutral-700 mb-3">Event Participation</h3>
                            <div className="space-y-3">
                                {[
                                    {
                                        label: 'Registered',
                                        value: eventStats?.registeredEvents || 0,
                                        color: 'bg-primary-100 text-primary-800'
                                    },
                                    {
                                        label: 'Attended',
                                        value: eventStats?.attendedEvents || 0,
                                        color: 'bg-success-100 text-success-800'
                                    },
                                    {
                                        label: 'Cancelled',
                                        value: eventStats?.cancelledEvents || 0,
                                        color: 'bg-accent-100 text-accent-800'
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-xs font-semibold mr-2`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="text-sm font-medium text-neutral-700">{item.label}</div>
                                        </div>
                                        <div className="text-sm font-semibold text-neutral-900">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Distribution */}
                        <div>
                            <h3 className="text-sm font-medium text-neutral-700 mb-3">Event Categories</h3>
                            {eventStats?.categories && Object.keys(eventStats.categories).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(eventStats.categories).map(([category, count], index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold mr-2">
                                                <TagIcon className="h-3 w-3 text-neutral-700" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="text-sm font-medium text-neutral-700">{category}</div>
                                            </div>
                                            <div className="text-sm font-semibold text-neutral-900">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">No category data available</p>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Recent Activity */}
            <Card>
                <Card.Header>
                    <Card.Title>Recent Activity</Card.Title>
                </Card.Header>
                <Card.Body>
                    {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start">
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center 
                    ${activity.type === 'EVENT_REGISTRATION' ? 'bg-primary-100 text-primary-700' :
                                        activity.type === 'EVENT_ATTENDANCE' ? 'bg-success-100 text-success-700' :
                                            activity.type === 'BADGE_EARNED' ? 'bg-warning-100 text-warning-700' :
                                                'bg-neutral-100 text-neutral-700'}`}
                                    >
                                        {activity.type === 'EVENT_REGISTRATION' ? (
                                            <TicketIcon className="h-5 w-5" />
                                        ) : activity.type === 'EVENT_ATTENDANCE' ? (
                                            <CalendarIcon className="h-5 w-5" />
                                        ) : activity.type === 'BADGE_EARNED' ? (
                                            <StarIcon className="h-5 w-5" />
                                        ) : (
                                            <ClockIcon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="ml-3 flex-grow">
                                        <div className="text-sm font-medium text-neutral-900">{activity.description}</div>
                                        <div className="text-xs text-neutral-500">{formatDate(activity.timestamp)}</div>
                                        {activity.points && (
                                            <div className="text-xs text-success-600 mt-1">+{activity.points} points</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

UserStats.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default UserStats;