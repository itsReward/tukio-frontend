import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import gamificationService from '../../services/gamificationService';
import Loader from '../common/Loader';

/**
 * PointsDisplay Component
 * Displays user's points and progress
 */
const PointsDisplay = ({ userId, showHistory = false, className = '' }) => {
    const [pointsData, setPointsData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPointsData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user points data
                const pointsResponse = await gamificationService.getUserPoints(userId);
                setPointsData(pointsResponse.data);

                // Fetch transaction history if needed
                if (showHistory) {
                    const transactionsResponse = await gamificationService.getUserTransactions(userId, 0, 5);
                    setTransactions(transactionsResponse.data.content || []);
                }
            } catch (err) {
                console.error('Error fetching points data:', err);
                setError(err.message || 'Failed to fetch points data');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchPointsData();
        }
    }, [userId, showHistory]);

    // Calculate level progress
    const calculateLevelProgress = () => {
        if (!pointsData) return 0;

        const currentLevelPoints = pointsData.currentLevelPoints || 0;
        const pointsToNextLevel = pointsData.pointsToNextLevel || 100;
        const totalPointsNeeded = currentLevelPoints + pointsToNextLevel;

        return Math.floor((currentLevelPoints / totalPointsNeeded) * 100);
    };

    if (loading) {
        return <Loader size="sm" className="my-4" />;
    }

    if (error) {
        return (
            <div className="text-center text-accent-600 my-4">
                <p>Error loading points data: {error}</p>
            </div>
        );
    }

    if (!pointsData) {
        return (
            <div className="text-center my-4">
                <p className="text-neutral-500">No points data available</p>
            </div>
        );
    }

    const levelProgress = calculateLevelProgress();

    return (
        <div className={className}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg p-4"
            >
                {/* Points Overview */}
                <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary-600">
                        {pointsData.totalPoints}
                    </div>
                    <div className="text-sm text-neutral-600">Total Points</div>
                </div>

                {/* Level Indicator */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium text-neutral-700">
                            Level {pointsData.currentLevel}
                        </div>
                        <div className="text-sm text-neutral-500">
                            {pointsData.currentLevelPoints} / {pointsData.currentLevelPoints + pointsData.pointsToNextLevel} points
                        </div>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                        <motion.div
                            className="bg-primary-600 h-2.5 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${levelProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        ></motion.div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                        {pointsData.pointsToNextLevel} points to Level {pointsData.currentLevel + 1}
                    </div>
                </div>

                {/* Points Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-neutral-50 rounded p-2">
                        <div className="text-sm font-medium text-neutral-700">
                            {pointsData.monthlyPoints || 0}
                        </div>
                        <div className="text-xs text-neutral-500">This Month</div>
                    </div>
                    <div className="bg-neutral-50 rounded p-2">
                        <div className="text-sm font-medium text-neutral-700">
                            {pointsData.weeklyPoints || 0}
                        </div>
                        <div className="text-xs text-neutral-500">This Week</div>
                    </div>
                </div>

                {/* Recent Transactions */}
                {showHistory && transactions.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-neutral-700 mb-2">Recent Activity</h4>
                        <div className="space-y-2">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex justify-between items-center text-sm p-2 bg-neutral-50 rounded"
                                >
                                    <div className="flex-grow">
                                        <div className="font-medium text-neutral-800">
                                            {transaction.description}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {new Date(transaction.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className={`font-medium ${transaction.points > 0 ? 'text-success-600' : 'text-accent-600'}`}>
                                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

PointsDisplay.propTypes = {
    /** User ID to fetch points for */
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    /** Whether to show recent transaction history */
    showHistory: PropTypes.bool,
    /** Additional CSS classes */
    className: PropTypes.string
};

export default PointsDisplay;