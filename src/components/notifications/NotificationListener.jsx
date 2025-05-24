import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';

/**
 * Updated NotificationListener Component
 *
 * Handles real-time notifications using WebSocket connection
 * and provides fallback simulation for demo purposes
 */
const NotificationListener = () => {
    const { processNewNotification, wsConnection } = useNotifications();
    const { isAuthenticated, currentUser } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !currentUser?.id) return;

        // Check if we're in mock mode
        const isMockMode = localStorage.getItem('useMockApi') === 'true';

        if (isMockMode) {
            // In mock mode, the WebSocket connection will automatically simulate notifications
            // But we can also add some manual triggers for testing

            // Add a global function for testing notifications in development
            if (process.env.NODE_ENV === 'development') {
                window.triggerTestNotification = (type = 'EVENT_REMINDER') => {
                    const testNotifications = {
                        EVENT_REMINDER: {
                            title: 'Test Event Reminder',
                            content: 'This is a test reminder for an upcoming event.',
                            type: 'EVENT_REMINDER',
                            referenceId: '1',
                            referenceType: 'EVENT'
                        },
                        EVENT_REGISTRATION: {
                            title: 'Test Registration Confirmation',
                            content: 'Your test registration has been confirmed.',
                            type: 'EVENT_REGISTRATION',
                            referenceId: '2',
                            referenceType: 'EVENT'
                        },
                        EVENT_CANCELLATION: {
                            title: 'Test Event Cancellation',
                            content: 'A test event has been cancelled.',
                            type: 'EVENT_CANCELLATION',
                            referenceId: '3',
                            referenceType: 'EVENT'
                        },
                        VENUE_CHANGE: {
                            title: 'Test Venue Change',
                            content: 'The venue for a test event has been changed.',
                            type: 'VENUE_CHANGE',
                            referenceId: '4',
                            referenceType: 'EVENT'
                        },
                        SYSTEM_ANNOUNCEMENT: {
                            title: 'Test System Announcement',
                            content: 'This is a test system announcement.',
                            type: 'SYSTEM_ANNOUNCEMENT',
                            referenceId: null,
                            referenceType: null
                        }
                    };

                    if (wsConnection?.sendTestNotification) {
                        wsConnection.sendTestNotification(testNotifications[type] || testNotifications.EVENT_REMINDER);
                    }
                };

                // Log available test functions
                console.log('🔔 Notification testing functions available:');
                console.log('- triggerTestNotification("EVENT_REMINDER")');
                console.log('- triggerTestNotification("EVENT_REGISTRATION")');
                console.log('- triggerTestNotification("EVENT_CANCELLATION")');
                console.log('- triggerTestNotification("VENUE_CHANGE")');
                console.log('- triggerTestNotification("SYSTEM_ANNOUNCEMENT")');
            }

            // Simulate occasional notifications for demo purposes
            const simulatePeriodicNotification = () => {
                // Only simulate with 20% probability to avoid spam
                if (Math.random() < 0.2) {
                    const notificationTypes = [
                        'EVENT_REMINDER',
                        'EVENT_REGISTRATION',
                        'SYSTEM_ANNOUNCEMENT',
                        'EVENT_UPDATE'
                    ];

                    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

                    if (window.triggerTestNotification) {
                        window.triggerTestNotification(randomType);
                    }
                }
            };

            // Set up periodic simulation (every 3-7 minutes)
            const intervalTime = Math.floor(Math.random() * 240000) + 180000; // 3-7 minutes
            const simulationInterval = setInterval(simulatePeriodicNotification, intervalTime);

            return () => {
                clearInterval(simulationInterval);
                if (process.env.NODE_ENV === 'development') {
                    delete window.triggerTestNotification;
                }
            };
        } else {
            // In production mode, the WebSocket connection handles everything
            // Real-time notifications will come through the actual WebSocket
            console.log('Real-time notifications active via WebSocket');
        }

    }, [isAuthenticated, currentUser, wsConnection, processNewNotification]);

    // Listen for browser visibility changes to handle notification behavior
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
                // When tab becomes active, we could trigger a sync
                // This is handled in the NotificationContext
                console.log('Tab became active - notification sync may occur');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated]);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => {
            console.log('Connection restored - WebSocket will reconnect automatically');
        };

        const handleOffline = () => {
            console.log('Connection lost - notifications will be queued');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // This component doesn't render anything
    return null;
};

export default NotificationListener;