import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import gamificationService from '../services/gamificationService';

// Components
import Loader from '../components/common/Loader';

// Icons
import {
    TrophyIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const LeaderboardPage = () => {
    const { currentUser, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('weekly');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);
                let response;

                // Fetch leaderboard data based on active tab
                switch (activeTab) {
                    case 'weekly':
                        response = await gamificationService.getTopUsersWeekly(20);
                        break;
                    case 'monthly':
                        response = await gamificationService.getTopUsersMonthly(20);
                        break;
                    case 'allTime':
                        response = await gamificationService.getTopUsersAllTime(20);
                        break;
                    default:
                        response = await gamificationService.getTopUsersWeekly(20);
                }

                setLeaderboardData(response.data);

                // If user is logged in, find their rank
                if (isAuthenticated && currentUser?.id) {
                    // Check if user is in top 20
                    const userInTop = response.data.findIndex(user => user.id === currentUser.id);

                    if (userInTop !== -1) {
                        setUserRank(userInTop + 1);
                    } else {
                        // If not in top 20, we need to fetch their specific rank
                        try {
                            const rankResponse = await gamificationService.getLeaderboardResults('weekly', currentUser.id, 1);
                            setUserRank(rankResponse.data.rank);
                        } catch (error) {
                            console.error('Error fetching user rank:', error);
                            setUserRank(null);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [activeTab, isAuthenticated, currentUser]);

    // Medal colors for top 3
    const medalColors = [
        'bg-amber-500', // Gold
        'bg-neutral-400', // Silver
        'bg-amber-700', // Bronze
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    // Get time period label
    const getTimeLabel = () => {
        switch (activeTab) {
            case 'weekly':
                return 'This Week';
            case 'monthly':
                return 'This Month';
            case 'allTime':
                return 'All Time';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="py-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                            <TrophyIcon className="h-8 w-8 text-amber-400 mr-2" />
                            Leaderboard
                        </h1>
                        <p className="mt-2 text-neutral-600">
                            Top participants in campus events and activities.
                        </p>
                    </div>

                    {isAuthenticated && userRank && (
                        <div className="mt-4 md:mt-0 bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
                            <div className="text-sm text-neutral-600">Your Current Rank</div>
                            <div className="text-2xl font-bold text-primary-600">#{userRank}</div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="sm:hidden">
                        <select
                            id="tabs"
                            name="tabs"
                            className="block w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="allTime">All Time</option>
                        </select>
                    </div>
                    <div className="hidden sm:block">
                        <div className="border-b border-neutral-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('weekly')}
                                    className={`${
                                        activeTab === 'weekly'
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                    }
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => setActiveTab('monthly')}
                                    className={`${
                                        activeTab === 'monthly'
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                    }
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setActiveTab('allTime')}
                                    className={`${
                                        activeTab === 'allTime'
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                    }
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    All Time
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-neutral-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-neutral-900">Top Participants</h2>
                            <div className="text-sm text-neutral-600 flex items-center">
                                {activeTab !== 'allTime' ? (
                                    <>
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        {getTimeLabel()}
                                    </>
                                ) : (
                                    <>
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        Overall
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <motion.div
                            className="divide-y divide-neutral-200"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {leaderboardData.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    className={`px-6 py-4 flex items-center ${
                                        user.id === currentUser?.id ? 'bg-primary-50' : ''
                                    }`}
                                    variants={itemVariants}
                                >
                                    {/* Rank */}
                                    <div className="w-12 flex-shrink-0">
                                        {index < 3 ? (
                                            <div className={`w-8 h-8 rounded-full ${medalColors[index]} flex items-center justify-center text-white font-semibold`}>
                                                {index + 1}
                                            </div>
                                        ) : (
                                            <div className="text-lg font-semibold text-neutral-900 pl-2">
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-grow flex items-center min-w-0">
                                        {user.profilePictureUrl ? (
                                            <img
                                                src={user.profilePictureUrl}
                                                alt={`${user.firstName} ${user.lastName}`}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                                                <span className="font-medium">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-neutral-900 truncate">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-neutral-500 truncate">
                                                @{user.username}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="ml-4 flex flex-col items-end">
                                        <div className="text-lg font-semibold text-neutral-700">
                                            {user.score ? user.score.toLocaleString() : 0}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            points
                                        </div>
                                    </div>

                                    {/* Movement Indicator */}
                                    {user.movement && (
                                        <div className={`ml-4 flex items-center ${
                                            user.movement > 0
                                                ? 'text-success-600'
                                                : user.movement < 0
                                                    ? 'text-accent-600'
                                                    : 'text-neutral-400'
                                        }`}>
                                            {user.movement > 0 ? (
                                                <ArrowTrendingUpIcon className="h-4 w-4 rotate-0" />
                                            ) : user.movement < 0 ? (
                                                <ArrowTrendingUpIcon className="h-4 w-4 rotate-180" />
                                            ) : (
                                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                                            )}
                                            <span className="ml-1 text-sm">
                                                {Math.abs(user.movement)}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {!loading && leaderboardData.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                <TrophyIcon className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">No data available</h3>
                            <p className="text-neutral-600">
                                There's no leaderboard data for this time period yet.
                            </p>
                        </div>
                    )}
                </div>

                {/* How Points Work */}
                <div className="mt-8 bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-neutral-200">
                        <h2 className="text-xl font-semibold text-neutral-900">How to Earn Points</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: "Event Registration",
                                    points: "10 points",
                                    description: "Register for any campus event",
                                    icon: "📝"
                                },
                                {
                                    title: "Event Attendance",
                                    points: "25 points",
                                    description: "Attend an event you registered for",
                                    icon: "✓"
                                },
                                {
                                    title: "Event Rating",
                                    points: "5-15 points",
                                    description: "Rate and provide feedback for an event",
                                    icon: "⭐"
                                },
                                {
                                    title: "Event Sharing",
                                    points: "5 points",
                                    description: "Share an event with others",
                                    icon: "🔗"
                                }
                            ].map((item, index) => (
                                <div key={index} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-1">{item.title}</h3>
                                    <div className="font-semibold text-primary-600 mb-2">{item.points}</div>
                                    <p className="text-sm text-neutral-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-sm text-neutral-500 text-center">
                            Additional points can be earned by unlocking badges, achieving milestones, and participating in special events.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;