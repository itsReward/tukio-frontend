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
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('=== STATISTICS DEBUG ===');
                console.log('Fetching stats for user ID:', userId);

                // Fetch user's event registrations
                const eventsResponse = await eventService.getRegistrationsByUser(userId);
                console.log('Events response:', eventsResponse.data);

                // Fetch user's event registrations
                const eventsAttendanceResponse = await eventService.getMyAttendedEvents(userId);
                console.log('Events response:', eventsResponse.data);

                // Fetch user's gamification statistics
                let gamificationStats = {};
                try {
                    const gamificationResponse = await gamificationService.getUserActivityStats(userId);
                    gamificationStats = gamificationResponse.data || {};
                    console.log('Gamification stats:', gamificationStats);
                } catch (gamError) {
                    console.warn('Could not fetch gamification stats:', gamError);
                }

                // Fetch user's points
                let pointsData = { totalPoints: 0 };
                try {
                    const pointsResponse = await gamificationService.getUserPoints(userId);
                    pointsData = pointsResponse.data || { totalPoints: 0 };
                    console.log('Points data:', pointsData);
                } catch (pointsError) {
                    console.warn('Could not fetch points:', pointsError);
                }

                // Process the registration data
                const registrations = eventsResponse.data || [];
                console.log('Processing registrations:', registrations);

                const attendance = eventsAttendanceResponse.data || [];

                // Calculate statistics from registrations
                const now = new Date();

                // Count different types of events
                let upcomingEvents = 0;
                let attendedEvents = attendance;
                let registeredEvents = registrations.length;
                let totalHours = 0;

                // For each registration, we need to get the actual event details to calculate hours
                const eventDetailsPromises = registrations.map(async (registration) => {
                    try {
                        const eventResponse = await eventService.getEventById(registration.eventId);
                        const event = eventResponse.data;

                        console.log(`Processing event ${registration.eventId}:`, {
                            title: event.title,
                            startTime: event.startTime,
                            endTime: event.endTime,
                            registrationStatus: registration.status,
                            hasCheckIn: !!registration.checkInTime
                        });

                        const eventStart = new Date(event.startTime);
                        const eventEnd = new Date(event.endTime);

                        // Calculate event duration in hours
                        const durationMs = eventEnd - eventStart;
                        const durationHours = Math.max(0, durationMs / (1000 * 60 * 60)); // Convert to hours

                        return {
                            registration,
                            event,
                            eventStart,
                            eventEnd,
                            durationHours,
                            isUpcoming: eventStart > now,
                            isPast: eventEnd < now,
                            isAttended: registration.status === 'ATTENDED' || !!registration.checkInTime
                        };
                    } catch (eventError) {
                        console.warn(`Could not fetch event ${registration.eventId}:`, eventError);
                        return null;
                    }
                });

                // Wait for all event details
                const eventDetails = (await Promise.all(eventDetailsPromises)).filter(Boolean);

                console.log('Event details processed:', eventDetails);

                // Calculate final statistics
                eventDetails.forEach(({ isUpcoming, isAttended, durationHours }) => {
                    if (isUpcoming) {
                        upcomingEvents++;
                    }
                    if (isAttended) {
                        attendedEvents++;
                        totalHours += durationHours; // Only count hours for attended events
                    }
                });

                // Alternative calculation: if we don't have event details, use registration data
                if (eventDetails.length === 0 && registrations.length > 0) {
                    console.log('Falling back to registration-only calculation');

                    attendedEvents = registrations.filter(reg =>
                        reg.status === 'ATTENDED' || !!reg.checkInTime
                    ).length;

                    // Estimate hours (assume 2 hours per attended event as fallback)
                    totalHours = attendedEvents * 2;

                    // For upcoming events, we'd need to check dates, but without event details we can't
                    // So we'll try to get this from gamification stats or set to 0
                }

                console.log('Calculated statistics:', {
                    upcomingEvents,
                    attendedEvents,
                    registeredEvents,
                    totalHours: Math.round(totalHours),
                    points: pointsData.totalPoints,
                    badges: gamificationStats.badges || 0
                });

                // Set the final statistics
                setStats({
                    upcomingEvents,
                    attendedEvents,
                    registeredEvents,
                    totalHours: Math.round(totalHours),
                    points: pointsData.totalPoints || 0,
                    badges: gamificationStats.badges || 0,
                    averageRating: gamificationStats.averageRating || 0,
                    level: gamificationStats.level || 1
                });

            } catch (err) {
                console.error('Error fetching statistics:', err);
                setError(err.message || 'Failed to fetch statistics');

                // Set fallback stats to prevent UI breaking
                setStats({
                    upcomingEvents: 0,
                    attendedEvents: 0,
                    registeredEvents: 0,
                    totalHours: 0,
                    points: 0,
                    badges: 0,
                    averageRating: 0,
                    level: 1
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
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
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-outline btn-sm mt-2"
                    >
                        Retry
                    </button>
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
            value: stats?.totalHours || 0,
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