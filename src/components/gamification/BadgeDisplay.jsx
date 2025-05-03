import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import gamificationService from '../../services/gamificationService';
import Loader from '../common/Loader';

/**
 * BadgeDisplay Component
 * Displays user badges with optional filtering and layout options
 */
const BadgeDisplay = ({
                          userId,
                          limit = 0,
                          showRecent = false,
                          layout = 'grid',
                          emptyMessage = 'No badges earned yet. Participate in events to earn badges!',
                          className = '',
                      }) => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch badges
                const response = showRecent
                    ? await gamificationService.getRecentUserBadges(userId, limit)
                    : await gamificationService.getUserBadges(userId);

                // Process and sort badges
                let badgeData = response.data || [];

                if (showRecent) {
                    // For recent badges, they're already sorted by date earned
                    badgeData = badgeData.slice(0, limit > 0 ? limit : undefined);
                } else {
                    // For all badges, sort by earnedDate (recent first)
                    badgeData = [...badgeData].sort((a, b) => {
                        if (!a.earnedDate) return 1;
                        if (!b.earnedDate) return -1;
                        return new Date(b.earnedDate) - new Date(a.earnedDate);
                    });

                    // Apply limit if specified
                    if (limit > 0) {
                        badgeData = badgeData.slice(0, limit);
                    }
                }

                setBadges(badgeData);
            } catch (err) {
                console.error('Error fetching badges:', err);
                setError(err.message || 'Failed to fetch badges');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBadges();
        }
    }, [userId, limit, showRecent]);

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
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.3
            }
        }
    };

    if (loading) {
        return <Loader size="md" variant="primary" className="my-8" />;
    }

    if (error) {
        return (
            <div className="text-center text-accent-600 my-4">
                <p>Error loading badges: {error}</p>
            </div>
        );
    }

    // If no badges and locked badges aren't shown
    if (badges.length === 0) {
        return (
            <div className="text-center my-4 p-6 bg-neutral-50 rounded-lg">
                <div className="text-neutral-500">{emptyMessage}</div>
            </div>
        );
    }

    // Grid layout
    if (layout === 'grid') {
        return (
            <motion.div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {badges.map((badge) => (
                    <motion.div
                        key={badge.id}
                        className="flex flex-col items-center text-center p-3 bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                        variants={itemVariants}
                    >
                        <div className="w-16 h-16 mb-3 rounded-full bg-primary-100 flex items-center justify-center">
                            {badge.iconUrl ? (
                                <img src={badge.iconUrl} alt={badge.name} className="h-10 w-10" />
                            ) : (
                                <span className="text-2xl">{badge.iconEmoji || '🏆'}</span>
                            )}
                        </div>
                        <h3 className="font-medium text-neutral-900">{badge.name}</h3>
                        <p className="text-xs text-neutral-500 mt-1">{badge.description}</p>
                        {badge.earnedDate && (
                            <div className="mt-2 text-xs text-success-600 font-medium">
                                Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    // List layout
    return (
        <motion.div
            className={`space-y-3 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {badges.map((badge) => (
                <motion.div
                    key={badge.id}
                    className="flex items-center p-3 bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                    variants={itemVariants}
                >
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4 flex-shrink-0">
                        {badge.iconUrl ? (
                            <img src={badge.iconUrl} alt={badge.name} className="h-8 w-8" />
                        ) : (
                            <span className="text-xl">{badge.iconEmoji || '🏆'}</span>
                        )}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-medium text-neutral-900">{badge.name}</h3>
                        <p className="text-sm text-neutral-500">{badge.description}</p>
                    </div>
                    {badge.earnedDate && (
                        <div className="text-xs text-success-600 font-medium whitespace-nowrap ml-4">
                            Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                        </div>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
};

BadgeDisplay.propTypes = {
    /** User ID to fetch badges for */
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    /** Maximum number of badges to display (0 for all) */
    limit: PropTypes.number,
    /** Whether to show only recently earned badges */
    showRecent: PropTypes.bool,
    /** Display layout - grid or list */
    layout: PropTypes.oneOf(['grid', 'list']),
    /** Message to display when no badges are available */
    emptyMessage: PropTypes.string,
    /** Additional CSS classes */
    className: PropTypes.string
};

export default BadgeDisplay;