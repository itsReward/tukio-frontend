import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gamificationService from '../../services/gamificationService';
import Loader from '../common/Loader';

const PointsDisplay = ({ userId, showButton = false }) => {
    const [pointsData, setPointsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPointsData = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const response = await gamificationService.getUserPoints(userId);
                setPointsData(response.data);
            } catch (error) {
                console.error('Error fetching points data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPointsData();
    }, [userId]);

    // Calculate level based on points
    const calculateLevel = (points) => {
        // Simple level calculation: each level requires 100 more points than the previous
        // Level 1: 0-100, Level 2: 101-300, Level 3: 301-600, etc.
        let level = 1;
        let pointsRequired = 100;
        let accumulatedPoints = 0;

        while (points > accumulatedPoints + pointsRequired) {
            accumulatedPoints += pointsRequired;
            level += 1;
            pointsRequired += 100;
        }

        return {
            level,
            currentPoints: points - accumulatedPoints,
            pointsToNextLevel: pointsRequired,
            progress: ((points - accumulatedPoints) / pointsRequired) * 100
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center py-2">
                <Loader size="sm" />
            </div>
        );
    }

    if (!pointsData) {
        return (
            <div className="text-center py-2">
                <p className="text-neutral-600">Points data unavailable</p>
            </div>
        );
    }

    const { points, rank } = pointsData;
    const levelInfo = calculateLevel(points);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-neutral-900">My Points</h3>
                {showButton && (
                    <Link to="/leaderboard" className="text-primary-600 hover:text-primary-800 text-sm">
                        View Leaderboard
                    </Link>
                )}
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700">Level {levelInfo.level}</span>
                    <span className="text-sm text-neutral-500">
                        {levelInfo.currentPoints} / {levelInfo.pointsToNextLevel} points
                    </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5">
                    <div
                        className="h-2.5 rounded-full bg-primary-500"
                        style={{ width: `${levelInfo.progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-3xl font-bold text-primary-600">{points}</div>
                    <div className="text-sm text-neutral-500">Total Points</div>
                </div>

                <div className="text-right">
                    <div className="text-xl font-semibold text-neutral-900">#{rank}</div>
                    <div className="text-sm text-neutral-500">Rank</div>
                </div>
            </div>

            {!showButton && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="text-center">
                        <Link
                            to="/leaderboard"
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                            View Leaderboard
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PointsDisplay;