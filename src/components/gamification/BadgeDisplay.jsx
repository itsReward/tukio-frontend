import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gamificationService from '../../services/gamificationService';
import Loader from '../common/Loader';

const BadgeDisplay = ({ userId, limit, showRecent = false }) => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                let badgeData;

                if (showRecent) {
                    badgeData = await gamificationService.getRecentUserBadges(userId, limit || 5);
                } else {
                    badgeData = await gamificationService.getUserBadges(userId);
                }

                setBadges(badgeData.data);
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, [userId, limit, showRecent]);

    // Organize badges by category
    const getBadgesByCategory = () => {
        const categories = {};

        badges.forEach(badge => {
            if (!categories[badge.category]) {
                categories[badge.category] = [];
            }
            categories[badge.category].push(badge);
        });

        return categories;
    };

    // Motion variants for animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader size="md" />
            </div>
        );
    }

    // If showing all badges, group by category
    if (!showRecent && badges.length > 0) {
        const badgesByCategory = getBadgesByCategory();

        return (
            <div className="space-y-8">
                {Object.keys(badgesByCategory).map((category) => (
                    <div key={category}>
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">{category}</h3>
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {badgesByCategory[category].map((badge) => (
                                <motion.div
                                    key={badge.id}
                                    className="flex flex-col items-center"
                                    variants={itemVariants}
                                >
                                    <div className={`w-20 h-20 rounded-full ${badge.earned ? 'bg-primary-100' : 'bg-neutral-100'} flex items-center justify-center mb-2 relative ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                                        <span className="text-3xl">{badge.icon}</span>
                                        {badge.earned && (
                                            <div className="absolute -bottom-1 -right-1 bg-success-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-medium text-neutral-900 text-center">{badge.name}</h4>
                                    <p className="text-xs text-neutral-500 text-center">{badge.description}</p>
                                    {badge.earned && badge.earnedDate && (
                                        <p className="text-xs text-primary-600 mt-1">
                                            Earned {new Date(badge.earnedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                ))}
            </div>
        );
    }

    // For recent badges or no badges
    return (
        <>
            {badges.length > 0 ? (
                <motion.div
                    className="grid grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {badges.map((badge) => (
                        <motion.div
                            key={badge.id}
                            className="flex flex-col items-center"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-2 relative">
                                <span className="text-2xl">{badge.icon}</span>
                                <div className="absolute -bottom-1 -right-1 bg-success-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-neutral-900 text-center">{badge.name}</h4>
                            {badge.earnedDate && (
                                <p className="text-xs text-primary-600 mt-1">
                                    {new Date(badge.earnedDate).toLocaleDateString()}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                        <span className="text-2xl">🏅</span>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No badges yet</h3>
                    <p className="text-neutral-600">
                        Participate in more events to earn badges!
                    </p>
                </div>
            )}
        </>
    );
};

export default BadgeDisplay;