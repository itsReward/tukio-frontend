import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import gamificationService from '../services/gamificationService';

// Components
import EventCard from '../components/events/EventCard';
import LeaderboardPreview from '../components/gamification/LeaderboardPreview';

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);

                // Fetch upcoming events
                const eventsResponse = await eventService.getUpcomingEvents();
                setUpcomingEvents(eventsResponse.data.slice(0, 4)); // Limit to 4 events

                // Fetch top users from leaderboard
                const usersResponse = await gamificationService.getTopUsersWeekly(5);
                setTopUsers(usersResponse.data);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-500 to-secondary-700 pt-24 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/images/pattern.svg')] opacity-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <motion.div
                            className="md:w-1/2 text-white mb-10 md:mb-0"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                Discover & Join Campus Events
                            </h1>
                            <p className="text-lg md:text-xl opacity-90 mb-8">
                                Your centralized platform for finding, organizing, and participating in campus activities.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/events" className="btn bg-white text-primary-700 hover:bg-neutral-100">
                                    Browse Events
                                </Link>
                                {!isAuthenticated && (
                                    <Link to="/register" className="btn bg-accent-500 hover:bg-accent-600 text-white">
                                        Sign Up Now
                                    </Link>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            className="md:w-1/2 flex justify-end"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <img
                                src="/assets/images/hero-image.svg"
                                alt="Campus Events Illustration"
                                className="max-w-full h-auto rounded-xl shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </div>
                {/* Wave Effect */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200">
                        <path fill="#ffffff" fillOpacity="1" d="M0,128L48,112C96,96,192,64,288,64C384,64,480,96,576,112C672,128,768,128,864,122.7C960,117,1056,107,1152,96C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Why Choose Tukio?</h2>
                        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
                            Our platform offers a comprehensive solution for all your campus event needs.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {[
                            {
                                title: "Centralized Event Discovery",
                                description: "Find all campus events in one place - academic, social, cultural, and more.",
                                icon: "🔍",
                            },
                            {
                                title: "Automated Venue Allocation",
                                description: "Intelligent venue matching based on event requirements and availability.",
                                icon: "🏢",
                            },
                            {
                                title: "Personalized Recommendations",
                                description: "Discover events tailored to your interests and past activities.",
                                icon: "✨",
                            },
                            {
                                title: "Gamified Experience",
                                description: "Earn points, badges, and climb leaderboards as you participate in events.",
                                icon: "🏆",
                            },
                            {
                                title: "Attendance Tracking",
                                description: "Easily check-in and track your event participation history.",
                                icon: "📝",
                            },
                            {
                                title: "Social Integration",
                                description: "Share events with friends and see what events others are attending.",
                                icon: "👥",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover border border-neutral-200"
                                variants={itemVariants}
                            >
                                <div className="text-3xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                                <p className="text-neutral-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="py-16 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Upcoming Events</h2>
                        <Link to="/events" className="text-primary-600 hover:text-primary-800 font-medium">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="col-span-4 text-center py-12">
                                    <p className="text-neutral-600 text-lg">No upcoming events found.</p>
                                    <Link to="/events/create" className="btn btn-primary mt-4">
                                        Create an Event
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Leaderboard & Gamification Preview */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">Top Campus Participants</h2>
                            <LeaderboardPreview users={topUsers} />
                            <div className="mt-6 text-center">
                                <Link to="/leaderboard" className="btn btn-outline">
                                    View Full Leaderboard
                                </Link>
                            </div>
                        </div>

                        <div className="md:w-1/2">
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">Earn Rewards & Recognition</h2>
                            <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl p-6 shadow-card border border-neutral-200">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {/* Badge previews */}
                                    {[1, 2, 3].map((badge) => (
                                        <div key={badge} className="flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2">
                                                <span className="text-2xl">🏅</span>
                                            </div>
                                            <span className="text-sm text-center text-neutral-700">Achievement Badge</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-neutral-700 mb-6">
                                    Participate in campus events to earn points, unlock badges, and climb the leaderboards. Get recognized for your campus engagement!
                                </p>
                                <div className="text-center">
                                    {isAuthenticated ? (
                                        <Link to="/profile" className="btn btn-secondary">
                                            View Your Rewards
                                        </Link>
                                    ) : (
                                        <Link to="/register" className="btn btn-secondary">
                                            Start Earning Now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-primary-600 to-secondary-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Enhance Your Campus Experience?</h2>
                    <p className="text-lg text-white opacity-90 mb-8 max-w-2xl mx-auto">
                        Join Tukio today to discover events, connect with peers, and make the most of your time on campus.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn bg-white text-primary-700 hover:bg-neutral-100">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn bg-white text-primary-700 hover:bg-neutral-100">
                                    Sign Up
                                </Link>
                                <Link to="/login" className="btn bg-primary-700 text-white border border-white hover:bg-primary-800">
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;