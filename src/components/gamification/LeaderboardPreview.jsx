import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { TrophyIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import gamificationService from "../../services/gamificationService.js";
import Card from "../common/Card.jsx";
import {ChevronRightIcon, UserIcon} from "@heroicons/react/24/outline/index.js";
import Loader from "../common/Loader.jsx";
import {motion} from "framer-motion";

/*const LeaderboardPreview = ({ users = [] }) => {
    // Define medal colors
    const medalColors = [
        'bg-amber-500', // Gold
        'bg-neutral-400', // Silver
        'bg-amber-700', // Bronze
    ];

    // Placeholder data if no users are provided
    const placeholderUsers = [
        { id: 1, username: 'JaneDoe', firstName: 'Jane', lastName: 'Doe', score: 1500 },
        { id: 2, username: 'JohnSmith', firstName: 'John', lastName: 'Smith', score: 1350 },
        { id: 3, username: 'AliceBlue', firstName: 'Alice', lastName: 'Blue', score: 1200 },
        { id: 4, username: 'BobGreen', firstName: 'Bob', lastName: 'Green', score: 1100 },
        { id: 5, username: 'CharlieRed', firstName: 'Charlie', lastName: 'Red', score: 950 },
    ];

    // Use provided users or placeholders
    const displayUsers = users.length > 0 ? users : placeholderUsers;

    return (
        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
            {/!* Header *!/}
            <div className="bg-primary-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <TrophyIcon className="h-6 w-6 mr-2 text-amber-300" />
                        <h3 className="font-semibold">Weekly Leaderboard</h3>
                    </div>
                    <span className="text-sm">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/!* User List *!/}
            <div className="divide-y divide-neutral-200">
                {displayUsers.map((user, index) => (
                    <div
                        key={user.id}
                        className={`p-4 flex items-center justify-between ${index < 3 ? 'bg-neutral-50' : ''}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 relative">
                                {/!* Rank Number *!/}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${index < 3 ? medalColors[index] : 'bg-primary-100 text-primary-700'}`}>
                                    {index + 1}
                                </div>

                                {/!* Show crown for top 1 *!/}
                                {index === 0 && (
                                    <span className="absolute -top-2 -right-1 text-amber-500">👑</span>
                                )}
                            </div>

                            <div className="flex items-center">
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

                                <div>
                                    <Link to={`/profile/${user.id}`} className="font-medium text-neutral-900 hover:text-primary-600">
                                        {user.firstName} {user.lastName}
                                    </Link>
                                    <p className="text-sm text-neutral-500">@{user.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-lg font-semibold text-neutral-700">{user.score.toLocaleString()}</div>
                            <div className="text-xs text-neutral-500">points</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardPreview;*/

const LeaderboardPreview = ({
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

export default LeaderboardPreview;