import { mockNotifications, mockPreferences } from './mockNotificationData';

// Add artificial delay to simulate network requests
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Format API response
const formatResponse = (data) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
});

// Generate a new ID
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

// Clone the initial notifications
let notifications = [...mockNotifications];
let preferences = { ...mockPreferences };

/**
 * Mock Notification API functions
 */
const mockNotificationApi = {
    // Get all notifications for current user
    async getUserNotifications(page = 0, size = 10) {
        await delay();

        // Sort by timestamp (newest first)
        const sortedNotifications = [...notifications].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Paginate results
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedNotifications = sortedNotifications.slice(startIndex, endIndex);

        return formatResponse({
            content: paginatedNotifications,
            page: page,
            size: size,
            totalElements: notifications.length,
            totalPages: Math.ceil(notifications.length / size)
        });
    },

    // Get notification by ID
    async getNotificationById(id) {
        await delay();

        const notification = notifications.find(n => n.id === id);

        if (!notification) {
            throw {
                response: {
                    data: { message: 'Notification not found' },
                    status: 404
                }
            };
        }

        return formatResponse(notification);
    },

    // Mark notification as read
    async markAsRead(id) {
        await delay();

        const notificationIndex = notifications.findIndex(n => n.id === id);

        if (notificationIndex === -1) {
            throw {
                response: {
                    data: { message: 'Notification not found' },
                    status: 404
                }
            };
        }

        notifications[notificationIndex] = {
            ...notifications[notificationIndex],
            read: true
        };

        return formatResponse({ success: true });
    },

    // Mark all notifications as read
    async markAllAsRead() {
        await delay();

        notifications = notifications.map(notification => ({
            ...notification,
            read: true
        }));

        return formatResponse({ success: true });
    },

    // Delete notification
    async deleteNotification(id) {
        await delay();

        const notificationIndex = notifications.findIndex(n => n.id === id);

        if (notificationIndex === -1) {
            throw {
                response: {
                    data: { message: 'Notification not found' },
                    status: 404
                }
            };
        }

        notifications = notifications.filter(notification => notification.id !== id);

        return formatResponse({ success: true });
    },

    // Clear all notifications
    async clearAllNotifications() {
        await delay();

        notifications = [];

        return formatResponse({ success: true });
    },

    // Send notification
    async sendNotification(notificationData) {
        await delay();

        const newNotification = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notificationData
        };

        notifications.unshift(newNotification);

        return formatResponse(newNotification);
    },

    // Get unread notification count
    async getUnreadCount() {
        await delay();

        const unreadCount = notifications.filter(notification => !notification.read).length;

        return formatResponse(unreadCount);
    },

    // Get notification preferences
    async getNotificationPreferences() {
        await delay();

        return formatResponse(preferences);
    },

    // Update notification preferences
    async updatePreferences(preferencesData) {
        await delay();

        preferences = {
            ...preferences,
            ...preferencesData
        };

        return formatResponse(preferences);
    },

    // Subscribe to event notifications
    async subscribeToEvent(eventId) {
        await delay();

        // In a real implementation, this would store a subscription record
        return formatResponse({
            success: true,
            message: `Successfully subscribed to notifications for event ${eventId}`
        });
    },

    // Unsubscribe from event notifications
    async unsubscribeFromEvent(eventId) {
        await delay();

        // In a real implementation, this would remove a subscription record
        return formatResponse({
            success: true,
            message: `Successfully unsubscribed from notifications for event ${eventId}`
        });
    }
};

export default mockNotificationApi;