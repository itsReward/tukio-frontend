// Mock recommendation API data and functions
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

const futureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString();
};

const pastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

// Mock events for recommendations (expanded from existing events)
const recommendationEvents = [
    {
        eventId: 1,
        title: 'Advanced Machine Learning Workshop',
        description: 'Deep dive into neural networks and AI algorithms with hands-on projects.',
        categoryId: 6,
        categoryName: 'Technology',
        startTime: futureDate(5),
        location: 'Engineering Building Room 201',
        venueId: 2,
        venueName: 'Science Lab 101',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['technology', 'ai', 'machine learning', 'programming'],
        registrationCount: 85,
        recommendationType: 'PERSONALIZED',
        similarityScore: null
    },
    {
        eventId: 2,
        title: 'Data Science Bootcamp',
        description: 'Learn data analysis, visualization, and predictive modeling techniques.',
        categoryId: 6,
        categoryName: 'Technology',
        startTime: futureDate(8),
        location: 'Main Campus, Building A',
        venueId: 1,
        venueName: 'Main Auditorium',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['data science', 'analytics', 'python', 'technology'],
        registrationCount: 67,
        recommendationType: 'SIMILAR_EVENTS',
        similarityScore: 0.89
    },
    {
        eventId: 3,
        title: 'Startup Pitch Competition',
        description: 'Present your startup idea to industry professionals and win funding.',
        categoryId: 5,
        categoryName: 'Career',
        startTime: futureDate(12),
        location: 'Business Building Auditorium',
        venueId: 3,
        venueName: 'Conference Room A',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['entrepreneurship', 'business', 'networking', 'career'],
        registrationCount: 120,
        recommendationType: 'POPULAR',
        similarityScore: null
    },
    {
        eventId: 4,
        title: 'Web Development Workshop',
        description: 'Build modern web applications using React, Node.js, and cloud technologies.',
        categoryId: 6,
        categoryName: 'Technology',
        startTime: futureDate(15),
        location: 'Computer Science Building Lab 3',
        venueId: 2,
        venueName: 'Science Lab 101',
        imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['web development', 'react', 'javascript', 'programming'],
        registrationCount: 78,
        recommendationType: 'SIMILAR_EVENTS',
        similarityScore: 0.76
    },
    {
        eventId: 5,
        title: 'Cybersecurity Fundamentals',
        description: 'Learn essential cybersecurity practices and ethical hacking techniques.',
        categoryId: 6,
        categoryName: 'Technology',
        startTime: futureDate(18),
        location: 'IT Security Lab',
        venueId: 2,
        venueName: 'Science Lab 101',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['cybersecurity', 'hacking', 'security', 'technology'],
        registrationCount: 92,
        recommendationType: 'TRENDING',
        similarityScore: null
    },
    {
        eventId: 6,
        title: 'Digital Marketing Masterclass',
        description: 'Master social media marketing, SEO, and digital advertising strategies.',
        categoryId: 5,
        categoryName: 'Career',
        startTime: futureDate(10),
        location: 'Business Building Room 305',
        venueId: 3,
        venueName: 'Conference Room A',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['marketing', 'digital', 'social media', 'business'],
        registrationCount: 145,
        recommendationType: 'POPULAR',
        similarityScore: null
    },
    {
        eventId: 7,
        title: 'Photography Workshop',
        description: 'Learn advanced photography techniques and photo editing skills.',
        categoryId: 3,
        categoryName: 'Cultural',
        startTime: futureDate(7),
        location: 'Art Studio Building',
        venueId: 4,
        venueName: 'Sports Complex',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['photography', 'art', 'creative', 'visual'],
        registrationCount: 54,
        recommendationType: 'LOCATION_BASED',
        similarityScore: null
    },
    {
        eventId: 8,
        title: 'Leadership Development Program',
        description: 'Develop essential leadership skills for your career advancement.',
        categoryId: 5,
        categoryName: 'Career',
        startTime: futureDate(20),
        location: 'Executive Education Center',
        venueId: 3,
        venueName: 'Conference Room A',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['leadership', 'management', 'career', 'professional'],
        registrationCount: 98,
        recommendationType: 'TIME_BASED',
        similarityScore: null
    },
    {
        eventId: 9,
        title: 'Blockchain and Cryptocurrency',
        description: 'Understand blockchain technology and cryptocurrency fundamentals.',
        categoryId: 6,
        categoryName: 'Technology',
        startTime: futureDate(14),
        location: 'FinTech Lab',
        venueId: 2,
        venueName: 'Science Lab 101',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['blockchain', 'cryptocurrency', 'fintech', 'technology'],
        registrationCount: 76,
        recommendationType: 'PERSONALIZED',
        similarityScore: null
    },
    {
        eventId: 10,
        title: 'Public Speaking Mastery',
        description: 'Overcome fear and become a confident, compelling public speaker.',
        categoryId: 1,
        categoryName: 'Academic',
        startTime: futureDate(9),
        location: 'Communication Skills Center',
        venueId: 5,
        venueName: 'Lecture Hall B',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['communication', 'speaking', 'presentation', 'skills'],
        registrationCount: 63,
        recommendationType: 'PERSONALIZED',
        similarityScore: null
    }
];

