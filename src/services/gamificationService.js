// src/services/gamificationService.js - Real API Implementation Only
import api from './api';

const GAMIFICATION_ENDPOINTS = {
    GAMIFICATION: 'tukio-gamification-service/api/gamification',
    POINTS: 'tukio-gamification-service/api/points',
    BADGES: 'tukio-gamification-service/api/badges',
    LEADERBOARDS: 'tukio-gamification-service/api/leaderboards',
};

class GamificationService {
    // ========== User Gamification Profile ==========

    /**
     * Get complete gamification profile for a user
     * @param {string|number} userId User ID
     * @returns {Promise} API response
     */
    async getUserGamificationProfile(userId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/profile/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user gamification profile:', error);
            throw this.handleError(error);
        }
    }

    // ========== Activity Tracking ==========

    /**
     * Process a gamification activity event
     * @param {Object} activityData Activity data
     * @returns {Promise} API response
     */
    async processActivityEvent(activityData) {
        try {
            const response = await api.post(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/activity`, activityData);
            return response;
        } catch (error) {
            console.error('Error processing activity event:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Record event registration
     * @param {string|number} userId User ID
     * @param {string|number} eventId Event ID
     * @returns {Promise} API response
     */
    async recordEventRegistration(userId, eventId) {
        try {
            const response = await api.post(
                `${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/register?userId=${userId}`
            );
            return response;
        } catch (error) {
            console.error('Error recording event registration:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Record event attendance
     * @param {string|number} userId User ID
     * @param {string|number} eventId Event ID
     * @returns {Promise} API response
     */
    async recordEventAttendance(userId, eventId) {
        try {
            const response = await api.post(
                `${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/attend?userId=${userId}`
            );
            return response;
        } catch (error) {
            console.error('Error recording event attendance:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Record event rating
     * @param {string|number} userId User ID
     * @param {string|number} eventId Event ID
     * @param {number} rating Rating value (1-5)
     * @returns {Promise} API response
     */
    async recordEventRating(userId, eventId, rating) {
        try {
            const response = await api.post(
                `${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/rate?userId=${userId}&rating=${rating}`
            );
            return response;
        } catch (error) {
            console.error('Error recording event rating:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Record event sharing
     * @param {string|number} userId User ID
     * @param {string|number} eventId Event ID
     * @returns {Promise} API response
     */
    async recordEventSharing(userId, eventId) {
        try {
            const response = await api.post(
                `${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/share?userId=${userId}`
            );
            return response;
        } catch (error) {
            console.error('Error recording event sharing:', error);
            throw this.handleError(error);
        }
    }

    // ========== Points Management ==========

    /**
     * Get user's current points
     * @param {string|number} userId User ID
     * @returns {Promise} API response
     */
    async getUserPoints(userId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.POINTS}/users/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user points:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get user's point transactions
     * @param {string|number} userId User ID
     * @param {number} page Page number
     * @param {number} size Page size
     * @returns {Promise} API response
     */
    async getUserTransactions(userId, page = 0, size = 10) {
        try {
            const response = await api.get(
                `${GAMIFICATION_ENDPOINTS.POINTS}/users/${userId}/transactions?page=${page}&size=${size}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching user transactions:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Add points to a user
     * @param {Object} pointsData Points data
     * @returns {Promise} API response
     */
    async addPoints(pointsData) {
        try {
            const response = await api.post(`${GAMIFICATION_ENDPOINTS.POINTS}/add`, pointsData);
            return response;
        } catch (error) {
            console.error('Error adding points:', error);
            throw this.handleError(error);
        }
    }

    // ========== Badges ==========

    /**
     * Get all available badges
     * @returns {Promise} API response
     */
    async getAllBadges() {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}`);
            return response;
        } catch (error) {
            console.error('Error fetching all badges:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get user's badges
     * @param {string|number} userId User ID
     * @returns {Promise} API response
     */
    async getUserBadges(userId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}/user/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user badges:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get recent user badges
     * @param {string|number} userId User ID
     * @param {number} limit Number of badges to return
     * @returns {Promise} API response
     */
    async getRecentUserBadges(userId, limit = 5) {
        try {
            const response = await api.get(
                `${GAMIFICATION_ENDPOINTS.BADGES}/user/${userId}/recent?limit=${limit}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching recent user badges:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get badge progress for a user
     * @param {string|number} userId User ID
     * @param {string|number} badgeId Badge ID
     * @returns {Promise} API response
     */
    async getBadgeProgress(userId, badgeId) {
        try {
            const response = await api.get(
                `${GAMIFICATION_ENDPOINTS.BADGES}/user/${userId}/progress/${badgeId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching badge progress:', error);
            throw this.handleError(error);
        }
    }

    // ========== Leaderboards ==========

    /**
     * Get all leaderboards
     * @returns {Promise} API response
     */
    async getAllLeaderboards() {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}`);
            return response;
        } catch (error) {
            console.error('Error fetching all leaderboards:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get leaderboard by ID
     * @param {string|number} leaderboardId Leaderboard ID
     * @returns {Promise} API response
     */
    async getLeaderboardById(leaderboardId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/${leaderboardId}`);
            return response;
        } catch (error) {
            console.error('Error fetching leaderboard by ID:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get leaderboard results
     * @param {string|number} leaderboardId Leaderboard ID
     * @param {string|number} userId User ID (optional)
     * @param {number} limit Number of results to return
     * @returns {Promise} API response
     */
    async getLeaderboardResults(leaderboardId, userId, limit = 10) {
        try {
            let url = `${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/${leaderboardId}/results?limit=${limit}`;
            if (userId) {
                url += `&userId=${userId}`;
            }
            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching leaderboard results:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get top users for the week
     * @param {number} limit Number of users to return
     * @returns {Promise} API response
     */
    async getTopUsersWeekly(limit = 10) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/top/weekly?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching weekly top users:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get top users for the month
     * @param {number} limit Number of users to return
     * @returns {Promise} API response
     */
    async getTopUsersMonthly(limit = 10) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/top/monthly?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching monthly top users:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get top users of all time
     * @param {number} limit Number of users to return
     * @returns {Promise} API response
     */
    async getTopUsersAllTime(limit = 10) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/top/all-time?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching all-time top users:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get user rankings across all leaderboards
     * @param {string|number} userId User ID
     * @returns {Promise} API response
     */
    async getUserRankings(userId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/user/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user rankings:', error);
            throw this.handleError(error);
        }
    }

    // ========== User Activity Stats ==========

    /**
     * Get user activity statistics
     * @param {string|number} userId User ID
     * @returns {Promise} API response
     */
    async getUserActivityStats(userId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/users/${userId}/stats`);
            return response;
        } catch (error) {
            console.error('Error fetching user activity stats:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get most active users
     * @param {number} limit Number of users to return
     * @returns {Promise} API response
     */
    async getMostActiveUsers(limit = 10) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/users/most-active?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching most active users:', error);
            throw this.handleError(error);
        }
    }

    // ========== Level Information ==========

    /**
     * Get level information for a given points amount
     * @param {number} points Points amount
     * @returns {Promise} API response
     */
    async getLevelInfo(points) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.POINTS}/level?points=${points}`);
            return response;
        } catch (error) {
            console.error('Error fetching level info:', error);
            throw this.handleError(error);
        }
    }

    // ========== Badge Management ==========

    /**
     * Get badge by ID
     * @param {string|number} badgeId Badge ID
     * @returns {Promise} API response
     */
    async getBadgeById(badgeId) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}/${badgeId}`);
            return response;
        } catch (error) {
            console.error('Error fetching badge by ID:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get badges by category
     * @param {string} category Badge category
     * @returns {Promise} API response
     */
    async getBadgesByCategory(category) {
        try {
            const response = await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}/category/${category}`);
            return response;
        } catch (error) {
            console.error('Error fetching badges by category:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Award badge to user (admin only)
     * @param {string|number} userId User ID
     * @param {string|number} badgeId Badge ID
     * @param {string|number} eventId Event ID (optional)
     * @returns {Promise} API response
     */
    async awardBadge(userId, badgeId, eventId = null) {
        try {
            let url = `${GAMIFICATION_ENDPOINTS.BADGES}/award?userId=${userId}&badgeId=${badgeId}`;
            if (eventId) {
                url += `&eventId=${eventId}`;
            }
            const response = await api.post(url);
            return response;
        } catch (error) {
            console.error('Error awarding badge:', error);
            throw this.handleError(error);
        }
    }

    // ========== Error Handling ==========

    /**
     * Handle API errors with user-friendly messages
     * @param {Error} error The error object
     * @returns {Error} Formatted error
     */
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    return new Error(data.message || 'Invalid request. Please check your input.');
                case 401:
                    // Don't redirect here, let the main api interceptor handle it
                    return new Error('Authentication required. Please log in again.');
                case 403:
                    return new Error('You do not have permission to perform this action.');
                case 404:
                    return new Error('The requested resource was not found.');
                case 409:
                    return new Error(data.message || 'Conflict: This action cannot be completed due to a conflict.');
                case 422:
                    if (data.errors && Array.isArray(data.errors)) {
                        const errorMessages = data.errors.map(err => err.message).join(', ');
                        return new Error(`Validation error: ${errorMessages}`);
                    }
                    return new Error(data.message || 'Validation error: Please check your input data.');
                case 429:
                    return new Error('Too many requests. Please try again in a few minutes.');
                case 500:
                    return new Error('Server error. Please try again later or contact support.');
                case 503:
                    return new Error('Service temporarily unavailable. Please try again later.');
                default:
                    return new Error(data.message || `An error occurred (${status}). Please try again.`);
            }
        } else if (error.request) {
            return new Error('Network error. Please check your internet connection and try again.');
        } else {
            return new Error('An unexpected error occurred. Please try again.');
        }
    }

    // ========== Utility Methods ==========

    /**
     * Format points display
     * @param {number} points Points amount
     * @returns {string} Formatted points string
     */
    formatPoints(points) {
        if (points === null || points === undefined) return '0';

        if (points >= 1000000) {
            return `${(points / 1000000).toFixed(1)}M`;
        } else if (points >= 1000) {
            return `${(points / 1000).toFixed(1)}K`;
        } else {
            return points.toString();
        }
    }

    /**
     * Calculate level from points
     * @param {number} points Points amount
     * @returns {Object} Level information
     */
    calculateLevel(points) {
        if (!points || points < 0) {
            return { level: 1, progress: 0, pointsToNextLevel: 100 };
        }

        // Level calculation: Level = floor(sqrt(points/100)) + 1
        const level = Math.floor(Math.sqrt(points / 100)) + 1;
        const pointsForCurrentLevel = Math.pow(level - 1, 2) * 100;
        const pointsForNextLevel = Math.pow(level, 2) * 100;
        const pointsToNextLevel = pointsForNextLevel - points;
        const progress = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;

        return {
            level,
            progress: Math.max(0, Math.min(100, progress)),
            pointsToNextLevel: Math.max(0, pointsToNextLevel),
            pointsForNextLevel
        };
    }

    /**
     * Get badge tier color
     * @param {string} tier Badge tier
     * @returns {string} CSS color class
     */
    getBadgeTierColor(tier) {
        switch (tier?.toLowerCase()) {
            case 'bronze':
                return 'text-amber-600';
            case 'silver':
                return 'text-gray-500';
            case 'gold':
                return 'text-yellow-500';
            case 'platinum':
                return 'text-purple-500';
            default:
                return 'text-neutral-600';
        }
    }

    /**
     * Get activity type display name
     * @param {string} activityType Activity type
     * @returns {string} Display name
     */
    getActivityTypeDisplayName(activityType) {
        switch (activityType) {
            case 'EVENT_REGISTRATION':
                return 'Event Registration';
            case 'EVENT_ATTENDANCE':
                return 'Event Attendance';
            case 'EVENT_RATING':
                return 'Event Rating';
            case 'EVENT_SHARING':
                return 'Event Sharing';
            case 'BADGE_EARNED':
                return 'Badge Earned';
            case 'LEVEL_UP':
                return 'Level Up';
            case 'CONSECUTIVE_ATTENDANCE':
                return 'Consecutive Attendance';
            case 'DIVERSE_CATEGORIES':
                return 'Diverse Participation';
            case 'REFERRAL':
                return 'Referral';
            case 'BONUS':
                return 'Bonus Points';
            case 'POINT_ADJUSTMENT':
                return 'Point Adjustment';
            default:
                return activityType?.replace(/_/g, ' ') || 'Unknown Activity';
        }
    }

    /**
     * Get points for activity type
     * @param {string} activityType Activity type
     * @returns {number} Points amount
     */
    getPointsForActivityType(activityType) {
        switch (activityType) {
            case 'EVENT_REGISTRATION':
                return 5;
            case 'EVENT_ATTENDANCE':
                return 10;
            case 'EVENT_RATING':
                return 3;
            case 'EVENT_SHARING':
                return 3;
            case 'BADGE_EARNED':
                return 50;
            case 'CONSECUTIVE_ATTENDANCE':
                return 15;
            case 'DIVERSE_CATEGORIES':
                return 20;
            case 'REFERRAL':
                return 25;
            default:
                return 0;
        }
    }

    /**
     * Validate points data
     * @param {Object} pointsData Points data to validate
     * @returns {Object} Validation result
     */
    validatePointsData(pointsData) {
        const errors = [];

        if (!pointsData.userId) {
            errors.push('User ID is required');
        }

        if (!pointsData.points || pointsData.points < 0) {
            errors.push('Points must be a positive number');
        }

        if (!pointsData.activityType) {
            errors.push('Activity type is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if user has sufficient points for an action
     * @param {number} userPoints User's current points
     * @param {number} requiredPoints Required points
     * @returns {boolean} True if user has sufficient points
     */
    hasSufficientPoints(userPoints, requiredPoints) {
        return userPoints >= requiredPoints;
    }
}

export default new GamificationService();