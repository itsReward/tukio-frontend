// mockApi.js
// A service that simulates API responses using mock data
import mockData from './mockData';

// Add artificial delay to simulate network requests
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate error rate (for testing error handling)
const maybeError = (errorRate = 0) => {
    if (Math.random() < errorRate) {
        throw new Error('Simulated network error');
    }
};

// Format API response
const formatResponse = (data) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
});

// Generate a new ID for created entities
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Mock API service
 * Simulates API calls with mock data
 */
const mockApi = {
    // Auth Service
    async login(credentials) {
        await delay();
        maybeError(0.05);  // 5% error rate

        const user = mockData.users.find(
            u => u.username === credentials.username && credentials.password === 'password'
        );

        if (!user) {
            throw {
                response: {
                    data: { message: 'Invalid username or password' },
                    status: 401
                }
            };
        }

        return formatResponse({
            token: 'mock-jwt-token',
            userId: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles
        });
    },

    async register(userData) {
        await delay();
        maybeError(0.05);  // 5% error rate

        // Check if username already exists
        if (mockData.users.some(u => u.username === userData.username)) {
            throw {
                response: {
                    data: { message: 'Username already exists' },
                    status: 409
                }
            };
        }

        // Check if email already exists
        if (mockData.users.some(u => u.email === userData.email)) {
            throw {
                response: {
                    data: { message: 'Email already exists' },
                    status: 409
                }
            };
        }

        // Create new user (not actually saved in the mock data)
        const newUser = {
            id: generateId(),
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            department: userData.department || null,
            graduationYear: userData.graduationYear || null,
            interests: userData.interests || [],
            roles: ['USER', 'STUDENT'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return formatResponse(newUser);
    },

    async validateToken(token) {
        await delay();
        // Always valid in mock mode
        return formatResponse({ valid: true });
    },

    async getCurrentUser() {
        await delay();
        // Return the first user as the current user
        return formatResponse(mockData.users[0]);
    },

    async getUserById(userId) {
        await delay();
        const user = mockData.users.find(u => u.id === userId);

        if (!user) {
            throw {
                response: {
                    data: { message: 'User not found' },
                    status: 404
                }
            };
        }

        return formatResponse(user);
    },

    async updateUserProfile(userData) {
        await delay();
        // Find user in mock data
        const user = mockData.users.find(u => u.id === userData.id);

        if (!user) {
            throw {
                response: {
                    data: { message: 'User not found' },
                    status: 404
                }
            };
        }

        // Return updated user data (not actually saving changes)
        return formatResponse({
            ...user,
            ...userData,
            updatedAt: new Date().toISOString()
        });
    },

    // Event Service
    async getAllEvents() {
        await delay();
        return formatResponse(mockData.events);
    },

    async getEventById(id) {
        await delay();
        const event = mockData.events.find(e => e.id === id);

        if (!event) {
            throw {
                response: {
                    data: { message: 'Event not found' },
                    status: 404
                }
            };
        }

        return formatResponse(event);
    },

    async createEvent(eventData) {
        await delay();
        maybeError(0.05);  // 5% error rate

        const newEvent = {
            id: generateId(),
            ...eventData,
            currentRegistrations: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add category name if categoryId is provided
        if (eventData.categoryId) {
            const category = mockData.eventCategories.find(c => c.id === eventData.categoryId.toString());
            if (category) {
                newEvent.categoryName = category.name;
            }
        }

        // Add venue name if venueId is provided
        if (eventData.venueId) {
            const venue = mockData.venues.find(v => v.id === eventData.venueId.toString());
            if (venue) {
                newEvent.venueName = venue.name;
            }
        }

        return formatResponse(newEvent);
    },

    async updateEvent(id, eventData) {
        await delay();
        const event = mockData.events.find(e => e.id === id);

        if (!event) {
            throw {
                response: {
                    data: { message: 'Event not found' },
                    status: 404
                }
            };
        }

        return formatResponse({
            ...event,
            ...eventData,
            updatedAt: new Date().toISOString()
        });
    },

    async deleteEvent(id) {
        await delay();
        const event = mockData.events.find(e => e.id === id);

        if (!event) {
            throw {
                response: {
                    data: { message: 'Event not found' },
                    status: 404
                }
            };
        }

        return formatResponse({ success: true });
    },

    async searchEvents(criteria) {
        await delay();
        let filteredEvents = [...mockData.events];

        // Apply filters based on criteria
        if (criteria.keyword) {
            const keyword = criteria.keyword.toLowerCase();
            filteredEvents = filteredEvents.filter(
                event => event.title.toLowerCase().includes(keyword) ||
                    event.description.toLowerCase().includes(keyword)
            );
        }

        if (criteria.categoryId) {
            filteredEvents = filteredEvents.filter(
                event => event.categoryId === criteria.categoryId.toString()
            );
        }

        if (criteria.startFrom) {
            filteredEvents = filteredEvents.filter(
                event => new Date(event.startTime) >= new Date(criteria.startFrom)
            );
        }

        if (criteria.startTo) {
            filteredEvents = filteredEvents.filter(
                event => new Date(event.startTime) <= new Date(criteria.startTo)
            );
        }

        if (criteria.tags && criteria.tags.length > 0) {
            filteredEvents = filteredEvents.filter(
                event => criteria.tags.some(tag =>
                    event.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
                )
            );
        }

        if (criteria.status) {
            filteredEvents = filteredEvents.filter(
                event => event.status === criteria.status
            );
        }

        return formatResponse(filteredEvents);
    },

    async getUpcomingEvents() {
        await delay();
        const now = new Date();
        const upcomingEvents = mockData.events.filter(
            event => new Date(event.startTime) > now
        ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return formatResponse(upcomingEvents);
    },

    async getEventsByOrganizer(organizerId) {
        await delay();
        const events = mockData.events.filter(
            event => event.organizerId === organizerId
        );

        return formatResponse(events);
    },

    async getEventsByCategory(categoryId) {
        await delay();
        const events = mockData.events.filter(
            event => event.categoryId === categoryId
        );

        return formatResponse(events);
    },

    async getAllCategories() {
        await delay();
        return formatResponse(mockData.eventCategories);
    },

    async getCategoryById(id) {
        await delay();
        const category = mockData.eventCategories.find(c => c.id === id);

        if (!category) {
            throw {
                response: {
                    data: { message: 'Category not found' },
                    status: 404
                }
            };
        }

        return formatResponse(category);
    },

    // Event Registration
    async registerForEvent(registrationData) {
        await delay();
        maybeError(0.05);  // 5% error rate

        const event = mockData.events.find(e => e.id === registrationData.eventId.toString());

        if (!event) {
            throw {
                response: {
                    data: { message: 'Event not found' },
                    status: 404
                }
            };
        }

        // Check if event is full
        if (event.currentRegistrations >= event.maxParticipants) {
            throw {
                response: {
                    data: { message: 'Event is full' },
                    status: 409
                }
            };
        }

        const newRegistration = {
            id: generateId(),
            eventId: registrationData.eventId.toString(),
            eventTitle: event.title,
            userId: registrationData.userId?.toString() || null,
            userName: registrationData.userName,
            userEmail: registrationData.userEmail,
            status: 'REGISTERED',
            checkInTime: null,
            feedback: null,
            rating: null,
            registrationTime: new Date().toISOString(),
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location || event.venueName
        };

        return formatResponse(newRegistration);
    },

    async getRegistrationsByUser(userId) {
        await delay();
        const registrations = mockData.eventRegistrations.filter(
            reg => reg.userId === userId.toString()
        );

        return formatResponse(registrations);
    },

    async getRegistrationsByEvent(eventId) {
        await delay();
        const registrations = mockData.eventRegistrations.filter(
            reg => reg.eventId === eventId.toString()
        );

        return formatResponse(registrations);
    },

    // Venue Service
    async getAllVenues() {
        await delay();
        return formatResponse(mockData.venues);
    },

    async getVenueById(id) {
        await delay();
        const venue = mockData.venues.find(v => v.id === id);

        if (!venue) {
            throw {
                response: {
                    data: { message: 'Venue not found' },
                    status: 404
                }
            };
        }

        return formatResponse(venue);
    },

    async createVenue(venueData) {
        await delay();
        maybeError(0.05);  // 5% error rate

        const newVenue = {
            id: generateId(),
            ...venueData,
            availabilityStatus: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return formatResponse(newVenue);
    },

    // Gamification Service
    async getUserGamificationProfile(userId) {
        await delay();
        const user = mockData.users.find(u => u.id === userId.toString());

        if (!user) {
            throw {
                response: {
                    data: { message: 'User not found' },
                    status: 404
                }
            };
        }

        const points = mockData.points[userId.toString()] || {
            totalPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            currentLevel: 1,
            currentLevelPoints: 0,
            pointsToNextLevel: 100,
            levelProgress: 0
        };

        const badges = mockData.userBadges.filter(
            badge => badge.userId === userId.toString()
        );

        return formatResponse({
            userId: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePictureUrl: user.profilePictureUrl,
            totalPoints: points.totalPoints,
            level: points.currentLevel,
            levelProgress: points.levelProgress,
            badges: badges
        });
    },

    async getUserPoints(userId) {
        await delay();
        return formatResponse(mockData.points[userId.toString()] || {
            userId,
            totalPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            currentLevel: 1,
            currentLevelPoints: 0,
            pointsToNextLevel: 100,
            levelProgress: 0
        });
    },

    async getUserTransactions(userId, page = 0, size = 10) {
        await delay();
        const transactions = mockData.transactions[userId.toString()] || [];

        // Paginate results
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedTransactions = transactions.slice(startIndex, endIndex);

        return formatResponse({
            content: paginatedTransactions,
            page: page,
            size: size,
            totalElements: transactions.length,
            totalPages: Math.ceil(transactions.length / size)
        });
    },

    async getAllBadges() {
        await delay();
        return formatResponse(mockData.badges);
    },

    async getUserBadges(userId) {
        await delay();
        const userBadges = mockData.userBadges.filter(
            badge => badge.userId === userId.toString()
        );

        return formatResponse(userBadges);
    },

    async getRecentUserBadges(userId, limit = 5) {
        await delay();
        const userBadges = mockData.userBadges.filter(
            badge => badge.userId === userId.toString()
        ).sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
            .slice(0, limit);

        return formatResponse(userBadges);
    },

    async getUserActivityStats(userId) {
        await delay();
        const points = mockData.points[userId.toString()] || {
            totalPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            currentLevel: 1
        };

        const badges = mockData.userBadges.filter(
            badge => badge.userId === userId.toString()
        ).length;

        const transactions = mockData.transactions[userId.toString()] || [];

        return formatResponse({
            totalPoints: points.totalPoints,
            currentLevel: points.currentLevel,
            badgesEarned: badges,
            totalActivities: transactions.length,
            averageRating: 4.5,  // Mock average rating
            recentActivities: transactions.slice(0, 5).sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            )
        });
    },

    async getTopUsersWeekly(limit = 10) {
        await delay();
        return formatResponse(mockData.leaderboard.slice(0, limit));
    },

    async getTopUsersMonthly(limit = 10) {
        await delay();
        return formatResponse(mockData.leaderboard.slice(0, limit));
    },

    async getTopUsersAllTime(limit = 10) {
        await delay();
        return formatResponse(mockData.leaderboard.slice(0, limit));
    },

    // Record gamification events
    async recordEventRegistration(userId, eventId) {
        await delay();
        return formatResponse({ success: true, points: 10 });
    },

    async recordEventAttendance(userId, eventId) {
        await delay();
        return formatResponse({ success: true, points: 20 });
    },

    async recordEventRating(userId, eventId, rating) {
        await delay();
        return formatResponse({ success: true, points: 5 });
    },

    async recordEventSharing(userId, eventId) {
        await delay();
        return formatResponse({ success: true, points: 5 });
    }
};

export default mockApi;