import React, { useEffect } from 'react';
import { useNotifications }  from '../../hooks/useNotifications.js';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component that listens for real-time notifications
 *
 * This is a placeholder that simulates real-time notifications.
 * In a production environment, this would use WebSockets or Server-Sent Events.
 */
const NotificationListener = () => {
    const { processNewNotification } = useNotifications();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;

        // This is a simple timer to simulate real-time notifications
        // In a real app, you would connect to a WebSocket or use Server-Sent Events
        const simulateInterval = Math.floor(Math.random() * 60000) + 30000; // Random interval between 30s and 90s

        const notificationTypes = ['info', 'success', 'warning', 'error'];
        const generateRandomNotification = () => {
            const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
            const id = Math.floor(Math.random() * 1000000).toString();

            // Sample notification templates
            const templates = {
                info: [
                    {
                        title: 'New event recommendation',
                        message: 'Based on your interests, we thought you might like the upcoming "Data Science Workshop" event.',
                        link: '/events'
                    },
                    {
                        title: 'Event reminder',
                        message: 'Your registered event "Campus Hackathon" starts in 24 hours.',
                        link: '/events/1'
                    }
                ],
                success: [
                    {
                        title: 'Points awarded',
                        message: 'You earned 50 points for attending "JavaScript Fundamentals Workshop".',
                        link: '/profile'
                    },
                    {
                        title: 'Badge unlocked',
                        message: 'Congratulations! You\'ve earned the "Event Explorer" badge.',
                        link: '/profile#badges'
                    }
                ],
                warning: [
                    {
                        title: 'Event capacity almost full',
                        message: 'The "Mobile App Development Workshop" is almost at capacity. Register soon to secure your spot!',
                        link: '/events/3'
                    },
                    {
                        title: 'Event time changed',
                        message: 'The "Campus Art Exhibition" has been rescheduled to 5:00 PM.',
                        link: '/events/4'
                    }
                ],
                error: [
                    {
                        title: 'Event cancelled',
                        message: 'The "Database Design Workshop" scheduled for tomorrow has been cancelled.',
                        link: null
                    },
                    {
                        title: 'Registration failed',
                        message: 'Your registration for "Cloud Computing Seminar" could not be processed. Please try again.',
                        link: '/events/5'
                    }
                ]
            };

            // Select a random template for the chosen type
            const template = templates[type][Math.floor(Math.random() * templates[type].length)];

            return {
                id,
                type,
                timestamp: new Date().toISOString(),
                read: false,
                important: Math.random() > 0.7, // 30% chance of being important
                ...template
            };
        };

        // Simulate a new notification on component mount
        // (but only with a 30% chance to avoid spamming)
        if (Math.random() < 0.3) {
            const initialDelay = Math.floor(Math.random() * 10000) + 5000; // Random delay between 5s and 15s
            const initialTimer = setTimeout(() => {
                processNewNotification(generateRandomNotification());
            }, initialDelay);

            return () => clearTimeout(initialTimer);
        }

        // Set up periodic interval for future notifications
        const intervalId = setInterval(() => {
            // Only show new notification with 30% probability to avoid spamming
            if (Math.random() < 0.3) {
                processNewNotification(generateRandomNotification());
            }
        }, simulateInterval);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, processNewNotification]);

    // This component doesn't render anything
    return null;
};

export default NotificationListener;

