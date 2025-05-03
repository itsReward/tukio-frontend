import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrophyIcon, UserCircleIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import gamificationService from '../../services/gamificationService';
import Loader from '../common/Loader';

/**
 * Leaderboard Component
 * Displays user rankings with customizable options
 */
const Leaderboard = ({
                         type = 'weekly',
                         limit = 10,
                         showUserRank = true,
                         userId = null,
                         title = '',
                         className = '',
                     }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                let response;
                switch (type) {
                    case 'weekly':
                        response = await gamificationService.getTopUsersWeekly(limit);
                        break;
                    case 'monthly':
                        response = await gamificationService.getTopUsersMonthly(limit);
                        break;
                    case 'allTime':
                    default:
                        response = await gamificationService.getTopUsersAllTime(limit);
                        break;
                }

                setLeaderboardData(response.data || []);

                // If userId is provided and showUserRank is true, fetch user rank
                if (userId && showUserRank) {
                    const userRankResponse = await gamificationService.getLeaderboardResults(type, userId, 1);
                    if (userRankResponse.data && userRankResponse.data.length > 0) {
                        setUserRank(userRankResponse.data[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
                setError(err.message || 'Failed to fetch leaderboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [type, limit, showUserRank, userId]);

    // Generate title if not provided
    const getTitle = () => {
        if (title) return title;

        switch (type) {
            case 'weekly':
                return 'Weekly Leaderboard';
            case 'monthly':
                return 'Monthly Leaderboard';
            case 'allTime':
                return 'All-Time Leaderboard';
            default:
                return 'Leaderboard';
        }
    };

    // Define medal colors for top 3 positions
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
            <div className={`bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden ${className}`}>
                <div className="p-4 bg-primary-600 text-white">
                    <h3 className="font-semibold">{getTitle()}</h3>
                </div>
                <div className="p-6 flex justify-center">
                    <Loader size="md" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden ${className}`}>
                <div className="p-4 bg-primary-600 text-white">
                    <h3 className="font-semibold">{getTitle()}</h3>
                </div>
                <div className="p-6 text-center text-accent-600">
                    <p>Error loading leaderboard: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-primary-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <TrophyIcon className="h-6 w-6 mr-2 text-amber-300" />
                        <h3 className="font-semibold">{getTitle()}</h3>
                    </div>
                    <span className="text-sm">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Leaderboard Content */}
            {leaderboardData.length === 0 ? (
                <div className="p-6 text-center">
                    <p className="text-neutral-600">No data available for this leaderboard yet.</p>
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
                            className={`p-4 flex items-center justify-between ${index < 3 ? 'bg-neutral-50' : ''} ${
                                user.id === userId ? 'bg-primary-50' : ''
                            }`}
                            variants={itemVariants}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 relative">
                                    {/* Rank Number */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                                        index < 3 ? medalColors[index] : 'bg-primary-100 text-primary-700'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    {/* Show crown for top 1 */}
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
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* User's Own Rank (if not in top users and showUserRank is true) */}
            {showUserRank && userId && userRank && !leaderboardData.some(user => user.id === userId) && (
                <div className="border-t border-neutral-200 p-4">
                    <div className="flex items-center justify-between bg-primary-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                                {userRank.rank}
                            </div>
                            <div className="flex items-center">
                                {userRank.profilePictureUrl ? (
                                    <img
                                        src={userRank.profilePictureUrl}
                                        alt="Your profile"
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                    <span className="font-medium">
                      {userRank.firstName?.[0]}{userRank.lastName?.[0]}
                    </span>
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-neutral-900">You</span>
                                    <div className="flex items-center text-xs text-neutral-500">
                                        <span>Your rank</span>
                                        {userRank.rankChange !== 0 && (
                                            <div className={`flex items-center ml-2 ${
                                                userRank.rankChange > 0 ? 'text-success-600' : 'text-accent-600'
                                            }`}>
                                                {userRank.rankChange > 0 ? (
                                                    <>
                                                        <ChevronUpIcon className="h-3 w-3" />
                                                        <span>{Math.abs(userRank.rankChange)}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDownIcon className="h-3 w-3" />
                                                        <span>{Math.abs(userRank.rankChange)}</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold text-neutral-700">{userRank.score.toLocaleString()}</div>
                            <div className="text-xs text-neutral-500">points</div>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Link */}
            <div className="border-t border-neutral-200 p-4 text-center">
                <Link to="/leaderboard" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View Full Leaderboard
                </Link>
            </div>
        </div>
    );
};

Leaderboard.propTypes = {
    /** Leaderboard type */
    type: PropTypes.oneOf(['weekly', 'monthly', 'allTime']),
    /** Maximum number of users to display */
    limit: PropTypes.number,
    /** Whether to show current user's rank */
    showUserRank: PropTypes.bool,
    /** Current user ID */
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Custom title for the leaderboard */
    title: PropTypes.string,
    /** Additional CSS classes */
    className: PropTypes.string
};

export default Leaderboard;