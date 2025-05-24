// Updated mock notification data to match API structure
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

const pastDate = (hoursAgo) => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date.toISOString();
};

// Mock notifications matching API structure
const mockNotifications = [
    {
        id: '1',
        userId: 1,
        title: 'Registration Confirmed: Introduction to Machine Learning Workshop',
        content: 'Your registration for Introduction to Machine Learning Workshop has been confirmed. The event is scheduled for next week.',
        notificationType: 'EVENT_REGISTRATION',
        channel: 'IN_APP',
        status: 'DELIVERED',
        referenceId: '1',
        referenceType: 'EVENT',
        sentAt: pastDate(2),
        deliveredAt: pastDate(2),
        readAt: null,
        createdAt: pastDate(2)
    },
    {
        id: '2',
        userId: 1,
        title: 'Event Reminder: Annual Sports Day Tomorrow',
        content: 'Don\'t forget! The Annual Sports Day is tomorrow at 10:00 AM. Please arrive 15 minutes early to check in.',
        notificationType: 'EVENT_REMINDER',
        channel: 'IN_APP',
        status: 'DELIVERED',
        referenceId: '2',
        referenceType: 'EVENT',
        sentAt: pastDate(5),
        deliveredAt: pastDate(5),
        readAt: null,
        createdAt: pastDate(5)
    },
    {
        id: '3',
        userId: 1,
        title: 'Event Cancelled: Robotics Seminar',
        content: 'We regret to inform you that the Robotics Seminar scheduled for next week has been cancelled due to unforeseen circumstances.',
        notificationType: 'EVENT_CANCELLATION',
        channel: 'IN_APP',
        status: 'DELIVERED',
        referenceId: '5',
        referenceType: 'EVENT',
        sentAt: pastDate(12),
        deliveredAt: pastDate(12),
        readAt: pastDate(10),
        createdAt: pastDate(12)
    },
    {
        id: '4',
        userId: 1,
        title: 'Venue Changed: Cultural Night 2025',
        content: 'The location for Cultural Night 2025 has been changed to Main Auditorium. Please update your calendar accordingly.',
        notificationType: 'VENUE_CHANGE',
        channel: 'IN_APP',
        status: 'DELIVERED',
        referenceId: '4',
        referenceType: 'EVENT',
        sentAt: pastDate(24),
        deliveredAt: pastDate(24),
        readAt: null,
        createdAt: pastDate(24)
    },
    {
        id: '5',
        userId: 1,
        title: 'Event Details Updated: Career Fair 2025',
        content: 'The schedule for Career Fair 2025 has been updated. Please check the event page for the latest information.',
        notificationType: 'EVENT_UPDATE',
        channel: 'IN_APP',
        status: 'DELIVERED',
        referenceId: '3',
        referenceType: 'EVENT',
        sentAt: pastDate(36),
        deliveredAt: pastDate(36),
        readAt: pastDate(30),
        createdAt: pastDate(36)
    },
    {
        id: '6',
        userId: 1,
        title: 'System Maintenance Scheduled',
        content: 'Tukio will be undergoing maintenance this Saturday from 2:00 AM to 5:00 AM. Some features may be unavailable during this time.',
        notificationType: 'SYSTEM_ANNOUNCEMENT',
        channel: 'IN_APP',
        status: 'DELIVERED',
        referenceId: null,
        referenceType: null,
        sentAt: pastDate(48),
        deliveredAt: pastDate(48),
        readAt: pastDate(35),
        createdAt: pastDate(48)
    }
];

// Mock notification preferences matching API structure
const mockPreferences = [
    {
        userId: 1,
        notificationType: 'EVENT_REGISTRATION',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true
    },
    {
        userId: 1,
        notificationType: 'EVENT_REMINDER',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true
    },
    {
        userId: 1,
        notificationType: 'EVENT_CANCELLATION',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true
    },
    {
        userId: 1,
        notificationType: 'EVENT_UPDATE',
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true
    },
    {
        userId: 1,
        notificationType: 'VENUE_CHANGE',
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true
    },
    {
        userId: 1,
        notificationType: 'SYSTEM_ANNOUNCEMENT',
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: true
    }
];

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

