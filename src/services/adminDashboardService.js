// src/services/adminDashboardService.js
import api from './api';

const ADMIN_DASHBOARD_ENDPOINTS = {
    STATS: 'tukio-admin-service/api/dashboard/stats',
    ACTIVITY: 'tukio-admin-service/api/dashboard/activity',
    APPROVALS: 'tukio-admin-service/api/dashboard/approvals',
    SYSTEM_HEALTH: 'tukio-admin-service/api/dashboard/system-health'
};

class AdminDashboardService {
    /**
     * Get dashboard statistics
     * @returns {Promise} Dashboard stats
     */
    async getDashboardStats() {
        try {
            return await api.get(ADMIN_DASHBOARD_ENDPOINTS.STATS);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get recent activity feed
     * @param {number} limit Number of activities to fetch
     * @returns {Promise} Recent activities
     */
    async getRecentActivity(limit = 10) {
        try {
            return await api.get(`${ADMIN_DASHBOARD_ENDPOINTS.ACTIVITY}?limit=${limit}`);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }

    /**
     * Get pending approvals
     * @returns {Promise} Pending approvals
     */
    async getPendingApprovals() {
        try {
            return await api.get(ADMIN_DASHBOARD_ENDPOINTS.APPROVALS);
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            throw error;
        }
    }

    /**
     * Get system health status
     * @returns {Promise} System health data
     */
    async getSystemHealth() {
        try {
            return await api.get(ADMIN_DASHBOARD_ENDPOINTS.SYSTEM_HEALTH);
        } catch (error) {
            console.error('Error fetching system health:', error);
            throw error;
        }
    }

    /**
     * Get user growth data
     * @param {string} period Time period ('7d', '30d', '90d')
     * @returns {Promise} User growth data
     */
    async getUserGrowth(period = '30d') {
        try {
            return await api.get(`${ADMIN_DASHBOARD_ENDPOINTS.STATS}/user-growth?period=${period}`);
        } catch (error) {
            console.error('Error fetching user growth:', error);
            throw error;
        }
    }

    /**
     * Get event statistics
     * @param {string} period Time period
     * @returns {Promise} Event statistics
     */
    async getEventStats(period = '30d') {
        try {
            return await api.get(`${ADMIN_DASHBOARD_ENDPOINTS.STATS}/events?period=${period}`);
        } catch (error) {
            console.error('Error fetching event stats:', error);
            throw error;
        }
    }

    /**
     * Get venue utilization stats
     * @returns {Promise} Venue utilization data
     */
    async getVenueUtilization() {
        try {
            return await api.get(`${ADMIN_DASHBOARD_ENDPOINTS.STATS}/venues`);
        } catch (error) {
            console.error('Error fetching venue utilization:', error);
            throw error;
        }
    }
}

export default new AdminDashboardService();