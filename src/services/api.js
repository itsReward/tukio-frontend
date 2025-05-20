// api.js - Updated with mock API support
import axios from 'axios';
import mockApi from './mockApi';

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
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // Forbidden - user doesn't have the right permissions
                    console.error('You do not have permission to access this resource');
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found');
                    break;
                case 500:
                    // Server error
                    console.error('An error occurred on the server');
                    break;
                default:
                    console.error(`Error ${error.response.status}: ${error.response.data.message}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from the server');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up the request:', error.message);
        }

        return Promise.reject(error);
    }
);

// API proxy that switches between real API and mock API
const api = {
    get: async (url, config) => {
        if (isMockMode()) {
            // Extract endpoint name for mock API mapping
            const endpoint = url.split('/')[1]; // e.g., 'users', 'events'
            const id = url.split('/')[2]; // e.g., '123'

            // Map URL patterns to mock API functions
            try {
                if (url.startsWith('/api/auth/login')) {
                    return mockApi.login(config.data);
                } else if (url.startsWith('/api/auth/register')) {
                    return mockApi.register(config.data);
                } else if (url.startsWith('/api/auth/validate')) {
                    return mockApi.validateToken(config.params.token);
                } else if (url === '/api/users/me') {
                    return mockApi.getCurrentUser();
                } else if (url.match(/^\/api\/users\/\d+$/)) {
                    return mockApi.getUserById(id);
                } else if (url === '/api/events') {
                    return mockApi.getAllEvents();
                } else if (url.match(/^\/api\/events\/\d+$/)) {
                    return mockApi.getEventById(id);
                } else if (url === '/api/events/upcoming') {
                    return mockApi.getUpcomingEvents();
                } else if (url.match(/^\/api\/events\/organizer\/\d+$/)) {
                    const organizerId = url.split('/')[3];
                    return mockApi.getEventsByOrganizer(organizerId);
                } else if (url.match(/^\/api\/events\/category\/\d+$/)) {
                    const categoryId = url.split('/')[3];
                    return mockApi.getEventsByCategory(categoryId);
                } else if (url === '/api/events/search') {
                    return mockApi.searchEvents(config.params || {});
                } else if (url === '/api/event-categories') {
                    return mockApi.getAllCategories();
                } else if (url.match(/^\/api\/event-categories\/\d+$/)) {
                    return mockApi.getCategoryById(id);
                } else if (url.match(/^\/api\/event-registrations\/user\/\d+$/)) {
                    const userId = url.split('/')[3];
                    return mockApi.getRegistrationsByUser(userId);
                } else if (url.match(/^\/api\/event-registrations\/event\/\d+$/)) {
                    const eventId = url.split('/')[3];
                    return mockApi.getRegistrationsByEvent(eventId);
                } else if (url === '/api/venues') {
                    return mockApi.getAllVenues();
                } else if (url.match(/^\/api\/venues\/\d+$/)) {
                    return mockApi.getVenueById(id);
                } else if (url.match(/^\/api\/gamification\/profile\/\d+$/)) {
                    const userId = url.split('/')[3];
                    return mockApi.getUserGamificationProfile(userId);
                } else if (url.match(/^\/api\/points\/users\/\d+$/)) {
                    const userId = url.split('/')[3];
                    return mockApi.getUserPoints(userId);
                } else if (url.match(/^\/api\/points\/users\/\d+\/transactions$/)) {
                    const userId = url.split('/')[3];
                    const page = config.params?.page || 0;
                    const size = config.params?.size || 10;
                    return mockApi.getUserTransactions(userId, page, size);
                } else if (url === '/api/badges') {
                    return mockApi.getAllBadges();
                } else if (url.match(/^\/api\/badges\/user\/\d+$/)) {
                    const userId = url.split('/')[3];
                    return mockApi.getUserBadges(userId);
                } else if (url.match(/^\/api\/badges\/user\/\d+\/recent$/)) {
                    const userId = url.split('/')[3];
                    const limit = config.params?.limit || 5;
                    return mockApi.getRecentUserBadges(userId, limit);
                } else if (url.match(/^\/api\/gamification\/users\/\d+\/stats$/)) {
                    const userId = url.split('/')[3];
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
                } else if (url.startsWith('/api/notifications/me')) {
                    const page = config.params?.page || 0;
                    const size = config.params?.size || 10;
                    return mockNotificationApi.getUserNotifications(page, size);
                } else if (url.match(/^\/api\/notifications\/\d+$/)) {
                    const id = url.split('/')[2];
                    return mockNotificationApi.getNotificationById(id);
                } else if (url === '/api/notifications/unread-count') {
                    return mockNotificationApi.getUnreadCount();
                } else if (url === '/api/notification-preferences') {
                    return mockNotificationApi.getNotificationPreferences();
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
                    const eventId = url.split('/')[3];
                    const userId = new URLSearchParams(url.split('?')[1]).get('userId');
                    return mockApi.recordEventRegistration(userId, eventId);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/attend$/)) {
                    const eventId = url.split('/')[3];
                    const userId = new URLSearchParams(url.split('?')[1]).get('userId');
                    return mockApi.recordEventAttendance(userId, eventId);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/rate$/)) {
                    const eventId = url.split('/')[3];
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    const userId = urlParams.get('userId');
                    const rating = urlParams.get('rating');
                    return mockApi.recordEventRating(userId, eventId, rating);
                } else if (url.match(/^\/api\/gamification\/events\/\d+\/share$/)) {
                    const eventId = url.split('/')[3];
                    const userId = new URLSearchParams(url.split('?')[1]).get('userId');
                    return mockApi.recordEventSharing(userId, eventId);
                }else if (url === '/api/notifications') {
                    return mockNotificationApi.sendNotification(data);
                } else if (url.match(/^\/api\/notifications\/subscribe\/event\/\d+$/)) {
                    const eventId = url.split('/')[4];
                    return mockNotificationApi.subscribeToEvent(eventId);
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
                if (url.match(/^\/api\/users\/\d+$/)) {
                    return mockApi.updateUserProfile(data);
                } else if (url.match(/^\/api\/events\/\d+$/)) {
                    const id = url.split('/')[2];
                    return mockApi.updateEvent(id, data);
                }else if (url.match(/^\/api\/notifications\/\d+\/read$/)) {
                    const id = url.split('/')[2];
                    return mockNotificationApi.markAsRead(id);
                } else if (url === '/api/notifications/mark-all-read') {
                    return mockNotificationApi.markAllAsRead();
                } else if (url === '/api/notification-preferences') {
                    return mockNotificationApi.updatePreferences(data);
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
                if (url.match(/^\/api\/events\/\d+$/)) {
                    const id = url.split('/')[2];
                    return mockApi.deleteEvent(id);
                } else if (url.match(/^\/api\/notifications\/\d+$/)) {
                    const id = url.split('/')[2];
                    return mockNotificationApi.deleteNotification(id);
                } else if (url === '/api/notifications/clear-all') {
                    return mockNotificationApi.clearAllNotifications();
                } else if (url.match(/^\/api\/notifications\/subscribe\/event\/\d+$/)) {
                    const eventId = url.split('/')[4];
                    return mockNotificationApi.unsubscribeFromEvent(eventId);
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