// Clone the initial data
let notifications = [...mockNotifications];
let preferences = [...mockPreferences];

/**
 * Updated Mock Notification API functions to match the API documentation
 */
const mockNotificationApi = {
    // Create and send notification
    async createNotification(notificationData) {
        await delay();

        const newNotifications = notificationData.channels.map(channel => ({
            id: generateId(),
            userId: notificationData.userId,
            title: notificationData.templateData.eventName ?
                `${notificationData.notificationType.replace('_', ' ')}: ${notificationData.templateData.eventName}` :
                notificationData.title || 'New Notification',
            content: notificationData.content || `Notification for ${notificationData.templateData.eventName || 'event'}`,
            notificationType: notificationData.notificationType,
            channel: channel,
            status: 'DELIVERED',
            referenceId: notificationData.referenceId,
            referenceType: notificationData.referenceType,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            readAt: null,
            createdAt: new Date().toISOString()
        }));

        // Add to notifications array
        notifications.unshift(...newNotifications);

        return formatResponse(newNotifications);
    },

    // Get notifications for a specific user
    async getUserNotifications(userId, options = {}) {
        await delay();

        const {
            status,
            channel,
            page = 0,
            size = 10,
            sort = 'createdAt,desc'
        } = options;

        let filteredNotifications = notifications.filter(n => n.userId == userId);

        // Apply filters
        if (status) {
            filteredNotifications = filteredNotifications.filter(n => n.status === status);
        }
        if (channel) {
            filteredNotifications = filteredNotifications.filter(n => n.channel === channel);
        }

        // Sort notifications
        if (sort.includes('createdAt')) {
            const isDesc = sort.includes('desc');
            filteredNotifications.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return isDesc ? dateB - dateA : dateA - dateB;
            });
        }

        // Paginate results
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

        return formatResponse({
            content: paginatedNotifications,
            pageable: {
                pageNumber: page,
                pageSize: size,
                sort: {
                    empty: false,
                    sorted: true,
                    unsorted: false
                }
            },
            totalElements: filteredNotifications.length,
            totalPages: Math.ceil(filteredNotifications.length / size),
            last: endIndex >= filteredNotifications.length,
            size: size,
            number: page,
            sort: {
                empty: false,
                sorted: true,
                unsorted: false
            },
            numberOfElements: paginatedNotifications.length,
            first: page === 0,
            empty: paginatedNotifications.length === 0
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
    async markAsRead(notificationId, userId) {
        await delay();

        const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.userId == userId);
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
            readAt: new Date().toISOString()
        };

        return formatResponse(notifications[notificationIndex]);
    },

    // Get unread notification count
    async getUnreadCount(userId) {
        await delay();

        const unreadCount = notifications.filter(n =>
            n.userId == userId &&
            n.channel === 'IN_APP' &&
            !n.readAt
        ).length;

        return formatResponse({ count: unreadCount });
    },

    // Delete notification
    async deleteNotification(notificationId, userId) {
        await delay();

        const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.userId == userId);
        if (notificationIndex === -1) {
            throw {
                response: {
                    data: { message: 'Notification not found' },
                    status: 404
                }
            };
        }

        notifications = notifications.filter(n => !(n.id === notificationId && n.userId == userId));
        return formatResponse(null);
    },

    // ========== Notification Preferences ==========

    // Get all notification preferences for a user
    async getUserPreferences(userId) {
        await delay();

        const userPreferences = preferences.filter(p => p.userId == userId);
        return formatResponse(userPreferences);
    },

    // Get specific preference
    async getSpecificPreference(userId, notificationType) {
        await delay();

        const preference = preferences.find(p =>
            p.userId == userId && p.notificationType === notificationType
        );

        if (!preference) {
            throw {
                response: {
                    data: { message: 'Preference not found' },
                    status: 404
                }
            };
        }

        return formatResponse(preference);
    },

    // Update notification preference
    async updatePreference(userId, notificationType, preferenceData) {
        await delay();

        const preferenceIndex = preferences.findIndex(p =>
            p.userId == userId && p.notificationType === notificationType
        );

        if (preferenceIndex === -1) {
            // Create new preference if it doesn't exist
            const newPreference = {
                userId: parseInt(userId),
                notificationType,
                ...preferenceData
            };
            preferences.push(newPreference);
            return formatResponse(newPreference);
        } else {
            // Update existing preference
            preferences[preferenceIndex] = {
                ...preferences[preferenceIndex],
                ...preferenceData
            };
            return formatResponse(preferences[preferenceIndex]);
        }
    },

    // Initialize default preferences
    async initializeDefaultPreferences(userId) {
        await delay();

        const defaultNotificationTypes = [
            'EVENT_REGISTRATION',
            'EVENT_REMINDER',
            'EVENT_CANCELLATION',
            'EVENT_UPDATE',
            'VENUE_CHANGE',
            'SYSTEM_ANNOUNCEMENT'
        ];

        const newPreferences = defaultNotificationTypes.map(type => ({
            userId: parseInt(userId),
            notificationType: type,
            emailEnabled: true,
            pushEnabled: true,
            inAppEnabled: true
        }));

        // Remove existing preferences for this user
        preferences = preferences.filter(p => p.userId != userId);

        // Add new preferences
        preferences.push(...newPreferences);

        return formatResponse(newPreferences);
    },

    // ========== Templates (Admin) ==========

    // Get all templates
    async getAllTemplates() {
        await delay();

        const templates = [
            {
                id: 1,
                templateKey: 'EVENT_REGISTRATION_CONFIRMATION_EMAIL',
                title: 'Registration Confirmed: {{eventName}}',
                content: '<div>Hello {{userName}},<br/><br/>Your registration for <strong>{{eventName}}</strong> has been confirmed...</div>',
                description: 'Email template sent to confirm event registration',
                channel: 'EMAIL',
                templateType: 'HTML'
            },
            {
                id: 2,
                templateKey: 'EVENT_REMINDER_EMAIL',
                title: 'Reminder: {{eventName}} is tomorrow',
                content: '<div>Hello {{userName}},<br/><br/>This is a reminder that <strong>{{eventName}}</strong> is tomorrow...</div>',
                description: 'Email template for event reminders',
                channel: 'EMAIL',
                templateType: 'HTML'
            },
            {
                id: 3,
                templateKey: 'EVENT_CANCELLATION_EMAIL',
                title: 'Event Cancelled: {{eventName}}',
                content: '<div>Hello {{userName}},<br/><br/>We regret to inform you that <strong>{{eventName}}</strong> has been cancelled...</div>',
                description: 'Email template for event cancellations',
                channel: 'EMAIL',
                templateType: 'HTML'
            }
        ];

        return formatResponse(templates);
    },

    // Get templates by channel
    async getTemplatesByChannel(channel) {
        await delay();

        const allTemplates = await this.getAllTemplates();
        const filteredTemplates = allTemplates.data.filter(t => t.channel === channel);

        return formatResponse(filteredTemplates);
    },

    // ========== WebSocket Simulation ==========

    // Simulate WebSocket connection (for testing)
    simulateWebSocketNotification(userId, notificationData) {
        // This would be called by the WebSocket simulation
        const notification = {
            id: generateId(),
            userId: parseInt(userId),
            title: notificationData.title,
            content: notificationData.content,
            notificationType: notificationData.notificationType || 'SYSTEM_ANNOUNCEMENT',
            channel: 'IN_APP',
            status: 'DELIVERED',
            referenceId: notificationData.referenceId || null,
            referenceType: notificationData.referenceType || null,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            readAt: null,
            createdAt: new Date().toISOString()
        };

        notifications.unshift(notification);
        return notification;
    }
};

export default mockNotificationApi;