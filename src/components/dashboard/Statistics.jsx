import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
    CalendarIcon,
    UserGroupIcon,
    ClockIcon,
    TrophyIcon,
    TicketIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import eventService from '../../services/eventService';
import gamificationService from '../../services/gamificationService';

/**
 * Statistics Component
 * Displays user statistics on the dashboard
 */
const Statistics = ({ userId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Fetch user's event statistics
                const eventsResponse = await eventService.getRegistrationsByUser(userId);

                // Fetch user's gamification statistics
                const gamificationResponse = await gamificationService.getUserActivityStats(userId);

                // Fetch user's points
                const pointsResponse = await gamificationService.getUserPoints(userId);

                // Process the data
                const events = eventsResponse.data || [];
                const activities = gamificationResponse.data || {};
                const points = pointsResponse.data || { totalPoints: 0 };

                // Calculate statistics
                const upcomingEvents = events.filter(event => new Date(event.startTime) > new Date()).length;
                const attendedEvents = events.filter(event => event.status === 'ATTENDED').length;
                const registeredEvents = events.length;

                // Set the statistics
                setStats({
                    upcomingEvents,
                    attendedEvents,
                    registeredEvents,
                    points: points.totalPoints,
                    badges: activities.badges || 0,
                    averageRating: activities.averageRating || 0
                });
            } catch (err) {
                console.error('Error fetching statistics:', err);
                setError(err.message || 'Failed to fetch statistics');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchStats();
        }
    }, [userId]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.3
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-card border border-neutral-200 p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-24 bg-neutral-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-card border border-neutral-200 p-6">
                <div className="text-center text-accent-600">
                    <p>Error loading statistics: {error}</p>
                </div>
            </div>
        );
    }

    // Stats data
    const statItems = [
        {
            label: 'Upcoming',
            value: stats?.upcomingEvents || 0,
            icon: CalendarIcon,
            bgColor: 'bg-primary-50',
            textColor: 'text-primary-600',
            iconColor: 'text-primary-500'
        },
        {
            label: 'Registered',
            value: stats?.registeredEvents || 0,
            icon: TicketIcon,
            bgColor: 'bg-secondary-50',
            textColor: 'text-secondary-600',
            iconColor: 'text-secondary-500'
        },
        {
            label: 'Attended',
            value: stats?.attendedEvents || 0,
            icon: UserGroupIcon,
            bgColor: 'bg-success-50',
            textColor: 'text-success-600',
            iconColor: 'text-success-500'
        },
        {
            label: 'Hours',
            value: stats?.attendedEvents * 2 || 0, // Approximate hours spent at events
            icon: ClockIcon,
            bgColor: 'bg-warning-50',
            textColor: 'text-warning-600',
            iconColor: 'text-warning-500'
        },
        {
            label: 'Points',
            value: stats?.points || 0,
            icon: TrophyIcon,
            bgColor: 'bg-accent-50',
            textColor: 'text-accent-600',
            iconColor: 'text-accent-500'
        },
        {
            label: 'Badges',
            value: stats?.badges || 0,
            icon: StarIcon,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconColor: 'text-blue-500'
        },
    ];

    return (
        <motion.div
            className="bg-white rounded-xl shadow-card border border-neutral-200 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statItems.map((item, index) => (
                    <motion.div
                        key={index}
                        className={`${item.bgColor} rounded-lg p-4 flex flex-col items-center justify-center text-center`}
                        variants={itemVariants}
                    >
                        <div className={`rounded-full ${item.bgColor} p-2 mb-2`}>
                            <item.icon className={`h-6 w-6 ${item.iconColor}`} aria-hidden="true" />
                        </div>
                        <div className={`text-2xl font-bold ${item.textColor}`}>{item.value}</div>
                        <div className="text-sm text-neutral-600">{item.label}</div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

Statistics.propTypes = {
    /** User ID to fetch statistics for */
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default Statistics;