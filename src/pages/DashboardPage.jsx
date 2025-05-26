// src/pages/DashboardPage.jsx - Simpler fix using getUserUpcomingEvents
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import gamificationService from '../services/gamificationService';
import { motion } from 'framer-motion';

// Components
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Statistics from '../components/dashboard/Statistics';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import PointsDisplay from '../components/gamification/PointsDisplay';
import RecommendationsWidget from '../components/common/RecommendationsWidget';

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [userEvents, setUserEvents] = useState([]);
    const [gamificationProfile, setGamificationProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('=== DASHBOARD DEBUG START ===');
                console.log('Current user:', currentUser);

                // Try to use the getUserUpcomingEvents endpoint instead
                try {
                    console.log('Trying getUserUpcomingEvents...');
                    const upcomingResponse = await eventService.getUserUpcomingEvents(currentUser.id);
                    console.log('Upcoming events response:', upcomingResponse.data);

                    if (upcomingResponse.data && Array.isArray(upcomingResponse.data)) {
                        setUserEvents(upcomingResponse.data);
                        console.log('Successfully loaded upcoming events');
                    } else {
                        throw new Error('getUserUpcomingEvents returned invalid data');
                    }
                } catch (upcomingError) {
                    console.log('getUserUpcomingEvents failed, falling back to registrations + details fetch');

                    // Fallback to the original method with full event fetching
                    const registrationsResponse = await eventService.getRegistrationsByUser(currentUser.id);
                    console.log('Registrations response:', registrationsResponse.data);

                    let processedEvents = [];

                    if (registrationsResponse.data && Array.isArray(registrationsResponse.data)) {
                        // For each registration, fetch the full event details
                        const eventDetailsPromises = registrationsResponse.data.map(async (registration) => {
                            try {
                                console.log(`Fetching details for event ID: ${registration.eventId}`);
                                const eventResponse = await eventService.getEventById(registration.eventId);
                                const fullEvent = eventResponse.data;

                                // Combine registration data with full event details
                                return {
                                    // Use event ID as primary ID
                                    id: fullEvent.id,
                                    eventId: fullEvent.id,

                                    // Event details
                                    title: fullEvent.title,
                                    description: fullEvent.description,
                                    startTime: fullEvent.startTime,
                                    endTime: fullEvent.endTime,
                                    location: fullEvent.location || fullEvent.venueName,
                                    organizer: fullEvent.organizer,
                                    maxParticipants: fullEvent.maxParticipants,
                                    currentRegistrations: fullEvent.currentRegistrations,
                                    categoryId: fullEvent.categoryId,
                                    categoryName: fullEvent.categoryName,
                                    imageUrl: fullEvent.imageUrl,
                                    tags: fullEvent.tags,
                                    eventStatus: fullEvent.status,

                                    // Registration details
                                    registrationId: registration.id,
                                    status: registration.status,
                                    registrationTime: registration.registrationTime,
                                    checkInTime: registration.checkInTime,
                                    feedback: registration.feedback,
                                    rating: registration.rating
                                };
                            } catch (eventError) {
                                console.error(`Error fetching event ${registration.eventId}:`, eventError);
                                // Skip events that can't be fetched
                                return null;
                            }
                        });

                        // Wait for all event details and filter out null results
                        const allEvents = await Promise.all(eventDetailsPromises);
                        processedEvents = allEvents.filter(event => event !== null);

                        console.log('=== PROCESSED EVENTS WITH FULL DETAILS ===');
                        console.log('All processed events:', processedEvents);
                    }

                    setUserEvents(processedEvents);
                }

                // Fetch gamification profile
                try {
                    const gamificationResponse = await gamificationService.getUserGamificationProfile(currentUser.id);
                    setGamificationProfile(gamificationResponse.data);
                } catch (gamError) {
                    console.warn('Could not load gamification profile:', gamError);
                }

                console.log('=== DASHBOARD DEBUG END ===');

            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.id) {
            loadDashboardData();
        }
    }, [currentUser]);

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
                duration: 0.4
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-neutral-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-accent-600 mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-16 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">
                                Welcome, {currentUser?.firstName || 'User'}!
                            </h1>
                            <p className="mt-1 text-neutral-600">
                                Here's what's happening with your campus activities
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <Link
                                to="/events"
                                className="btn btn-outline"
                            >
                                Browse Events
                            </Link>
                            <Link
                                to="/events/create"
                                className="btn btn-primary"
                            >
                                Create Event
                            </Link>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Main Content - Left Side */}
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        variants={itemVariants}
                    >
                        {/* Statistics Cards */}
                        <Statistics userId={currentUser?.id} />

                        {/* Upcoming Events */}
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-neutral-900">Your Upcoming Events</h2>
                                    <span className="text-sm text-neutral-500">
                                        {userEvents.length} event{userEvents.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <UpcomingEvents events={userEvents} />
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200">
                                <h2 className="text-xl font-semibold text-neutral-900">Recent Activity</h2>
                            </div>
                            <div className="p-6">
                                <ActivityFeed userId={currentUser?.id} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar - Right Side */}
                    <motion.div className="space-y-6" variants={itemVariants}>
                        {/* User Points Summary */}
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200">
                                <h2 className="text-xl font-semibold text-neutral-900">Your Progress</h2>
                            </div>
                            <div className="p-6">
                                <PointsDisplay userId={currentUser?.id} />
                            </div>
                        </div>

                        {/* Recent Badges */}
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-neutral-900">Recent Badges</h2>
                                <Link to="/profile#badges" className="text-sm text-primary-600 hover:text-primary-700">
                                    View All
                                </Link>
                            </div>
                            <div className="p-6">
                                <BadgeDisplay
                                    userId={currentUser?.id}
                                    limit={3}
                                    showRecent={true}
                                />
                            </div>
                        </div>

                        {/* Recommended Events */}
                        <RecommendationsWidget
                            userId={currentUser?.id}
                            maxItems={3}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;