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

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [userEvents, setUserEvents] = useState([]);
    const [gamificationProfile, setGamificationProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch user's events
                const eventsResponse = await eventService.getRegistrationsByUser(currentUser.id);
                setUserEvents(eventsResponse.data);

                // Fetch gamification profile
                const gamificationResponse = await gamificationService.getUserGamificationProfile(currentUser.id);
                setGamificationProfile(gamificationResponse.data);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
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
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
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
                                <h2 className="text-xl font-semibold text-neutral-900">Your Upcoming Events</h2>
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
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200">
                                <h2 className="text-xl font-semibold text-neutral-900">Recommended For You</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-start">
                                            <div className="h-14 w-14 rounded bg-primary-100 flex-shrink-0 flex items-center justify-center">
                                                <span className="text-primary-600 text-lg">🎯</span>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-neutral-900">
                                                    <Link to="/events/1" className="hover:text-primary-600">
                                                        Recommended Event {item}
                                                    </Link>
                                                </h3>
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Based on your interests
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <Link
                                        to="/events"
                                        className="btn btn-outline w-full"
                                    >
                                        Browse More Events
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;