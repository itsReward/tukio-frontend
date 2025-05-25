import api from './api';

const RECOMMENDATION_ENDPOINTS = {
    RECOMMENDATIONS: 'tukio-recommendation-service/api/recommendations',
    ACTIVITIES: 'tukio-recommendation-service/api/activities',
    PREFERENCES: 'tukio-recommendation-service/api/preferences',
};

class RecommendationService {
    // ========== Recommendations ==========

    /**
     * Get comprehensive recommendations for a user
     * @param {Object} requestData - The recommendation request
     * @returns {Promise} API response
     */
    async getRecommendations(requestData) {
        return await api.post(RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS, requestData);
    }

    /**
     * Get recommendations for user (simplified)
     * @param {number} userId - User ID
     * @param {Object} options - Query parameters
     * @returns {Promise} API response
     */
    async getRecommendationsForUser(userId, options = {}) {
        const params = new URLSearchParams();

        if (options.count) params.append('count', options.count);
        if (options.includeUpcoming !== undefined) params.append('includeUpcoming', options.includeUpcoming);
        if (options.includePast !== undefined) params.append('includePast', options.includePast);
        if (options.includeSimilarEvents !== undefined) params.append('includeSimilarEvents', options.includeSimilarEvents);
        if (options.includePopularEvents !== undefined) params.append('includePopularEvents', options.includePopularEvents);

        const queryString = params.toString();
        const url = `${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/user/${userId}${queryString ? '?' + queryString : ''}`;

        return await api.get(url);
    }