// Mock user activities
let userActivities = [
    {
        userId: 1,
        eventId: 1,
        activityType: 'VIEW',
        rating: null,
        viewDuration: 120,
        timestamp: pastDate(2)
    },
    {
        userId: 1,
        eventId: 2,
        activityType: 'REGISTER',
        rating: null,
        viewDuration: null,
        timestamp: pastDate(3)
    },
    {
        userId: 1,
        eventId: 6,
        activityType: 'RATE',
        rating: 5,
        viewDuration: null,
        timestamp: pastDate(5)
    },
    {
        userId: 1,
        eventId: 3,
        activityType: 'SHARE',
        rating: null,
        viewDuration: null,
        timestamp: pastDate(1)
    }
];

// Mock user preferences
let userPreferences = [
    {
        userId: 1,
        categoryId: 6,
        preferenceScore: 0.9,
        tags: ['technology', 'programming', 'ai'],
        preferredLocation: 'Engineering Building',
        preferredDayOfWeek: 3, // Wednesday
        preferredTimeOfDay: 'AFTERNOON'
    },
    {
        userId: 1,
        categoryId: 5,
        preferenceScore: 0.7,
        tags: ['career', 'business', 'networking'],
        preferredLocation: 'Business Building',
        preferredDayOfWeek: 5, // Friday
        preferredTimeOfDay: 'MORNING'
    },
    {
        userId: 1,
        categoryId: 1,
        preferenceScore: 0.6,
        tags: ['academic', 'learning', 'skills'],
        preferredLocation: null,
        preferredDayOfWeek: null,
        preferredTimeOfDay: 'EVENING'
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

/**
 * Mock Recommendation API functions
 */
const mockRecommendationApi = {
    // ========== Recommendations ==========

    // Get comprehensive recommendations for a user
    async getRecommendations(requestData) {
        await delay();

        const {
            userId,
            count = 5,
            includeUpcoming = true,
            includePast = false,
            includeSimilarEvents = true,
            includePopularEvents = true,
            includePersonalizedRecommendations = true
        } = requestData;

        let upcomingRecommendations = [];
        let pastRecommendations = [];

        if (includeUpcoming) {
            let upcoming = [...recommendationEvents];

            // Filter by user preferences if personalized recommendations are enabled
            if (includePersonalizedRecommendations) {
                const userPrefs = userPreferences.filter(p => p.userId == userId);
                if (userPrefs.length > 0) {
                    upcoming = upcoming.filter(event =>
                        userPrefs.some(pref => pref.categoryId === event.categoryId)
                    );
                }
            }

            // Limit results
            upcomingRecommendations = upcoming.slice(0, count);
        }

        if (includePast) {
            // Mock past recommendations (empty for now)
            pastRecommendations = [];
        }

        return formatResponse({
            userId: parseInt(userId),
            upcomingRecommendations,
            pastRecommendations,
            recommendationTimestamp: new Date().toISOString(),
            totalRecommendations: upcomingRecommendations.length + pastRecommendations.length
        });
    },

    // Get recommendations for user (simplified)
    async getRecommendationsForUser(userId, options = {}) {
        await delay();

        const {
            count = 5,
            includeUpcoming = true,
            includePast = false,
            includeSimilarEvents = true,
            includePopularEvents = true
        } = options;

        return this.getRecommendations({
            userId,
            count,
            includeUpcoming,
            includePast,
            includeSimilarEvents,
            includePopularEvents,
            includePersonalizedRecommendations: true
        });
    },

    // Get personalized recommendations
    async getPersonalizedRecommendations(userId, count = 5) {
        await delay();

        const userPrefs = userPreferences.filter(p => p.userId == userId);
        let personalizedEvents = [];

        if (userPrefs.length > 0) {
            personalizedEvents = recommendationEvents
                .filter(event =>
                    userPrefs.some(pref => pref.categoryId === event.categoryId) &&
                    event.recommendationType === 'PERSONALIZED'
                )
                .slice(0, count)
                .map(event => event.eventId);
        } else {
            // Fallback to technology events if no preferences
            personalizedEvents = recommendationEvents
                .filter(event => event.categoryId === 6)
                .slice(0, count)
                .map(event => event.eventId);
        }

        return formatResponse(personalizedEvents);
    },

    // Get similar events recommendations
    async getSimilarRecommendations(userId, count = 5) {
        await delay();

        const similarEvents = recommendationEvents
            .filter(event => event.recommendationType === 'SIMILAR_EVENTS')
            .slice(0, count)
            .map(event => event.eventId);

        return formatResponse(similarEvents);
    },

    // Get popular events
    async getPopularEvents(count = 5) {
        await delay();

        const popularEvents = recommendationEvents
            .filter(event => event.recommendationType === 'POPULAR')
            .sort((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, count)
            .map(event => event.eventId);

        return formatResponse(popularEvents);
    },

    // Get trending events
    async getTrendingEvents(count = 5) {
        await delay();

        const trendingEvents = recommendationEvents
            .filter(event => event.recommendationType === 'TRENDING')
            .slice(0, count)
            .map(event => event.eventId);

        return formatResponse(trendingEvents);
    },

    // Get location-based recommendations
    async getLocationBasedRecommendations(userId, count = 5) {
        await delay();

        const userPrefs = userPreferences.filter(p => p.userId == userId);
        let locationEvents = [];

        if (userPrefs.length > 0) {
            const preferredLocations = userPrefs
                .map(p => p.preferredLocation)
                .filter(Boolean);

            locationEvents = recommendationEvents
                .filter(event =>
                    preferredLocations.some(loc =>
                        event.location.includes(loc)
                    ) || event.recommendationType === 'LOCATION_BASED'
                )
                .slice(0, count)
                .map(event => event.eventId);
        } else {
            locationEvents = recommendationEvents
                .filter(event => event.recommendationType === 'LOCATION_BASED')
                .slice(0, count)
                .map(event => event.eventId);
        }

        return formatResponse(locationEvents);
    },

    // Get time-based recommendations
    async getTimeBasedRecommendations(userId, count = 5) {
        await delay();

        const timeEvents = recommendationEvents
            .filter(event => event.recommendationType === 'TIME_BASED')
            .slice(0, count)
            .map(event => event.eventId);

        return formatResponse(timeEvents);
    },

    // Get dashboard recommendations (convenience method)
    async getDashboardRecommendations(userId, count = 6) {
        await delay();

        // Mix different types of recommendations
        const personalizedEvents = recommendationEvents
            .filter(event => event.recommendationType === 'PERSONALIZED')
            .slice(0, 2);

        const popularEvents = recommendationEvents
            .filter(event => event.recommendationType === 'POPULAR')
            .slice(0, 2);

        const similarEvents = recommendationEvents
            .filter(event => event.recommendationType === 'SIMILAR_EVENTS')
            .slice(0, 2);

        const mixedRecommendations = [
            ...personalizedEvents,
            ...popularEvents,
            ...similarEvents
        ].slice(0, count);

        return formatResponse(mixedRecommendations);
    },

    // ========== User Activities ==========

    // Record user activity
    async recordActivity(activityData) {
        await delay();

        const newActivity = {
            ...activityData,
            timestamp: new Date().toISOString()
        };

        userActivities.push(newActivity);

        // Update user preferences based on activity
        if (activityData.activityType === 'RATE' && activityData.rating >= 4) {
            const event = recommendationEvents.find(e => e.eventId === activityData.eventId);
            if (event) {
                const existingPref = userPreferences.find(p =>
                    p.userId == activityData.userId && p.categoryId === event.categoryId
                );

                if (existingPref) {
                    existingPref.preferenceScore = Math.min(1.0, existingPref.preferenceScore + 0.1);
                } else {
                    userPreferences.push({
                        userId: parseInt(activityData.userId),
                        categoryId: event.categoryId,
                        preferenceScore: 0.7,
                        tags: event.tags,
                        preferredLocation: null,
                        preferredDayOfWeek: null,
                        preferredTimeOfDay: null
                    });
                }
            }
        }

        return formatResponse(newActivity);
    },

    // Get user activities
    async getUserActivities(userId) {
        await delay();

        const activities = userActivities.filter(a => a.userId == userId);
        return formatResponse(activities);
    },

    // Get user activities by type
    async getUserActivitiesByType(userId, activityType) {
        await delay();

        const activities = userActivities.filter(a =>
            a.userId == userId && a.activityType === activityType
        );
        return formatResponse(activities);
    },

    // Get event activities
    async getEventActivities(eventId) {
        await delay();

        const activities = userActivities.filter(a => a.eventId == eventId);
        return formatResponse(activities);
    },

    // Get event average rating
    async getEventAverageRating(eventId) {
        await delay();

        const ratings = userActivities
            .filter(a => a.eventId == eventId && a.activityType === 'RATE' && a.rating)
            .map(a => a.rating);

        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;

        return formatResponse({ averageRating: Math.round(averageRating * 10) / 10 });
    },

    // Get popular events by activity
    async getPopularEventsByActivity(activityType, limit = 10) {
        await delay();

        const eventCounts = {};
        userActivities
            .filter(a => a.activityType === activityType)
            .forEach(a => {
                eventCounts[a.eventId] = (eventCounts[a.eventId] || 0) + 1;
            });

        const popularEventIds = Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([eventId]) => parseInt(eventId));

        return formatResponse(popularEventIds);
    },

    // Get trending events by activity
    async getTrendingEventsByActivity(activityType, daysAgo = 7, limit = 10) {
        await delay();

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

        const recentActivities = userActivities.filter(a =>
            a.activityType === activityType &&
            new Date(a.timestamp) > cutoffDate
        );

        const eventCounts = {};
        recentActivities.forEach(a => {
            eventCounts[a.eventId] = (eventCounts[a.eventId] || 0) + 1;
        });

        const trendingEventIds = Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([eventId]) => parseInt(eventId));

        return formatResponse(trendingEventIds);
    },

    // ========== User Preferences ==========

    // Get user preferences
    async getUserPreferences(userId) {
        await delay();

        const preferences = userPreferences.filter(p => p.userId == userId);
        return formatResponse(preferences);
    },

    // Get user preference for category
    async getUserPreferenceForCategory(userId, categoryId) {
        await delay();

        const preference = userPreferences.find(p =>
            p.userId == userId && p.categoryId == categoryId
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

    // Update user preference
    async updateUserPreference(preferenceData) {
        await delay();

        const existingIndex = userPreferences.findIndex(p =>
            p.userId == preferenceData.userId && p.categoryId == preferenceData.categoryId
        );

        if (existingIndex >= 0) {
            userPreferences[existingIndex] = { ...userPreferences[existingIndex], ...preferenceData };
            return formatResponse(userPreferences[existingIndex]);
        } else {
            const newPreference = {
                userId: parseInt(preferenceData.userId),
                categoryId: parseInt(preferenceData.categoryId),
                preferenceScore: preferenceData.preferenceScore || 0.5,
                tags: preferenceData.tags || [],
                preferredLocation: preferenceData.preferredLocation || null,
                preferredDayOfWeek: preferenceData.preferredDayOfWeek || null,
                preferredTimeOfDay: preferenceData.preferredTimeOfDay || null
            };
            userPreferences.push(newPreference);
            return formatResponse(newPreference);
        }
    },

    // Get user preferences by tags
    async getUserPreferencesByTags(userId, tags) {
        await delay();

        const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
        const preferences = userPreferences.filter(p =>
            p.userId == userId &&
            p.tags &&
            p.tags.some(tag => tagsArray.includes(tag))
        );

        return formatResponse(preferences);
    },

    // Get favorite categories
    async getFavoriteCategories(userId, limit = 5) {
        await delay();

        const categoryIds = userPreferences
            .filter(p => p.userId == userId)
            .sort((a, b) => b.preferenceScore - a.preferenceScore)
            .slice(0, limit)
            .map(p => p.categoryId);

        return formatResponse(categoryIds);
    },

    // Find similar users
    async findSimilarUsers(userId, minSimilarityScore = 0.3) {
        await delay();

        // Simple mock implementation
        const similarUserIds = [2, 3, 4, 5]; // Mock similar user IDs
        return formatResponse(similarUserIds);
    },

    // Analyze user activity
    async analyzeUserActivity(userId) {
        await delay();

        const activities = userActivities.filter(a => a.userId == userId);
        const eventIds = [...new Set(activities.map(a => a.eventId))];

        const categoryScores = {};
        eventIds.forEach(eventId => {
            const event = recommendationEvents.find(e => e.eventId === eventId);
            if (event) {
                categoryScores[event.categoryId] = (categoryScores[event.categoryId] || 0) + 0.1;
            }
        });

        const analyzedPreferences = Object.entries(categoryScores).map(([categoryId, score]) => ({
            userId: parseInt(userId),
            categoryId: parseInt(categoryId),
            preferenceScore: Math.min(1.0, score),
            tags: [],
            preferredLocation: null,
            preferredDayOfWeek: null,
            preferredTimeOfDay: null
        }));

        return formatResponse(analyzedPreferences);
    }
};

export default mockRecommendationApi;