import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { PlusIcon, CalendarIcon, MapPinIcon, BellIcon, FireIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

// Components
import Statistics from './Statistics';
import UpcomingEvents from './UpcomingEvents';
import ActivityFeed from './ActivityFeed';
import PointsDisplay from '../gamification/PointsDisplay';
import BadgeDisplay from '../gamification/BadgeDisplay';
import LeaderboardPreview from '../gamification/LeaderboardPreview';
import Loader from '../common/Loader';
import Card from '../common/Card';

// Services
import eventService from '../../services/eventService';
import gamificationService from '../../services/gamificationService';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [userEvents, setUserEvents] = useState([]);
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [recentBadges, setRecentBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user's registered events
                const eventsResponse = await eventService.getRegistrationsByUser(currentUser.id);
                setUserEvents(eventsResponse.data || []);

                // Fetch recommended events - this would typically come from a recommendation service
                // For now, we'll just get some upcoming events
                const upcomingResponse = await eventService.getUpcomingEvents();
                setRecommendedEvents(upcomingResponse.data?.slice(0, 3) || []);

                // Fetch top users from leaderboard
                const topUsersResponse = await gamificationService.getTopUsersWeekly(5);
                setTopUsers(topUsersResponse.data || []);

                // Fetch user's recent badges
                const badgesResponse = await gamificationService.getRecentUserBadges(currentUser.id, 3);
                setRecentBadges(badgesResponse.data || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.id) {
            fetchDashboardData();
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
            <div className="flex justify-center items-center h-64">
                <Loader size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="text-accent-600 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Banner */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {currentUser?.firstName || 'User'}!
                        </h1>
                        <p className="text-white text-opacity-90">
                            Here's what's happening on campus today.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Link to="/events/create" className="btn bg-white text-primary-700 hover:bg-neutral-100 flex items-center">
                            <PlusIcon className="h-5 w-5 mr-1" />
                            Create Event
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div variants={itemVariants}>
                <Statistics userId={currentUser?.id} />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    {/* Upcoming Events */}
                    <Card>
                        <Card.Header>
                            <div className="flex justify-between items-center">
                                <Card.Title>Your Upcoming Events</Card.Title>
                                <Link to="/events/my-events" className="text-sm text-primary-600 hover:text-primary-800">
                                    View All
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <UpcomingEvents events={userEvents} />
                        </Card.Body>
                    </Card>

                    {/* Activity Feed */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Recent Activity</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ActivityFeed userId={currentUser?.id} />
                        </Card.Body>
                    </Card>
                </motion.div>

                {/* Right Column - Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* User Points Summary */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Your Progress</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <PointsDisplay userId={currentUser?.id} />
                        </Card.Body>
                    </Card>

                    {/* Recent Badges */}
                    <Card>
                        <Card.Header>
                            <div className="flex justify-between items-center">
                                <Card.Title>Recent Badges</Card.Title>
                                <Link to="/profile#badges" className="text-sm text-primary-600 hover:text-primary-800">
                                    View All
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <BadgeDisplay
                                userId={currentUser?.id}
                                limit={3}
                                showRecent={true}
                            />
                        </Card.Body>
                    </Card>

                    {/* Recommended Events */}
                    <Card>
                        <Card.Header>
                            <div className="flex items-center">
                                <FireIcon className="h-5 w-5 text-primary-600 mr-2" />
                                <Card.Title>Recommended For You</Card.Title>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                {recommendedEvents.length > 0 ? (
                                    recommendedEvents.map((event) => (
                                        <div key={event.id} className="flex items-start">
                                            <div className="h-12 w-12 rounded bg-primary-100 flex-shrink-0 flex items-center justify-center">
                                                {event.categoryName === 'Academic' ? (
                                                    <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                                                ) : event.categoryName === 'Sports' ? (
                                                    <TableTennisIcon className="h-6 w-6 text-primary-600" />
                                                ) : (
                                                    <CalendarIcon className="h-6 w-6 text-primary-600" />
                                                )}
                                            </div>
                                            <div className="ml-4 flex-grow min-w-0">
                                                <Link
                                                    to={`/events/${event.id}`}
                                                    className="text-sm font-medium text-neutral-900 hover:text-primary-600 block truncate"
                                                >
                                                    {event.title}
                                                </Link>
                                                <div className="flex items-center text-xs text-neutral-500 mt-1">
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    <span className="truncate">
                            {new Date(event.startTime).toLocaleDateString()}
                          </span>
                                                    <MapPinIcon className="h-3 w-3 ml-2 mr-1" />
                                                    <span className="truncate">
                            {event.location || event.venueName || 'TBD'}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-3">
                                        <p className="text-neutral-500 text-sm">No recommendations available</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-neutral-200">
                                <Link
                                    to="/events"
                                    className="btn btn-outline w-full"
                                >
                                    Browse All Events
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Leaderboard Preview */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Top Participants</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <LeaderboardPreview users={topUsers} />
                            <div className="mt-4 text-center">
                                <Link to="/leaderboard" className="text-sm text-primary-600 hover:text-primary-800">
                                    View Full Leaderboard
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;