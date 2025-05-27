// src/components/home/LeaderboardWidget.jsx - Real API Implementation
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrophyIcon, ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline';
import gamificationService from '../../services/gamificationService';
import Card from '../common/Card';
import Loader from '../common/Loader';

const LeaderboardWidget = ({
                               title = "Top Performers",
                               timeframe = "weekly",
                               limit = 5,
                               className = ""
                           }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboardData();
    }, [timeframe, limit]);

    const fetchLeaderboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // Fetch data based on timeframe
            switch (timeframe.toLowerCase()) {
                case 'weekly':
                    response = await gamificationService.getTopUsersWeekly(limit);
                    break;
                case 'monthly':
                    response = await gamificationService.getTopUsersMonthly(limit);
                    break;
                case 'all-time':
                case 'alltime':
                    response = await gamificationService.getTopUsersAllTime(limit);
                    break;
                default:
                    response = await gamificationService.getTopUsersWeekly(limit);
            }

            if (response && response.data && Array.isArray(response.data)) {
                setLeaderboardData(response.data);
            } else {
                setLeaderboardData([]);
            }

        } catch (error) {
            console.error('Error fetching leaderboard data for widget:', error);
            setError('Failed to load leaderboard data');
            setLeaderboardData([]);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100">
                        <span className="text-sm">👑</span>
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
                        <span className="text-sm">🥈</span>
                    </div>
                );
            case 3:
                return (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100">
                        <span className="text-sm">🥉</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-neutral-100">
                        <span className="text-xs font-bold text-neutral-600">#{rank}</span>
                    </div>
                );
        }
    };

    const getTimeframeTitle = () => {
        switch (timeframe.toLowerCase()) {
            case 'weekly':
                return 'This Week';
            case 'monthly':
                return 'This Month';
            case 'all-time':
            case 'alltime':
                return 'All Time';
            default:
                return 'This Week';
        }
    };

    return (
        <div className={className}>
            <Card className="h-full">
                <Card.Header>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                            <div>
                                <Card.Title className="text-base">{title}</Card.Title>
                                <Card.Subtitle className="text-xs">{getTimeframeTitle()}</Card.Subtitle>
                            </div>
                        </div>
                        <Link
                            to="/leaderboard"
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                        >
                            View All
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                </Card.Header>

                <Card.Body className="py-3">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader size="sm" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-6">
                            <div className="text-neutral-400 mb-2">
                                <TrophyIcon className="h-8 w-8 mx-auto" />
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">{error}</p>
                            <button
                                onClick={fetchLeaderboardData}
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : leaderboardData.length > 0 ? (
                        <div className="space-y-3">
                            {leaderboardData.map((entry, index) => (
                                <motion.div
                                    key={entry.userId || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    {/* Rank Icon */}
                                    <div className="flex-shrink-0">
                                        {getRankIcon(entry.rank || index + 1)}
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        {entry.profilePictureUrl ? (
                                            <img
                                                src={entry.profilePictureUrl}
                                                alt={entry.firstName || entry.username}
                                                className="h-8 w-8 rounded-full border border-neutral-200"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-neutral-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-grow min-w-0">
                                        <div className="text-sm font-medium text-neutral-900 truncate">
                                            {entry.firstName && entry.lastName
                                                ? `${entry.firstName} ${entry.lastName}`
                                                : entry.username || 'Anonymous User'
                                            }
                                        </div>
                                        <div className="text-xs text-neutral-500 truncate">
                                            @{entry.username || 'unknown'}
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-sm font-semibold text-neutral-900">
                                            {entry.score !== undefined ? entry.score : entry.totalPoints || 0}
                                        </div>
                                        <div className="text-xs text-neutral-500">pts</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-neutral-400 mb-3">
                                <TrophyIcon className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-sm font-medium text-neutral-900 mb-2">
                                No Rankings Yet
                            </h3>
                            <p className="text-xs text-neutral-600 mb-4">
                                Be the first to participate in events and earn points!
                            </p>
                            <Link
                                to="/events"
                                className="inline-flex items-center text-xs bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
                            >
                                Browse Events
                            </Link>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default LeaderboardWidget;