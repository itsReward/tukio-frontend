// mockData.js
// Contains mock data for all entities in the application

// Generate a random ID
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to generate a date in the past
const pastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

// Helper to generate a date in the future
const futureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString();
};

// User data
const users = [
    {
        id: '1',
        username: 'johndoe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profilePictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'Computer science student with a passion for AI and machine learning.',
        department: 'Computer Science',
        graduationYear: 2026,
        createdAt: pastDate(180),
        updatedAt: pastDate(30),
        interests: ['technology', 'programming', 'ai', 'gaming'],
        roles: ['USER', 'STUDENT']
    },
    {
        id: '2',
        username: 'janedoe',
        email: 'jane.doe@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        profilePictureUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        bio: 'Engineering student focusing on robotics and IoT.',
        department: 'Engineering',
        graduationYear: 2025,
        createdAt: pastDate(220),
        updatedAt: pastDate(45),
        interests: ['robotics', 'iot', 'engineering', 'design'],
        roles: ['USER', 'STUDENT']
    },
    {
        id: '3',
        username: 'alice_smith',
        email: 'alice.smith@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        profilePictureUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        bio: 'Business major with interests in entrepreneurship and finance.',
        department: 'Business',
        graduationYear: 2024,
        createdAt: pastDate(300),
        updatedAt: pastDate(20),
        interests: ['finance', 'entrepreneurship', 'marketing', 'economics'],
        roles: ['USER', 'STUDENT']
    },
    {
        id: '4',
        username: 'bob_johnson',
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        profilePictureUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        bio: 'Physics student researching quantum computing applications.',
        department: 'Science',
        graduationYear: 2025,
        createdAt: pastDate(250),
        updatedAt: pastDate(15),
        interests: ['physics', 'quantum computing', 'research', 'astronomy'],
        roles: ['USER', 'STUDENT']
    },
    {
        id: '5',
        username: 'prof_williams',
        email: 'prof.williams@example.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        profilePictureUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
        bio: 'Professor in Computer Science with research in distributed systems.',
        department: 'Computer Science',
        createdAt: pastDate(500),
        updatedAt: pastDate(100),
        interests: ['distributed systems', 'education', 'research', 'technology'],
        roles: ['USER', 'FACULTY']
    }
];

// Event categories
const eventCategories = [
    {
        id: '1',
        name: 'Academic',
        description: 'Academic events including lectures, seminars, and workshops'
    },
    {
        id: '2',
        name: 'Social',
        description: 'Social gatherings and networking events'
    },
    {
        id: '3',
        name: 'Cultural',
        description: 'Events celebrating diverse cultures and traditions'
    },
    {
        id: '4',
        name: 'Sports',
        description: 'Sporting events and competitions'
    },
    {
        id: '5',
        name: 'Career',
        description: 'Job fairs, career counseling, and professional development'
    },
    {
        id: '6',
        name: 'Technology',
        description: 'Tech talks, hackathons, and coding competitions'
    }
];

