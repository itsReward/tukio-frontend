import React from 'react';
import { Link } from 'react-router-dom';
import { TrophyIcon, UserCircleIcon } from '@heroicons/react/24/solid';

const LeaderboardPreview = ({ users = [] }) => {
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
            {/* Header */}
            <div className="bg-primary-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <TrophyIcon className="h-6 w-6 mr-2 text-amber-300" />
                        <h3 className="font-semibold">Weekly Leaderboard</h3>
                    </div>
                    <span className="text-sm">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* User List */}
            <div className="divide-y divide-neutral-200">
                {displayUsers.map((user, index) => (
                    <div
                        key={user.id}
                        className={`p-4 flex items-center justify-between ${index < 3 ? 'bg-neutral-50' : ''}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 relative">
                                {/* Rank Number */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${index < 3 ? medalColors[index] : 'bg-primary-100 text-primary-700'}`}>
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardPreview;