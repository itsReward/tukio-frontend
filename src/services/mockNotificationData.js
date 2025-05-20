// Generate a random ID
const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to generate a date in the past
const pastDate = (hoursAgo) => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date.toISOString();
};

// Mock notifications data
const mockNotifications = [
    {
        id: '1',
        title: 'Your event registration confirmed',
        message: 'You have successfully registered for "Introduction to Machine Learning Workshop". We look forward to seeing you there!',
        type: 'success',
        timestamp: pastDate(2),
        read: false,
        link: '/events/1',
        important: true
    },
    {
        id: '2',
        title: 'Event reminder: Annual Sports Day',
        message: 'Don\'t forget! The Annual Sports Day is tomorrow at 10:00 AM. Please arrive 15 minutes early to check in.',
        type: 'info',
        timestamp: pastDate(5),
        read: false,
        link: '/events/2',
        important: true
    },
    {
        id: '3',
        title: 'Event cancelled: Robotics Seminar',
        message: 'We regret to inform you that the Robotics Seminar scheduled for next week has been cancelled due to unforeseen circumstances.',
        type: 'error',
        timestamp: pastDate(12),
        read: true,
        link: '/events/5',
        important: true
    },
    {
        id: '4',
        title: 'New badge earned!',
        message: 'Congratulations! You\'ve earned the "Event Pioneer" badge for attending your first event.',
        type: 'success',
        timestamp: pastDate(24),
        read: true,
        link: '/profile#badges',
        important: false
    },
    {
        id: '5',
        title: 'Payment received',
        message: 'Your payment of $15.00 for the Career Fair 2025 event has been successfully processed.',
        type: 'success',
        timestamp: pastDate(36),
        read: true,
        link: null,
        important: false
    },
    {
        id: '6',
        title: 'Event location changed',
        message: 'The location for Cultural Night 2025 has been changed to Main Auditorium. Please update your calendar accordingly.',
        type: 'warning',
        timestamp: pastDate(48),
        read: false,
        link: '/events/4',
        important: true
    },
    {
        id: '7',
        title: 'New event recommendation',
        message: 'Based on your interests, we thought you might like the upcoming "Tech Workshop" event.',
        type: 'info',
        timestamp: pastDate(60),
        read: true,
        link: '/events/7',
        important: false
    },
    {
        id: '8',
        title: 'Your feedback matters',
        message: 'Please take a moment to rate your experience at the Career Fair 2025 event you attended yesterday.',
        type: 'info',
        timestamp: pastDate(72),
        read: false,
        link: '/events/3?feedback=true',
        important: false
    },
    {
        id: '9',
        title: 'Event registration deadline approaching',
        message: 'The registration deadline for the End of Semester Party is tomorrow. Don\'t miss out!',
        type: 'warning',
        timestamp: pastDate(80),
        read: true,
        link: '/events/6',
        important: false
    },
    {
        id: '10',
        title: 'System maintenance',
        message: 'Tukio will be undergoing maintenance this Saturday from 2:00 AM to 5:00 AM. Some features may be unavailable during this time.',
        type: 'warning',
        timestamp: pastDate(96),
        read: true,
        link: null,
        important: true
    },
    {
        id: '11',
        title: 'New feature announcement',
        message: 'We\'ve added a new feature to help you discover events based on your interests. Check it out on your dashboard!',
        type: 'info',
        timestamp: pastDate(120),
        read: true,
        link: '/dashboard',
        important: false
    },
    {
        id: '12',
        title: 'Password changed successfully',
        message: 'Your password was changed successfully. If you did not make this change, please contact support immediately.',
        type: 'success',
        timestamp: pastDate(144),
        read: true,
        link: null,
        important: true
    },
    {
        id: '13',
        title: 'Welcome to Tukio!',
        message: 'Welcome to Tukio, your centralized campus event management platform. Get started by browsing events and updating your profile.',
        type: 'info',
        timestamp: pastDate(180),
        read: true,
        link: '/events',
        important: true
    }
];

// Mock notification preferences
const mockPreferences = {
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    eventUpdates: true,
    eventCancellations: true,
    newMessages: true,
    systemAnnouncements: true,
    marketingCommunications: false
};

export { mockNotifications, mockPreferences };