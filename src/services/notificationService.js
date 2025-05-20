import api from './api';

const NOTIFICATION_ENDPOINTS = {
    NOTIFICATIONS: 'tukio-notification-service/api/notifications',
    PREFERENCES: 'tukio-notification-service/api/notification-preferences',
    TEMPLATES: 'tukio-notification-service/api/notification-templates',
};

/**
 * Service for handling notification-related API calls
 */
class NotificationService {
    /**
     * Get all notifications for current user
     * @param {number} page Page number (0-based)
     * @param {number} size Page size
     * @returns {Promise} API response
     */
    async getUserNotifications(page = 0, size = 10) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/me?page=${page}&size=${size}`);
    }

    /**
     * Get notification by ID
     * @param {string|number} id Notification ID
     * @returns {Promise} API response
     */
    async getNotificationById(id) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}`);
    }

    /**
     * Mark notification as read
     * @param {string|number} id Notification ID
     * @returns {Promise} API response
     */
    async markAsRead(id) {
        return await api.put(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
    }

    /**
     * Mark all notifications as read
     * @returns {Promise} API response
     */
    async markAllAsRead() {
        return await api.put(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/mark-all-read`);
    }

    /**
     * Delete notification
     * @param {string|number} id Notification ID
     * @returns {Promise} API response
     */
    async deleteNotification(id) {
        return await api.delete(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}`);
    }

    /**
     * Clear all notifications
     * @returns {Promise} API response
     */
    async clearAllNotifications() {
        return await api.delete(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/clear-all`);
    }

    /**
     * Send notification to user
     * @param {Object} notificationData Notification data
     * @returns {Promise} API response
     */
    async sendNotification(notificationData) {
        return await api.post(NOTIFICATION_ENDPOINTS.NOTIFICATIONS, notificationData);
    }

    /**
     * Get unread notification count
     * @returns {Promise} API response
     */
    async getUnreadCount() {
        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/unread-count`);
    }

    /**
     * Get notification preferences
     * @returns {Promise} API response
     */
    async getNotificationPreferences() {
        return await api.get(NOTIFICATION_ENDPOINTS.PREFERENCES);
    }

    /**
     * Update notification preferences
     * @param {Object} preferencesData Updated preferences
     * @returns {Promise} API response
     */
    async updatePreferences(preferencesData) {
        return await api.put(NOTIFICATION_ENDPOINTS.PREFERENCES, preferencesData);
    }

    /**
     * Subscribe to event notifications
     * @param {string|number} eventId Event ID
     * @returns {Promise} API response
     */
    async subscribeToEvent(eventId) {
        return await api.post(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/subscribe/event/${eventId}`);
    }

    /**
     * Unsubscribe from event notifications
     * @param {string|number} eventId Event ID
     * @returns {Promise} API response
     */
    async unsubscribeFromEvent(eventId) {
        return await api.delete(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/subscribe/event/${eventId}`);
    }

    /**
     * Get notification templates (admin only)
     * @returns {Promise} API response
     */
    async getNotificationTemplates() {
        return await api.get(NOTIFICATION_ENDPOINTS.TEMPLATES);
    }

    /**
     * Get notification template by ID (admin only)
     * @param {string|number} id Template ID
     * @returns {Promise} API response
     */
    async getTemplateById(id) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/${id}`);
    }

    /**
     * Create notification template (admin only)
     * @param {Object} templateData Template data
     * @returns {Promise} API response
     */
    async createTemplate(templateData) {
        return await api.post(NOTIFICATION_ENDPOINTS.TEMPLATES, templateData);
    }

    /**
     * Update notification template (admin only)
     * @param {string|number} id Template ID
     * @param {Object} templateData Updated template data
     * @returns {Promise} API response
     */
    async updateTemplate(id, templateData) {
        return await api.put(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/${id}`, templateData);
    }

    /**
     * Delete notification template (admin only)
     * @param {string|number} id Template ID
     * @returns {Promise} API response
     */
    async deleteTemplate(id) {
        return await api.delete(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/${id}`);
    }
}

export default new NotificationService();