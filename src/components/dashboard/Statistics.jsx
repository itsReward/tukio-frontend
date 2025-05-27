// src/components/dashboard/Statistics.jsx - Fixed to prevent object rendering error
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import eventService from '../../services/eventService';
import gamificationService from '../../services/gamificationService';

// Icons
import {
    CalendarIcon,
    UserGroupIcon,
    StarIcon,
    TrophyIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const Statistics = ({ userId }) => {
    const [stats, setStats] = useState({
        upcomingEvents: 0,
        attendedEvents: [], // Keep as array but don't render directly
        registeredEvents: 0,
        totalHours: 0,
        points: 0,
        level: 1,
        badges: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                setError(null);

                console.log('=== STATISTICS DEBUG ===');
                console.log('Fetching stats for user ID:', userId);

                // Fetch user's registered events
                const eventsResponse = await eventService.getRegistrationsByUser(userId);
                console.log('Events response:', eventsResponse.data);

                // Fetch attended events
                let attendedEvents = [];
                try {
                    const attendedResponse = await eventService.getMyAttendedEvents(userId);
                    console.log('Events response:', attendedResponse.data);
                    attendedEvents = attendedResponse.data || [];
                } catch (attendedError) {
                    console.log('No attended events or error fetching:', attendedError.message);
                }

                // Fetch gamification stats
                let gamificationStats = { totalPoints: 0, level: 1, badgesEarned: 0 };
                try {
                    const gamificationResponse = await gamificationService.getUserGamificationProfile(userId);
                    gamificationStats = gamificationResponse.data;
                    console.log('Gamification stats:', gamificationStats);
                } catch (gamError) {
                    console.warn('Could not load gamification stats:', gamError);
                }

                // Fetch points data
                let pointsData = { totalPoints: 0 };
                try {
                    const pointsResponse = await gamificationService.getUserPoints(userId);
                    pointsData = pointsResponse.data;
                    console.log('Points data:', pointsData);
                } catch (pointsError) {
                    console.warn('Could not load points data:', pointsError);
                }

                // Process the events data
                const registrationsData = eventsResponse.data || [];
                console.log('Processing registrations:', registrationsData);

                // Fetch detailed event info for each registration to get complete data
                const eventDetailsPromises = registrationsData.map(async (registration) => {
                    try {
                        const eventResponse = await eventService.getEventById(registration.eventId);
                        const fullEvent = eventResponse.data;

                        return {
                            ...registration,
                            title: fullEvent.title,
                            startTime: fullEvent.startTime,
                            endTime: fullEvent.endTime,
                            registrationStatus: registration.status,
                            hasCheckIn: registration.checkInTime !== null
                        };
                    } catch (error) {
                        console.error(`Error fetching event ${registration.eventId}:`, error);
                        return {
                            ...registration,
                            title: 'Unknown Event',
                            startTime: new Date().toISOString(),
                            endTime: new Date().toISOString(),
                            registrationStatus: registration.status || 'REGISTERED',
                            hasCheckIn: false
                        };
                    }
                });

                const eventDetails = await Promise.all(eventDetailsPromises);
                console.log('Event details processed:', eventDetails);

                // Calculate statistics
                const now = new Date();
                const upcomingEvents = eventDetails.filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate > now && event.registrationStatus === 'REGISTERED';
                }).length;

                const registeredEvents = eventDetails.filter(event =>
                    event.registrationStatus === 'REGISTERED' ||
                    event.registrationStatus === 'ATTENDED'
                ).length;

                // Calculate total hours from attended events
                const totalHours = attendedEvents.reduce((total, event) => {
                    try {
                        const start = new Date(event.startTime);
                        const end = new Date(event.endTime);
                        const hours = (end - start) / (1000 * 60 * 60);
                        return total + (hours > 0 ? hours : 0);
                    } catch (error) {
                        return total;
                    }
                }, 0);

                const calculatedStats = {
                    upcomingEvents,
                    attendedEvents: attendedEvents, // Keep as array
                    registeredEvents,
                    totalHours: Math.round(totalHours),
                    points: pointsData.totalPoints || gamificationStats.totalPoints || 0,
                    level: gamificationStats.level || 1,
                    badges: gamificationStats.badgesEarned || 0
                };

                console.log('Calculated statistics:', calculatedStats);
                setStats(calculatedStats);

            } catch (error) {
                console.error('Error fetching statistics:', error);
                setError('Failed to load statistics');
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
        visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-card border border-neutral-200 p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <p className="text-accent-700">{error}</p>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Upcoming Events',
            value: stats.upcomingEvents,
            icon: CalendarIcon,
            color: 'primary',
            description: 'Events you\'re registered for'
        },
        {
            title: 'Events Attended',
            value: stats.attendedEvents.length, // Use .length to get count
            icon: CheckCircleIcon,
            color: 'success',
            description: 'Events you\'ve participated in'
        },
        {
            title: 'Total Points',
            value: stats.points,
            icon: TrophyIcon,
            color: 'accent',
            description: `Level ${stats.level}`
        },
        {
            title: 'Badges Earned',
            value: stats.badges,
            icon: StarIcon,
            color: 'secondary',
            description: 'Achievements unlocked'
        }
    ];

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.title}
                        variants={itemVariants}
                        className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                                    <Icon className={`h-6 w-6 text-${card.color}-600`} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-neutral-900">
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </p>
                                <p className="text-sm font-medium text-neutral-700">{card.title}</p>
                                <p className="text-xs text-neutral-500">{card.description}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default Statistics;