// Venues
const venues = [
    {
        id: '1',
        name: 'Main Auditorium',
        location: 'Main Campus, Building A',
        capacity: 500,
        type: 'AUDITORIUM',
        description: 'Large auditorium with state-of-the-art AV equipment and stage.',
        availabilityStatus: true,
        building: 'Building A',
        floor: '1',
        isAccessible: true,
        amenities: ['Projector', 'Sound System', 'Stage', 'Wheelchair Access', 'Air Conditioning'],
        imageUrl: 'https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
        id: '2',
        name: 'Science Lab 101',
        location: 'Science Building, Room 101',
        capacity: 30,
        type: 'LAB',
        description: 'Fully equipped laboratory for scientific experiments and demonstrations.',
        availabilityStatus: true,
        building: 'Science Building',
        floor: '1',
        isAccessible: true,
        amenities: ['Lab Equipment', 'Whiteboard', 'Projector', 'Computers', 'Safety Equipment'],
        imageUrl: 'https://images.unsplash.com/photo-1566386547900-7238e8a7f7d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
        id: '3',
        name: 'Conference Room A',
        location: 'Admin Building, Room 304',
        capacity: 50,
        type: 'CONFERENCE_ROOM',
        description: 'Professional conference room with modern facilities.',
        availabilityStatus: true,
        building: 'Admin Building',
        floor: '3',
        isAccessible: true,
        amenities: ['Video Conferencing', 'Whiteboard', 'Projector', 'Coffee Machine', 'Air Conditioning'],
        imageUrl: 'https://images.unsplash.com/photo-1503071866712-d54e8c647c19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
        id: '4',
        name: 'Sports Complex',
        location: 'East Campus',
        capacity: 1000,
        type: 'SPORTS_FACILITY',
        description: 'Multi-purpose sports facility with indoor and outdoor sections.',
        availabilityStatus: true,
        building: 'Sports Complex',
        floor: '1',
        isAccessible: true,
        amenities: ['Basketball Court', 'Tennis Court', 'Swimming Pool', 'Changing Rooms', 'Bleachers'],
        imageUrl: 'https://images.unsplash.com/photo-1544621113-a649f857b185?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    },
    {
        id: '5',
        name: 'Lecture Hall B',
        location: 'Main Campus, Building B, Room 202',
        capacity: 150,
        type: 'LECTURE_HALL',
        description: 'Medium-sized lecture hall with tiered seating.',
        availabilityStatus: true,
        building: 'Building B',
        floor: '2',
        isAccessible: true,
        amenities: ['Projector', 'Sound System', 'Tiered Seating', 'Whiteboard', 'Air Conditioning'],
        imageUrl: 'https://images.unsplash.com/photo-1519070994522-88c6b756330e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
    }
];

// Events
const events = [
    {
        id: '1',
        title: 'Introduction to Machine Learning Workshop',
        description: 'A beginner-friendly workshop covering the basics of machine learning with practical examples.',
        categoryId: '6',
        categoryName: 'Technology',
        startTime: futureDate(7),
        endTime: futureDate(7, 3), // 3 hours later
        location: 'Main Campus, Building A',
        venueId: '1',
        venueName: 'Main Auditorium',
        maxParticipants: 200,
        organizer: 'CS Department',
        organizerId: '5',
        imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['technology', 'machine learning', 'workshop', 'beginner'],
        status: 'SCHEDULED',
        currentRegistrations: 120,
        createdAt: pastDate(30),
        updatedAt: pastDate(15)
    },
    {
        id: '2',
        title: 'Annual Sports Day',
        description: 'A day full of various sporting events and competitions. Open to all students and faculty.',
        categoryId: '4',
        categoryName: 'Sports',
        startTime: futureDate(14),
        endTime: futureDate(14, 8), // 8 hours later
        location: 'East Campus',
        venueId: '4',
        venueName: 'Sports Complex',
        maxParticipants: 500,
        organizer: 'Student Athletics Association',
        organizerId: '3',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['sports', 'competition', 'athletics', 'outdoor'],
        status: 'SCHEDULED',
        currentRegistrations: 350,
        createdAt: pastDate(60),
        updatedAt: pastDate(45)
    },
    {
        id: '3',
        title: 'Career Fair 2025',
        description: 'Meet recruiters from top companies in various industries. Bring your resume and business attire.',
        categoryId: '5',
        categoryName: 'Career',
        startTime: futureDate(21),
        endTime: futureDate(21, 6), // 6 hours later
        location: 'Main Campus, Building A',
        venueId: '1',
        venueName: 'Main Auditorium',
        maxParticipants: 300,
        organizer: 'Career Services',
        organizerId: '2',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['career', 'jobs', 'networking', 'professional'],
        status: 'SCHEDULED',
        currentRegistrations: 200,
        createdAt: pastDate(90),
        updatedAt: pastDate(30)
    },
    {
        id: '4',
        title: 'Cultural Night 2025',
        description: 'Celebrating diversity with performances, food, and exhibits from various cultures.',
        categoryId: '3',
        categoryName: 'Cultural',
        startTime: futureDate(10),
        endTime: futureDate(10, 4), // 4 hours later
        location: 'Main Campus, Building A',
        venueId: '1',
        venueName: 'Main Auditorium',
        maxParticipants: 400,
        organizer: 'Cultural Association',
        organizerId: '4',
        imageUrl: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['culture', 'diversity', 'performances', 'food'],
        status: 'SCHEDULED',
        currentRegistrations: 280,
        createdAt: pastDate(45),
        updatedAt: pastDate(20)
    },
    {
        id: '5',
        title: 'Robotics Seminar',
        description: 'Latest advances in robotics technology and their applications in various fields.',
        categoryId: '6',
        categoryName: 'Technology',
        startTime: futureDate(5),
        endTime: futureDate(5, 2), // 2 hours later
        location: 'Science Building, Room 101',
        venueId: '2',
        venueName: 'Science Lab 101',
        maxParticipants: 30,
        organizer: 'Robotics Club',
        organizerId: '1',
        imageUrl: 'https://images.unsplash.com/photo-1524069290683-731442ca3344?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['robotics', 'technology', 'engineering', 'seminar'],
        status: 'SCHEDULED',
        currentRegistrations: 25,
        createdAt: pastDate(20),
        updatedAt: pastDate(10)
    },
    {
        id: '6',
        title: 'End of Semester Party',
        description: 'Celebrate the end of the semester with music, games, and refreshments.',
        categoryId: '2',
        categoryName: 'Social',
        startTime: futureDate(28),
        endTime: futureDate(28, 5), // 5 hours later
        location: 'Student Center',
        venueId: null,
        venueName: null,
        maxParticipants: 200,
        organizer: 'Student Government',
        organizerId: '3',
        imageUrl: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        tags: ['party', 'social', 'music', 'games'],
        status: 'SCHEDULED',
        currentRegistrations: 180,
        createdAt: pastDate(30),
        updatedAt: pastDate(15)
    }
];

// Event registrations
const eventRegistrations = [
    {
        id: '1',
        eventId: '1',
        eventTitle: 'Introduction to Machine Learning Workshop',
        userId: '1',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        status: 'REGISTERED',
        checkInTime: null,
        feedback: null,
        rating: null,
        registrationTime: pastDate(7),
        startTime: futureDate(7),
        endTime: futureDate(7, 3),
        location: 'Main Auditorium'
    },
    {
        id: '2',
        eventId: '2',
        eventTitle: 'Annual Sports Day',
        userId: '1',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        status: 'REGISTERED',
        checkInTime: null,
        feedback: null,
        rating: null,
        registrationTime: pastDate(10),
        startTime: futureDate(14),
        endTime: futureDate(14, 8),
        location: 'Sports Complex'
    },
    {
        id: '3',
        eventId: '5',
        eventTitle: 'Robotics Seminar',
        userId: '1',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        status: 'REGISTERED',
        checkInTime: null,
        feedback: null,
        rating: null,
        registrationTime: pastDate(3),
        startTime: futureDate(5),
        endTime: futureDate(5, 2),
        location: 'Science Lab 101'
    },
    {
        id: '4',
        eventId: '4',
        eventTitle: 'Cultural Night 2025',
        userId: '2',
        userName: 'Jane Doe',
        userEmail: 'jane.doe@example.com',
        status: 'REGISTERED',
        checkInTime: null,
        feedback: null,
        rating: null,
        registrationTime: pastDate(5),
        startTime: futureDate(10),
        endTime: futureDate(10, 4),
        location: 'Main Auditorium'
    },
    {
        id: '5',
        eventId: '3',
        eventTitle: 'Career Fair 2025',
        userId: '2',
        userName: 'Jane Doe',
        userEmail: 'jane.doe@example.com',
        status: 'REGISTERED',
        checkInTime: null,
        feedback: null,
        rating: null,
        registrationTime: pastDate(15),
        startTime: futureDate(21),
        endTime: futureDate(21, 6),
        location: 'Main Auditorium'
    }
];

// Badges
const badges = [
    {
        id: '1',
        name: 'Event Pioneer',
        description: 'Attended your first event',
        imageUrl: '/assets/images/badges/event-pioneer.svg',
        category: 'ATTENDANCE',
        tier: 'BRONZE'
    },
    {
        id: '2',
        name: 'Feedback Provider',
        description: 'Provided feedback for 5 events',
        imageUrl: '/assets/images/badges/feedback-provider.svg',
        category: 'RATING',
        tier: 'SILVER'
    },
    {
        id: '3',
        name: 'Event Explorer',
        description: 'Attended events from 3 different categories',
        imageUrl: '/assets/images/badges/event-explorer.svg',
        category: 'DIVERSITY',
        tier: 'SILVER'
    },
    {
        id: '4',
        name: 'Social Butterfly',
        description: 'Invited 10 friends to events',
        imageUrl: '/assets/images/badges/social-butterfly.svg',
        category: 'SOCIAL',
        tier: 'GOLD'
    },
    {
        id: '5',
        name: 'Event Maestro',
        description: 'Organized 5 successful events',
        imageUrl: '/assets/images/badges/event-maestro.svg',
        category: 'ORGANIZATION',
        tier: 'PLATINUM'
    }
];

// User badges
const userBadges = [
    {
        id: '1',
        userId: '1',
        badge: badges[0],
        awardedAt: pastDate(45),
        eventId: '3'
    },
    {
        id: '2',
        userId: '1',
        badge: badges[2],
        awardedAt: pastDate(30),
        eventId: '2'
    },
    {
        id: '3',
        userId: '2',
        badge: badges[0],
        awardedAt: pastDate(60),
        eventId: '3'
    },
    {
        id: '4',
        userId: '2',
        badge: badges[1],
        awardedAt: pastDate(40),
        eventId: '4'
    },
    {
        id: '5',
        userId: '3',
        badge: badges[4],
        awardedAt: pastDate(20),
        eventId: '1'
    }
];

// Gamification data
const points = {
    '1': {
        userId: '1',
        totalPoints: 450,
        weeklyPoints: 50,
        monthlyPoints: 120,
        currentLevel: 3,
        currentLevelPoints: 70,
        pointsToNextLevel: 30,
        levelProgress: 0.7
    },
    '2': {
        userId: '2',
        totalPoints: 680,
        weeklyPoints: 80,
        monthlyPoints: 200,
        currentLevel: 4,
        currentLevelPoints: 80,
        pointsToNextLevel: 20,
        levelProgress: 0.8
    },
    '3': {
        userId: '3',
        totalPoints: 820,
        weeklyPoints: 100,
        monthlyPoints: 300,
        currentLevel: 5,
        currentLevelPoints: 20,
        pointsToNextLevel: 80,
        levelProgress: 0.2
    },
    '4': {
        userId: '4',
        totalPoints: 350,
        weeklyPoints: 30,
        monthlyPoints: 100,
        currentLevel: 2,
        currentLevelPoints: 50,
        pointsToNextLevel: 50,
        levelProgress: 0.5
    },
    '5': {
        userId: '5',
        totalPoints: 1200,
        weeklyPoints: 150,
        monthlyPoints: 400,
        currentLevel: 8,
        currentLevelPoints: 0,
        pointsToNextLevel: 100,
        levelProgress: 0
    }
};

// Transactions (for activity feed)
const transactions = {
    '1': [
        {
            id: '1',
            userId: '1',
            activityType: 'EVENT_REGISTRATION',
            description: 'Registered for Introduction to Machine Learning Workshop',
            points: 10,
            timestamp: pastDate(7),
            eventId: '1'
        },
        {
            id: '2',
            userId: '1',
            activityType: 'EVENT_REGISTRATION',
            description: 'Registered for Annual Sports Day',
            points: 10,
            timestamp: pastDate(10),
            eventId: '2'
        },
        {
            id: '3',
            userId: '1',
            activityType: 'BADGE_EARNED',
            description: 'Earned the Event Pioneer badge',
            points: 50,
            timestamp: pastDate(45),
            eventId: null
        },
        {
            id: '4',
            userId: '1',
            activityType: 'EVENT_REGISTRATION',
            description: 'Registered for Robotics Seminar',
            points: 10,
            timestamp: pastDate(3),
            eventId: '5'
        },
        {
            id: '5',
            userId: '1',
            activityType: 'BADGE_EARNED',
            description: 'Earned the Event Explorer badge',
            points: 100,
            timestamp: pastDate(30),
            eventId: null
        }
    ],
    '2': [
        {
            id: '6',
            userId: '2',
            activityType: 'EVENT_REGISTRATION',
            description: 'Registered for Cultural Night 2025',
            points: 10,
            timestamp: pastDate(5),
            eventId: '4'
        },
        {
            id: '7',
            userId: '2',
            activityType: 'EVENT_REGISTRATION',
            description: 'Registered for Career Fair 2025',
            points: 10,
            timestamp: pastDate(15),
            eventId: '3'
        },
        {
            id: '8',
            userId: '2',
            activityType: 'BADGE_EARNED',
            description: 'Earned the Event Pioneer badge',
            points: 50,
            timestamp: pastDate(60),
            eventId: null
        },
        {
            id: '9',
            userId: '2',
            activityType: 'BADGE_EARNED',
            description: 'Earned the Feedback Provider badge',
            points: 100,
            timestamp: pastDate(40),
            eventId: null
        },
        {
            id: '10',
            userId: '2',
            activityType: 'EVENT_RATING',
            description: 'Rated Career Fair 2025',
            points: 5,
            timestamp: pastDate(2),
            eventId: '3'
        }
    ]
};

// Leaderboard data
const leaderboard = [
    {
        id: '1',
        rank: 1,
        userId: '5',
        username: 'prof_williams',
        firstName: 'Sarah',
        lastName: 'Williams',
        profilePictureUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
        score: 1200,
        rankChange: 0
    },
    {
        id: '2',
        rank: 2,
        userId: '3',
        username: 'alice_smith',
        firstName: 'Alice',
        lastName: 'Smith',
        profilePictureUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        score: 820,
        rankChange: 1
    },
    {
        id: '3',
        rank: 3,
        userId: '2',
        username: 'janedoe',
        firstName: 'Jane',
        lastName: 'Doe',
        profilePictureUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        score: 680,
        rankChange: -1
    },
    {
        id: '4',
        rank: 4,
        userId: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        profilePictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        score: 450,
        rankChange: 0
    },
    {
        id: '5',
        rank: 5,
        userId: '4',
        username: 'bob_johnson',
        firstName: 'Bob',
        lastName: 'Johnson',
        profilePictureUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        score: 350,
        rankChange: 0
    }
];

// Export all mock data
export default {
    users,
    eventCategories,
    venues,
    events,
    eventRegistrations,
    badges,
    userBadges,
    points,
    transactions,
    leaderboard
};