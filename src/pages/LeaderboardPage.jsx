// src/pages/LeaderboardPage.jsx - Real API Implementation
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import gamificationService from '../services/gamificationService';
import { TrophyIcon, StarIcon, UserIcon } from '@heroicons/react/24/outline';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const LeaderboardPage = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [leaderboards, setLeaderboards] = useState([]);
    const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch available leaderboards
    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                setLoading(true);
                const response = await gamificationService.getAllLeaderboards();
                console.log('Leaderboards response:', response);

                if (response && response.data && Array.isArray(response.data)) {
                    setLeaderboards(response.data);
                    // Set the first active leaderboard as default
                    const activeLeaderboard = response.data.find(lb => lb.isActive);
                    if (activeLeaderboard) {
                        setSelectedLeaderboard(activeLeaderboard);
                    }
                } else {
                    // If no leaderboards from API, create default ones
                    const defaultLeaderboards = [
                        {
                            id: 'weekly',
                            name: 'Weekly Champions',
                            description: 'Top users this week',
                            timeFrame: 'WEEKLY',
                            category: 'OVERALL',
                            isActive: true
                        },
                        {
                            id: 'monthly',
                            name: 'Monthly Leaders',
                            description: 'Top users this month',
                            timeFrame: 'MONTHLY',
                            category: 'OVERALL',
                            isActive: true
                        },
                        {
                            id: 'all-time',
                            name: 'All-Time Legends',
                            description: 'Top users of all time',
                            timeFrame: 'ALL_TIME',
                            category: 'OVERALL',
                            isActive: true
                        }
                    ];
                    setLeaderboards(defaultLeaderboards);
                    setSelectedLeaderboard(defaultLeaderboards[0]);
                }
            } catch (error) {
                console.error('Error fetching leaderboards:', error);
                // Create fallback leaderboards if API fails
                const fallbackLeaderboards = [
                    {
                        id: 'weekly',
                        name: 'Weekly Champions',
                        description: 'Top users this week',
                        timeFrame: 'WEEKLY',
                        category: 'OVERALL',
                        isActive: true
                    },
                    {
                        id: 'monthly',
                        name: 'Monthly Leaders',
                        description: 'Top users this month',
                        timeFrame: 'MONTHLY',
                        category: 'OVERALL',
                        isActive: true
                    },
                    {
                        id: 'all-time',
                        name: 'All-Time Legends',
                        description: 'Top users of all time',
                        timeFrame: 'ALL_TIME',
                        category: 'OVERALL',
                        isActive: true
                    }
                ];
                setLeaderboards(fallbackLeaderboards);
                setSelectedLeaderboard(fallbackLeaderboards[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    // Fetch leaderboard data when selected leaderboard changes
    useEffect(() => {
        if (selectedLeaderboard) {
            fetchLeaderboardData();
        }
    }, [selectedLeaderboard, currentUser]);

    const fetchLeaderboardData = async () => {
        if (!selectedLeaderboard) return;

        try {
            setLoading(true);
            setError(null);

            let leaderboardResults = null;

            // Try to get leaderboard results using the specific leaderboard ID
            if (selectedLeaderboard.id && !['weekly', 'monthly', 'all-time'].includes(selectedLeaderboard.id)) {
                try {
                    const response = await gamificationService.getLeaderboardResults(
                        selectedLeaderboard.id,
                        isAuthenticated ? currentUser?.id : null,
                        10
                    );
                    leaderboardResults = response.data;
                } catch (error) {
                    console.error('Error with specific leaderboard ID:', error);
                }
            }

            // Fallback to quick access endpoints based on timeframe
            if (!leaderboardResults) {
                try {
                    let response;
                    switch (selectedLeaderboard.timeFrame) {
                        case 'WEEKLY':
                            response = await gamificationService.getTopUsersWeekly(10);
                            break;
                        case 'MONTHLY':
                            response = await gamificationService.getTopUsersMonthly(10);
                            break;
                        case 'ALL_TIME':
                            response = await gamificationService.getTopUsersAllTime(10);
                            break;
                        default:
                            response = await gamificationService.getTopUsersWeekly(10);
                    }

                    if (response && response.data) {
                        // Transform the response to match expected format
                        leaderboardResults = {
                            leaderboard: selectedLeaderboard,
                            entries: response.data,
                            userRank: null
                        };
                    }
                } catch (error) {
                    console.error('Error with quick access endpoints:', error);
                    throw error;
                }
            }

            if (leaderboardResults) {
                setLeaderboardData(leaderboardResults);

                // Set user rank if available
                if (leaderboardResults.userRank) {
                    setUserRank(leaderboardResults.userRank);
                } else if (isAuthenticated && currentUser?.id && leaderboardResults.entries) {
                    // Try to find user in the entries
                    const userEntry = leaderboardResults.entries.find(entry =>
                        entry.userId === currentUser.id
                    );
                    if (userEntry) {
                        setUserRank(userEntry);
                    } else {
                        setUserRank(null);
                    }
                }
            } else {
                throw new Error('No leaderboard data received');
            }

        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            setError('Failed to load leaderboard data. Please try again later.');

            // Set empty data to prevent loading state
            setLeaderboardData({
                leaderboard: selectedLeaderboard,
                entries: [],
                userRank: null
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLeaderboardChange = (leaderboard) => {
        setSelectedLeaderboard(leaderboard);
        setLeaderboardData(null);
        setUserRank(null);
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                        <span className="text-xl">👑</span>
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                        <span className="text-xl">🥈</span>
                    </div>
                );
            case 3:
                return (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                        <span className="text-xl">🥉</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100">
                        <span className="text-sm font-bold text-neutral-600">#{rank}</span>
                    </div>
                );
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
            case 3:
                return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
            default:
                return 'bg-white border border-neutral-200';
        }
    };

    if (loading && !leaderboardData) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader size="xl" text="Loading leaderboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-16 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="py-8">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex justify-center mb-4"
                        >
                            <TrophyIcon className="h-16 w-16 text-yellow-500" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl font-bold text-neutral-900 mb-2"
                        >
                            Leaderboard
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-neutral-600"
                        >
                            See how you rank among campus event enthusiasts
                        </motion.p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Leaderboard Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        <Card>
                            <Card.Header>
                                <Card.Title>Categories</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-2">
                                    {leaderboards.map((leaderboard) => (
                                        <button
                                            key={leaderboard.id}
                                            onClick={() => handleLeaderboardChange(leaderboard)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                selectedLeaderboard?.id === leaderboard.id
                                                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                                                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-2 border-transparent'
                                            }`}
                                        >
                                            <div className="font-medium">{leaderboard.name}</div>
                                            <div className="text-sm opacity-75">{leaderboard.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* User Rank Card */}
                        {isAuthenticated && userRank && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-6"
                            >
                                <Card>
                                    <Card.Header>
                                        <Card.Title>Your Rank</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-primary-600 mb-2">
                                                #{userRank.rank}
                                            </div>
                                            <div className="text-lg font-medium text-neutral-900 mb-1">
                                                {userRank.score} points
                                            </div>
                                            <div className="text-sm text-neutral-600">
                                                Keep participating to climb higher!
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Main Leaderboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="lg:col-span-3"
                    >
                        <Card>
                            <Card.Header>
                                <div className="flex justify-between items-center">
                                    <Card.Title>
                                        {selectedLeaderboard?.name || 'Leaderboard'}
                                    </Card.Title>
                                    {selectedLeaderboard?.lastUpdated && (
                                        <Badge variant="secondary" size="sm">
                                            Last updated: {new Date(selectedLeaderboard.lastUpdated).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {error ? (
                                    <div className="text-center py-12">
                                        <div className="text-accent-600 mb-4">{error}</div>
                                        <button
                                            onClick={fetchLeaderboardData}
                                            className="btn btn-primary"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader size="lg" />
                                    </div>
                                ) : leaderboardData?.entries && leaderboardData.entries.length > 0 ? (
                                    <div className="space-y-4">
                                        {leaderboardData.entries.map((entry, index) => (
                                            <motion.div
                                                key={entry.userId}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className={`flex items-center p-4 rounded-lg ${getRankColor(entry.rank)} shadow-sm`}
                                            >
                                                {/* Rank */}
                                                <div className="flex-shrink-0 w-12 flex justify-center">
                                                    {getRankIcon(entry.rank)}
                                                </div>

                                                {/* Profile Picture */}
                                                <div className="flex-shrink-0 ml-4">
                                                    {entry.profilePictureUrl ? (
                                                        <img
                                                            src={entry.profilePictureUrl}
                                                            alt={entry.firstName}
                                                            className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-neutral-300 flex items-center justify-center border-2 border-white shadow-sm">
                                                            <UserIcon className="h-6 w-6 text-neutral-600" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-grow ml-4">
                                                    <div className={`font-semibold ${entry.rank <= 3 ? 'text-white' : 'text-neutral-900'}`}>
                                                        {entry.firstName} {entry.lastName}
                                                    </div>
                                                    <div className={`text-sm ${entry.rank <= 3 ? 'text-white opacity-90' : 'text-neutral-600'}`}>
                                                        @{entry.username}
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="flex-shrink-0 text-right">
                                                    <div className={`text-xl font-bold ${entry.rank <= 3 ? 'text-white' : 'text-neutral-900'}`}>
                                                        {entry.score}
                                                    </div>
                                                    <div className={`text-sm ${entry.rank <= 3 ? 'text-white opacity-90' : 'text-neutral-600'}`}>
                                                        points
                                                    </div>
                                                </div>

                                                {/* Current User Indicator */}
                                                {isAuthenticated && entry.userId === currentUser?.id && (
                                                    <div className="flex-shrink-0 ml-4">
                                                        <Badge variant="accent" size="sm">
                                                            You
                                                        </Badge>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <TrophyIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                            No Rankings Available
                                        </h3>
                                        <p className="text-neutral-600 mb-6">
                                            Be the first to participate in events and earn points!
                                        </p>
                                        <a href="/events" className="btn btn-primary">
                                            Browse Events
                                        </a>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </div>

                {/* Call to Action */}
                {!isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mt-12 text-center"
                    >
                        <Card>
                            <Card.Body>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                                    Join the Competition!
                                </h2>
                                <p className="text-neutral-600 mb-6">
                                    Sign up to participate in events, earn points, and see your name on the leaderboard.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <a href="/register" className="btn btn-primary">
                                        Sign Up
                                    </a>
                                    <a href="/login" className="btn btn-outline">
                                        Log In
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;