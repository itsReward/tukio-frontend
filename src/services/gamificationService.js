import api from './api';

const GAMIFICATION_ENDPOINTS = {
    GAMIFICATION: 'tukio-gamification-service/api/gamification',
    POINTS: 'tukio-gamification-service/api/points',
    BADGES: 'tukio-gamification-service/api/badges',
    LEADERBOARDS: 'tukio-gamification-service/api/leaderboards',
};

class GamificationService {
    // User gamification profile
    async getUserGamificationProfile(userId) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/profile/${userId}`);
    }

    // Activity tracking
    async processActivityEvent(activityData) {
        return await api.post(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/activity`, activityData);
    }

    async recordEventRegistration(userId, eventId) {
        return await api.post(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/register?userId=${userId}`);
    }

    async recordEventAttendance(userId, eventId) {
        return await api.post(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/attend?userId=${userId}`);
    }

    async recordEventRating(userId, eventId, rating) {
        return await api.post(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/rate?userId=${userId}&rating=${rating}`);
    }

    async recordEventSharing(userId, eventId) {
        return await api.post(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/events/${eventId}/share?userId=${userId}`);
    }

    // Points management
    async getUserPoints(userId) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.POINTS}/users/${userId}`);
    }

    async getUserTransactions(userId, page = 0, size = 10) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.POINTS}/users/${userId}/transactions?page=${page}&size=${size}`);
    }

    // Badges
    async getAllBadges() {
        return await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}`);
    }

    async getUserBadges(userId) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}/user/${userId}`);
    }

    async getRecentUserBadges(userId, limit = 5) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}/user/${userId}/recent?limit=${limit}`);
    }

    async getBadgeProgress(userId, badgeId) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.BADGES}/user/${userId}/progress/${badgeId}`);
    }

    // Leaderboards
    async getAllLeaderboards() {
        return await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}`);
    }

    async getLeaderboardById(leaderboardId) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/${leaderboardId}`);
    }

    async getLeaderboardResults(leaderboardId, userId, limit = 10) {
        let url = `${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/${leaderboardId}/results?limit=${limit}`;
        if (userId) {
            url += `&userId=${userId}`;
        }
        return await api.get(url);
    }

    async getTopUsersWeekly(limit = 10) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/top/weekly?limit=${limit}`);
    }

    async getTopUsersMonthly(limit = 10) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/top/monthly?limit=${limit}`);
    }

    async getTopUsersAllTime(limit = 10) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.LEADERBOARDS}/top/all-time?limit=${limit}`);
    }

    // User activity stats
    async getUserActivityStats(userId) {
        return await api.get(`${GAMIFICATION_ENDPOINTS.GAMIFICATION}/users/${userId}/stats`);
    }
}

export default new GamificationService();