    /**
     * Get personalized recommendations
     * @param {number} userId - User ID
     * @param {number} count - Number of recommendations
     * @returns {Promise} API response
     */
    async getPersonalizedRecommendations(userId, count = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/user/${userId}/personalized?count=${count}`);
    }

    /**
     * Get similar events recommendations
     * @param {number} userId - User ID
     * @param {number} count - Number of recommendations
     * @returns {Promise} API response
     */
    async getSimilarRecommendations(userId, count = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/user/${userId}/similar?count=${count}`);
    }

    /**
     * Get popular events
     * @param {number} count - Number of recommendations
     * @returns {Promise} API response
     */
    async getPopularEvents(count = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/popular?count=${count}`);
    }

    /**
     * Get trending events
     * @param {number} count - Number of recommendations
     * @returns {Promise} API response
     */
    async getTrendingEvents(count = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/trending?count=${count}`);
    }

    /**
     * Get location-based recommendations
     * @param {number} userId - User ID
     * @param {number} count - Number of recommendations
     * @returns {Promise} API response
     */
    async getLocationBasedRecommendations(userId, count = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/user/${userId}/location?count=${count}`);
    }

    /**
     * Get time-based recommendations
     * @param {number} userId - User ID
     * @param {number} count - Number of recommendations
     * @returns {Promise} API response
     */
    async getTimeBasedRecommendations(userId, count = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.RECOMMENDATIONS}/user/${userId}/time?count=${count}`);
    }

    // ========== User Activities ==========

    /**
     * Record user activity
     * @param {Object} activityData - Activity data
     * @returns {Promise} API response
     */
    async recordActivity(activityData) {
        return await api.post(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}`, activityData);
    }

    /**
     * Get user activities
     * @param {number} userId - User ID
     * @returns {Promise} API response
     */
    async getUserActivities(userId) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}/user/${userId}`);
    }

    /**
     * Get user activities by type
     * @param {number} userId - User ID
     * @param {string} activityType - Activity type
     * @returns {Promise} API response
     */
    async getUserActivitiesByType(userId, activityType) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}/user/${userId}/type/${activityType}`);
    }

    /**
     * Get event activities
     * @param {number} eventId - Event ID
     * @returns {Promise} API response
     */
    async getEventActivities(eventId) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}/event/${eventId}`);
    }

    /**
     * Get event average rating
     * @param {number} eventId - Event ID
     * @returns {Promise} API response
     */
    async getEventAverageRating(eventId) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}/event/${eventId}/rating`);
    }

    /**
     * Get popular events by activity
     * @param {string} activityType - Activity type
     * @param {number} limit - Number of events
     * @returns {Promise} API response
     */
    async getPopularEventsByActivity(activityType, limit = 10) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}/popular?activityType=${activityType}&limit=${limit}`);
    }

    /**
     * Get trending events by activity
     * @param {string} activityType - Activity type
     * @param {number} daysAgo - Look back period
     * @param {number} limit - Number of events
     * @returns {Promise} API response
     */
    async getTrendingEventsByActivity(activityType, daysAgo = 7, limit = 10) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.ACTIVITIES}/trending?activityType=${activityType}&daysAgo=${daysAgo}&limit=${limit}`);
    }

    // ========== User Preferences ==========

    /**
     * Get user preferences
     * @param {number} userId - User ID
     * @returns {Promise} API response
     */
    async getUserPreferences(userId) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}/user/${userId}`);
    }

    /**
     * Get user preference for category
     * @param {number} userId - User ID
     * @param {number} categoryId - Category ID
     * @returns {Promise} API response
     */
    async getUserPreferenceForCategory(userId, categoryId) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}/user/${userId}/category/${categoryId}`);
    }

    /**
     * Update user preference
     * @param {Object} preferenceData - Preference data
     * @returns {Promise} API response
     */
    async updateUserPreference(preferenceData) {
        return await api.put(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}`, preferenceData);
    }

    /**
     * Get user preferences by tags
     * @param {number} userId - User ID
     * @param {Array} tags - Array of tags
     * @returns {Promise} API response
     */
    async getUserPreferencesByTags(userId, tags) {
        const tagsParam = Array.isArray(tags) ? tags.join(',') : tags;
        return await api.get(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}/user/${userId}/tags?tags=${encodeURIComponent(tagsParam)}`);
    }

    /**
     * Get favorite categories
     * @param {number} userId - User ID
     * @param {number} limit - Number of categories
     * @returns {Promise} API response
     */
    async getFavoriteCategories(userId, limit = 5) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}/user/${userId}/categories?limit=${limit}`);
    }

    /**
     * Find similar users
     * @param {number} userId - User ID
     * @param {number} minSimilarityScore - Minimum similarity threshold
     * @returns {Promise} API response
     */
    async findSimilarUsers(userId, minSimilarityScore = 0.3) {
        return await api.get(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}/user/${userId}/similar-users?minSimilarityScore=${minSimilarityScore}`);
    }

    /**
     * Analyze user activity
     * @param {number} userId - User ID
     * @returns {Promise} API response
     */
    async analyzeUserActivity(userId) {
        return await api.post(`${RECOMMENDATION_ENDPOINTS.PREFERENCES}/user/${userId}/analyze`);
    }

    // ========== Convenience Methods ==========

    /**
     * Record event view activity
     * @param {number} userId - User ID
     * @param {number} eventId - Event ID
     * @param {number} viewDuration - Duration in seconds
     * @returns {Promise} API response
     */
    async recordEventView(userId, eventId, viewDuration = null) {
        const activityData = {
            userId,
            eventId,
            activityType: 'VIEW'
        };

        if (viewDuration !== null) {
            activityData.viewDuration = viewDuration;
        }

        return await this.recordActivity(activityData);
    }

    /**
     * Record event registration activity
     * @param {number} userId - User ID
     * @param {number} eventId - Event ID
     * @returns {Promise} API response
     */
    async recordEventRegistration(userId, eventId) {
        return await this.recordActivity({
            userId,
            eventId,
            activityType: 'REGISTER'
        });
    }

    /**
     * Record event attendance
     * @param {number} userId - User ID
     * @param {number} eventId - Event ID
     * @returns {Promise} API response
     */
    async recordEventAttendance(userId, eventId) {
        return await this.recordActivity({
            userId,
            eventId,
            activityType: 'ATTEND'
        });
    }

    /**
     * Record event rating
     * @param {number} userId - User ID
     * @param {number} eventId - Event ID
     * @param {number} rating - Rating (1-5)
     * @returns {Promise} API response
     */
    async recordEventRating(userId, eventId, rating) {
        return await this.recordActivity({
            userId,
            eventId,
            activityType: 'RATE',
            rating
        });
    }

    /**
     * Record event sharing
     * @param {number} userId - User ID
     * @param {number} eventId - Event ID
     * @returns {Promise} API response
     */
    async recordEventSharing(userId, eventId) {
        return await this.recordActivity({
            userId,
            eventId,
            activityType: 'SHARE'
        });
    }

    /**
     * Record event favoriting
     * @param {number} userId - User ID
     * @param {number} eventId - Event ID
     * @returns {Promise} API response
     */
    async recordEventFavorite(userId, eventId) {
        return await this.recordActivity({
            userId,
            eventId,
            activityType: 'FAVORITE'
        });
    }

    /**
     * Get dashboard recommendations - combines multiple recommendation types
     * @param {number} userId - User ID
     * @param {number} count - Total number of recommendations
     * @returns {Promise} Combined recommendations
     */
    async getDashboardRecommendations(userId, count = 6) {
        try {
            // Try to get comprehensive recommendations first
            const response = await this.getRecommendationsForUser(userId, {
                count,
                includeUpcoming: true,
                includePast: false,
                includeSimilarEvents: true,
                includePopularEvents: true
            });

            if (response.data && response.data.upcomingRecommendations) {
                return response.data.upcomingRecommendations;
            }

            // Fallback to popular events if no personalized recommendations
            const popularResponse = await this.getPopularEvents(count);
            return popularResponse.data || [];

        } catch (error) {
            console.error('Error fetching dashboard recommendations:', error);

            // Final fallback to popular events
            try {
                const popularResponse = await this.getPopularEvents(count);
                return popularResponse.data || [];
            } catch (fallbackError) {
                console.error('Error fetching popular events fallback:', fallbackError);
                return [];
            }
        }
    }
}

export default new RecommendationService();