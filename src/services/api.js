// Updated api.js to include recommendation endpoints
import axios from 'axios';
import mockApi from './mockApi';
import mockNotificationApi from './mockNotificationApi';
import mockRecommendationApi from './mockRecommendationApi';

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
        console.log('🔍 API Interceptor: Error caught:', error.response?.status);

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.log('🔍 API Interceptor: 401 error, clearing token');
                    localStorage.removeItem('token');

                    const currentPath = window.location.pathname;
                    console.log('🔍 API Interceptor: Current path:', currentPath);

                    // UPDATED: Don't redirect if on homepage or other public pages
                    const publicPaths = ['/', '/events', '/venues', '/leaderboard', '/login', '/register', '/forgot-password'];
                    const isPublicPath = publicPaths.includes(currentPath) ||
                        currentPath.startsWith('/events/') ||
                        currentPath.startsWith('/venues/');

                    console.log('🔍 API Interceptor: Is public path:', isPublicPath);

                    // CRITICAL: Only redirect if we're on a truly protected route
                    const protectedPaths = ['/dashboard', '/profile', '/settings', '/admin', '/my-events'];
                    const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));

                    if (isProtectedPath) {
                        console.log('🔍 API Interceptor: Redirecting to /login from protected route');
                        window.location.href = '/login';
                    } else {
                        console.log('🔍 API Interceptor: NOT redirecting - letting component handle error');
                        // Let the component handle the error gracefully
                    }
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
                    console.error(`Error ${error.response.status}: ${error.response.data?.message}`);
            }
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
                // ========== Recommendation Service Endpoints ==========
                if (url.startsWith('tukio-recommendation-service/api/recommendations')) {

                    // GET /api/recommendations/user/{userId}
                    if (url.match(/\/recommendations\/user\/\d+$/)) {
                        const userId = url.match(/\/user\/(\d+)$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const options = {
                            count: params.get('count') ? parseInt(params.get('count')) : undefined,
                            includeUpcoming: params.get('includeUpcoming') ? params.get('includeUpcoming') === 'true' : undefined,
                            includePast: params.get('includePast') ? params.get('includePast') === 'true' : undefined,
                            includeSimilarEvents: params.get('includeSimilarEvents') ? params.get('includeSimilarEvents') === 'true' : undefined,
                            includePopularEvents: params.get('includePopularEvents') ? params.get('includePopularEvents') === 'true' : undefined
                        };
                        return mockRecommendationApi.getRecommendationsForUser(userId, options);
                    }

                    // GET /api/recommendations/user/{userId}/personalized
                    if (url.match(/\/recommendations\/user\/\d+\/personalized$/)) {
                        const userId = url.match(/\/user\/(\d+)\/personalized$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const count = params.get('count') ? parseInt(params.get('count')) : 5;
                        return mockRecommendationApi.getPersonalizedRecommendations(userId, count);
                    }

                    // GET /api/recommendations/user/{userId}/similar
                    if (url.match(/\/recommendations\/user\/\d+\/similar$/)) {
                        const userId = url.match(/\/user\/(\d+)\/similar$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const count = params.get('count') ? parseInt(params.get('count')) : 5;
                        return mockRecommendationApi.getSimilarRecommendations(userId, count);
                    }

                    // GET /api/recommendations/popular
                    if (url.match(/\/recommendations\/popular$/)) {
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const count = params.get('count') ? parseInt(params.get('count')) : 5;
                        return mockRecommendationApi.getPopularEvents(count);
                    }

                    // GET /api/recommendations/trending
                    if (url.match(/\/recommendations\/trending$/)) {
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const count = params.get('count') ? parseInt(params.get('count')) : 5;
                        return mockRecommendationApi.getTrendingEvents(count);
                    }

                    // GET /api/recommendations/user/{userId}/location
                    if (url.match(/\/recommendations\/user\/\d+\/location$/)) {
                        const userId = url.match(/\/user\/(\d+)\/location$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const count = params.get('count') ? parseInt(params.get('count')) : 5;
                        return mockRecommendationApi.getLocationBasedRecommendations(userId, count);
                    }

                    // GET /api/recommendations/user/{userId}/time
                    if (url.match(/\/recommendations\/user\/\d+\/time$/)) {
                        const userId = url.match(/\/user\/(\d+)\/time$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const count = params.get('count') ? parseInt(params.get('count')) : 5;
                        return mockRecommendationApi.getTimeBasedRecommendations(userId, count);
                    }
                }

                // ========== Recommendation Activities Endpoints ==========
                if (url.startsWith('tukio-recommendation-service/api/activities')) {

                    // GET /api/activities/user/{userId}
                    if (url.match(/\/activities\/user\/\d+$/)) {
                        const userId = url.match(/\/user\/(\d+)$/)[1];
                        return mockRecommendationApi.getUserActivities(userId);
                    }

                    // GET /api/activities/user/{userId}/type/{activityType}
                    if (url.match(/\/activities\/user\/\d+\/type\/\w+$/)) {
                        const matches = url.match(/\/user\/(\d+)\/type\/(\w+)$/);
                        const userId = matches[1];
                        const activityType = matches[2];
                        return mockRecommendationApi.getUserActivitiesByType(userId, activityType);
                    }

                    // GET /api/activities/event/{eventId}
                    if (url.match(/\/activities\/event\/\d+$/)) {
                        const eventId = url.match(/\/event\/(\d+)$/)[1];
                        return mockRecommendationApi.getEventActivities(eventId);
                    }

                    // GET /api/activities/event/{eventId}/rating
                    if (url.match(/\/activities\/event\/\d+\/rating$/)) {
                        const eventId = url.match(/\/event\/(\d+)\/rating$/)[1];
                        return mockRecommendationApi.getEventAverageRating(eventId);
                    }

                    // GET /api/activities/popular
                    if (url.match(/\/activities\/popular$/)) {
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const activityType = params.get('activityType');
                        const limit = params.get('limit') ? parseInt(params.get('limit')) : 10;
                        return mockRecommendationApi.getPopularEventsByActivity(activityType, limit);
                    }

                    // GET /api/activities/trending
                    if (url.match(/\/activities\/trending$/)) {
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const activityType = params.get('activityType');
                        const daysAgo = params.get('daysAgo') ? parseInt(params.get('daysAgo')) : 7;
                        const limit = params.get('limit') ? parseInt(params.get('limit')) : 10;
                        return mockRecommendationApi.getTrendingEventsByActivity(activityType, daysAgo, limit);
                    }
                }

                // ========== Recommendation Preferences Endpoints ==========
                if (url.startsWith('tukio-recommendation-service/api/preferences')) {

                    // GET /api/preferences/user/{userId}
                    if (url.match(/\/preferences\/user\/\d+$/)) {
                        const userId = url.match(/\/user\/(\d+)$/)[1];
                        return mockRecommendationApi.getUserPreferences(userId);
                    }

                    // GET /api/preferences/user/{userId}/category/{categoryId}
                    if (url.match(/\/preferences\/user\/\d+\/category\/\d+$/)) {
                        const matches = url.match(/\/user\/(\d+)\/category\/(\d+)$/);
                        const userId = matches[1];
                        const categoryId = matches[2];
                        return mockRecommendationApi.getUserPreferenceForCategory(userId, categoryId);
                    }

                    // GET /api/preferences/user/{userId}/tags
                    if (url.match(/\/preferences\/user\/\d+\/tags$/)) {
                        const userId = url.match(/\/user\/(\d+)\/tags$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const tags = params.get('tags');
                        return mockRecommendationApi.getUserPreferencesByTags(userId, tags);
                    }

                    // GET /api/preferences/user/{userId}/categories
                    if (url.match(/\/preferences\/user\/\d+\/categories$/)) {
                        const userId = url.match(/\/user\/(\d+)\/categories$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const limit = params.get('limit') ? parseInt(params.get('limit')) : 5;
                        return mockRecommendationApi.getFavoriteCategories(userId, limit);
                    }

                    // GET /api/preferences/user/{userId}/similar-users
                    if (url.match(/\/preferences\/user\/\d+\/similar-users$/)) {
                        const userId = url.match(/\/user\/(\d+)\/similar-users$/)[1];
                        const params = new URLSearchParams(url.split('?')[1] || '');
                        const minSimilarityScore = params.get('minSimilarityScore') ? parseFloat(params.get('minSimilarityScore')) : 0.3;
                        return mockRecommendationApi.findSimilarUsers(userId, minSimilarityScore);
                    }
                }

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

                // ========== Attendance Endpoints ==========
                if (url.match(/^tukio-events-service\/api\/events\/\d+\/attendance\/me$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/attendance\/me$/)[1];
                    return mockApi.getMyAttendance(eventId);
                }

                if (url.match(/^tukio-events-service\/api\/events\/\d+\/attendees$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/attendees$/)[1];
                    return mockApi.getEventAttendees(eventId);
                }

                // ========== Rating Endpoints ==========
                if (url.match(/^tukio-events-service\/api\/events\/\d+\/rating\/me$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/rating\/me$/)[1];
                    return mockApi.getMyRating(eventId);
                }

                if (url.match(/^tukio-events-service\/api\/events\/\d+\/ratings$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/ratings$/)[1];
                    const params = new URLSearchParams(url.split('?')[1] || '');
                    const options = {
                        page: params.get('page') ? parseInt(params.get('page')) : 0,
                        size: params.get('size') ? parseInt(params.get('size')) : 10,
                        sort: params.get('sort') || 'createdAt,desc'
                    };
                    return mockApi.getEventRatings(eventId, options);
                }

                if (url.match(/^tukio-events-service\/api\/events\/\d+\/ratings\/summary$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/ratings\/summary$/)[1];
                    return mockApi.getEventRatingSummary(eventId);
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
                // ========== Recommendation Service Endpoints ==========
                if (url === 'tukio-recommendation-service/api/recommendations') {
                    return mockRecommendationApi.getRecommendations(data);
                }

                if (url === 'tukio-recommendation-service/api/activities') {
                    return mockRecommendationApi.recordActivity(data);
                }

                if (url.match(/\/preferences\/user\/\d+\/analyze$/)) {
                    const userId = url.match(/\/user\/(\d+)\/analyze$/)[1];
                    return mockRecommendationApi.analyzeUserActivity(userId);
                }

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

                // ========== Attendance Endpoints ==========
                if (url.match(/^tukio-events-service\/api\/events\/\d+\/attendance$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/attendance$/)[1];
                    return mockApi.recordAttendance(eventId, data);
                }

                // ========== Rating Endpoints ==========
                if (url.match(/^tukio-events-service\/api\/events\/\d+\/rating$/)) {
                    const eventId = url.match(/\/events\/(\d+)\/rating$/)[1];
                    return mockApi.submitEventRating(eventId, data);
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
                // ========== Recommendation Service Endpoints ==========
                if (url === 'tukio-recommendation-service/api/preferences') {
                    return mockRecommendationApi.updateUserPreference(data);
                }

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