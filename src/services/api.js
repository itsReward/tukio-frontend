// Updated api.js to include notification endpoints
import axios from 'axios';
import mockApi from './mockApi';
import mockNotificationApi from './mockNotificationApi';

// Helper to get mock mode status from context/localStorage
const isMockMode = () => localStorage.getItem('useMockApi') === 'true';

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle specific error codes
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('You do not have permission to access this resource');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('An error occurred on the server');
                    break;
                default:
                    console.error(`Error ${error.response.status}: ${error.response.data.message}`);
            }
        } else if (error.request) {
            console.error('No response received from the server');
        } else {
            console.error('Error setting up the request:', error.message);
        }

        return Promise.reject(error);
    }
);

// API proxy that switches between real API and mock API
const api = {
    get: async (url, config) => {
        if (isMockMode()) {
            // Extract endpoint parts for mock API mapping
            const urlParts = url.split('/');
            const baseEndpoint = urlParts[1]; // e.g., 'notifications', 'notification-preferences'

            try {
                // ========== Notification Endpoints ==========
                if (url.startsWith('tukio-notification-service/api/notifications')) {

                    // Parse notification endpoints
                    if (url.match(/\/notifications\/user\/\d+$/)) {
                        const userId = url.match(/\/user\/(\d+)$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const options = {
                            status: params.get('status'),
                            channel: params.get('channel'),
                            page: parseInt(params.get('page')) || 0,
                            size: parseInt(params.get('size')) || 10,
                            sort: params.get('sort') || 'createdAt,desc'
                        };
                        return mockNotificationApi.getUserNotifications(userId, options);
                    }

                    if (url.match(/\/notifications\/user\/\d+\/unread-count$/)) {
                        const userId = url.match(/\/user\/(\d+)\/unread-count$/)[1];
                        return mockNotificationApi.getUnreadCount(userId);
                    }

                    if (url.match(/\/notifications\/\d+$/)) {
                        const notificationId = url.match(/\/notifications\/(\d+)$/)[1];
                        return mockNotificationApi.getNotificationById(notificationId);
                    }

                    if (url === 'tukio-notification-service/api/notifications/me') {
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const options = {
                            status: params.get('status'),
                            channel: params.get('channel') || 'IN_APP',
                            page: parseInt(params.get('page')) || 0,
                            size: parseInt(params.get('size')) || 10,
                            sort: params.get('sort') || 'createdAt,desc'
                        };
                        return mockNotificationApi.getUserNotifications(1, options); // Mock user ID 1
                    }
                }

                // ========== Notification Preferences Endpoints ==========
                if (url.startsWith('tukio-notification-service/api/notification-preferences')) {

                    if (url.match(/\/notification-preferences\/user\/\d+$/)) {
                        const userId = url.match(/\/user\/(\d+)$/)[1];
                        return mockNotificationApi.getUserPreferences(userId);
                    }

                    if (url.match(/\/notification-preferences\/user\/\d+\/type\/\w+$/)) {
                        const matches = url.match(/\/user\/(\d+)\/type\/(\w+)$/);
                        const userId = matches[1];
                        const notificationType = matches[2];
                        return mockNotificationApi.getSpecificPreference(userId, notificationType);
                    }
                }

                // ========== Template Endpoints ==========
                if (url.startsWith('tukio-notification-service/api/notification-templates')) {

                    if (url === 'tukio-notification-service/api/notification-templates') {
                        return mockNotificationApi.getAllTemplates();
                    }

                    if (url.match(/\/notification-templates\/channel\/\w+$/)) {
                        const channel = url.match(/\/channel\/(\w+)$/)[1];
                        return mockNotificationApi.getTemplatesByChannel(channel);
                    }
                }

                // ========== Existing Event/User Endpoints ==========
                // Keep existing mock API mappings for events, users, etc.
                if (url.startsWith('/api/auth/login')) {
                    return mockApi.login(config.data);
                } else if (url.startsWith('/api/auth/register')) {
                    return mockApi.register(config.data);
                } else if (url.startsWith('/api/auth/validate')) {
                    return mockApi.validateToken(config.params.token);
                } else if (url === '/api/users/me') {
                    return mockApi.getCurrentUser();
                } else if (url.match(/^\/api\/users\/\d+$/)) {
                    const id = url.split('/')[3];
                    return mockApi.getUserById(id);
                } else if (url === '/api/events') {
                    return mockApi.getAllEvents();
                } else if (url.match(/^\/api\/events\/\d+$/)) {
                    const id = url.split('/')[3];
                    return mockApi.getEventById(id);
                } else if (url === '/api/events/upcoming') {
                    return mockApi.getUpcomingEvents();
                } else if (url.match(/^\/api\/events\/organizer\/\d+$/)) {
                    const organizerId = url.split('/')[4];
                    return mockApi.getEventsByOrganizer(organizerId);
                } else if (url.match(/^\/api\/events\/category\/\d+$/)) {
                    const categoryId = url.split('/')[4];
                    return mockApi.getEventsByCategory(categoryId);
                } else if (url === '/api/events/search') {
                    return mockApi.searchEvents(config.params || {});
                } else if (url === '/api/event-categories') {
                    return mockApi.getAllCategories();
                } else if (url.match(/^\/api\/event-categories\/\d+$/)) {
                    const id = url.split('/')[3];
                    return mockApi.getCategoryById(id);
                } else if (url.match(/^\/api\/event-registrations\/user\/\d+$/)) {
                    const userId = url.split('/')[4];
                    return mockApi.getRegistrationsByUser(userId);
                } else if (url.match(/^\/api\/event-registrations\/event\/\d+$/)) {
                    const eventId = url.split('/')[4];
                    return mockApi.getRegistrationsByEvent(eventId);
                } else if (url === '/api/venues') {
                    return mockApi.getAllVenues();
                } else if (url.match(/^\/api\/venues\/\d+$/)) {
                    const id = url.split('/')[3];
                    return mockApi.getVenueById(id);
                } else if (url.match(/^\/api\/gamification\/profile\/\d+$/)) {
                    const userId = url.split('/')[4];
                    return mockApi.getUserGamificationProfile(userId);
                } else if (url.match(/^\/api\/points\/users\/\d+$/)) {
                    const userId = url.split('/')[4];
                    return mockApi.getUserPoints(userId);
                } else if (url.match(/^\/api\/points\/users\/\d+\/transactions$/)) {
                    const userId = url.split('/')[4];
                    const page = config.params?.page || 0;
                    const size = config.params?.size || 10;
                    return mockApi.getUserTransactions(userId, page, size);
                } else if (url === '/api/badges') {
                    return mockApi.getAllBadges();
                } else if (url.match(/^\/api\/badges\/user\/\d+$/)) {
                    const userId = url.split('/')[4];
                    return mockApi.getUserBadges(userId);
                } else if (url.match(/^\/api\/badges\/user\/\d+\/recent$/)) {
                    const userId = url.split('/')[4];
                    const limit = config.params?.limit || 5;
                    return mockApi.getRecentUserBadges(userId, limit);
                } else if (url.match(/^\/api\/gamification\/users\/\d+\/stats$/)) {
                    const userId = url.split('/')[4];
                    return mockApi.getUserActivityStats(userId);
                } else if (url.match(/^\/api\/leaderboards\/top\/weekly$/)) {
                    const limit = config.params?.limit || 10;
                    return mockApi.getTopUsersWeekly(limit);
                } else if (url.match(/^\/api\/leaderboards\/top\/monthly$/)) {
                    const limit = config.params?.limit || 10;
                    return mockApi.getTopUsersMonthly(limit);
                } else if (url.match(/^\/api\/leaderboards\/top\/all-time$/)) {
                    const limit = config.params?.limit || 10;
                    return mockApi.getTopUsersAllTime(limit);
                }

                // Default case - not implemented in mock
                console.warn(`Mock API endpoint not implemented: ${url}`);
                return { data: { message: 'Mock API endpoint not implemented' } };
            } catch (error) {
                // Pass through mock API errors
                return Promise.reject(error);
            }
        } else {
            // Use real API
            return axiosInstance.get(url, config);
        }
    },

    post: async (url, data, config) => {
        if (isMockMode()) {
            try {
                // ========== Notification Endpoints ==========
                if (url === 'tukio-notification-service/api/notifications') {
                    return mockNotificationApi.createNotification(data);
                }

                if (url.match(/\/notification-preferences\/user\/\d+\/initialize$/)) {
                    const userId = url.match(/\/user\/(\d+)\/initialize$/)[1];
                    return mockNotificationApi.initializeDefaultPreferences(userId);
                }

                // ========== Existing Event/User Endpoints ==========
                if (url.startsWith('/api/auth/login')) {
                    return mockApi.login(data);
                } else if (url.startsWith('/api/auth/register')) {
                    return mockApi.register(data);
                } else if (url === '/api/events') {
                    return mockApi.createEvent(data);
                } else if (url === '/api/venues') {
                    return mockApi.createVenue(data);
                } else if (url === '/api/event-registrations/register') {
                    return mockApi.registerForEvent(data);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/register$/)) {
                    const eventId = url.split('/')[4];
                    const userId = new URLSearchParams(url.split('?')[1]).get('userId');
                    return mockApi.recordEventRegistration(userId, eventId);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/attend$/)) {
                    const eventId = url.split('/')[4];
                    const userId = new URLSearchParams(url.split('?')[1]).get('userId');
                    return mockApi.recordEventAttendance(userId, eventId);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/rate$/)) {
                    const eventId = url.split('/')[4];
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    const userId = urlParams.get('userId');
                    const rating = urlParams.get('rating');
                    return mockApi.recordEventRating(userId, eventId, rating);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/share$/)) {
                    const eventId = url.split('/')[4];
                    const userId = new URLSearchParams(url.split('?')[1]).get('userId');
                    return mockApi.recordEventSharing(userId, eventId);
                }

                // Default case - not implemented in mock
                console.warn(`Mock API endpoint not implemented: ${url}`);
                return { data: { message: 'Mock API endpoint not implemented' } };
            } catch (error) {
                return Promise.reject(error);
            }
        } else {
            // Use real API
            return axiosInstance.post(url, data, config);
        }
    },

    put: async (url, data, config) => {
        if (isMockMode()) {
            try {
                // ========== Notification Endpoints ==========
                if (url.match(/\/notifications\/\d+\/read\?userId=\d+$/)) {
                    const matches = url.match(/\/notifications\/(\d+)\/read\?userId=(\d+)$/);
                    const notificationId = matches[1];
                    const userId = matches[2];
                    return mockNotificationApi.markAsRead(notificationId, userId);
                }

                if (url.match(/\/notification-preferences\/user\/\d+\/type\/\w+$/)) {
                    const matches = url.match(/\/user\/(\d+)\/type\/(\w+)$/);
                    const userId = matches[1];
                    const notificationType = matches[2];
                    return mockNotificationApi.updatePreference(userId, notificationType, data);
                }

                // ========== Existing Event/User Endpoints ==========
                if (url.match(/^\/api\/users\/\d+$/)) {
                    return mockApi.updateUserProfile(data);
                } else if (url.match(/^\/api\/events\/\d+$/)) {
                    const id = url.split('/')[3];
                    return mockApi.updateEvent(id, data);
                }

                // Default case - not implemented in mock
                console.warn(`Mock API endpoint not implemented: ${url}`);
                return { data: { message: 'Mock API endpoint not implemented' } };
            } catch (error) {
                return Promise.reject(error);
            }
        } else {
            // Use real API
            return axiosInstance.put(url, data, config);
        }
    },

    delete: async (url, config) => {
        if (isMockMode()) {
            try {
                // ========== Notification Endpoints ==========
                if (url.match(/\/notifications\/\d+\?userId=\d+$/)) {
                    const matches = url.match(/\/notifications\/(\d+)\?userId=(\d+)$/);
                    const notificationId = matches[1];
                    const userId = matches[2];
                    return mockNotificationApi.deleteNotification(notificationId, userId);
                }

                // ========== Existing Event/User Endpoints ==========
                if (url.match(/^\/api\/events\/\d+$/)) {
                    const id = url.split('/')[3];
                    return mockApi.deleteEvent(id);
                }

                // Default case - not implemented in mock
                console.warn(`Mock API endpoint not implemented: ${url}`);
                return { data: { message: 'Mock API endpoint not implemented' } };
            } catch (error) {
                return Promise.reject(error);
            }
        } else {
            // Use real API
            return axiosInstance.delete(url, config);
        }
    }
};

export default api;