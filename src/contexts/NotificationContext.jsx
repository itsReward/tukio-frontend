import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../services/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState([]);
    const [wsConnection, setWsConnection] = useState(null);
    const [connectionState, setConnectionState] = useState('disconnected');
    const { isAuthenticated, currentUser } = useAuth();

    // Initialize WebSocket connection when user authenticates
    useEffect(() => {
        if (isAuthenticated && currentUser?.id) {
            initializeConnection();
            fetchNotifications();
            fetchUnreadCount();
            fetchPreferences();
        } else {
            // Reset state when logged out
            cleanupConnection();
            setNotifications([]);
            setUnreadCount(0);
            setPreferences([]);
        }

        return () => {
            cleanupConnection();
        };
    }, [isAuthenticated, currentUser]);

    // Initialize WebSocket connection
    const initializeConnection = useCallback(() => {
        try {
            const connection = notificationService.initializeWebSocket(
                (notification) => {
                    processNewNotification(notification);
                },
                (state, data) => {
                    setConnectionState(state);
                    console.log('WebSocket state changed:', state, data);
                }
            );
            setWsConnection(connection);
        } catch (error) {
            console.error('Failed to initialize WebSocket connection:', error);
            setConnectionState('error');
        }
    }, []);

    // Cleanup WebSocket connection
    const cleanupConnection = useCallback(() => {
        if (wsConnection) {
            try {
                wsConnection.disconnect();
            } catch (error) {
                console.error('Error disconnecting WebSocket:', error);
            }
            setWsConnection(null);
        }
        setConnectionState('disconnected');
    }, [wsConnection]);

    // Poll for new notifications every minute (fallback for WebSocket)
    useEffect(() => {
        if (!isAuthenticated) return;

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        }, 60000); // 1 minute

        // Listen for visibility changes to update notifications when tab becomes active
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated]);

    // Function to fetch user notifications with enhanced options
    const fetchNotifications = useCallback(async (options = {}) => {
        if (!isAuthenticated || !currentUser?.id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await notificationService.getUserNotifications(currentUser.id, {
                page: 0,
                size: 10,
                channel: 'IN_APP', // Only fetch in-app notifications for the UI
                sort: 'createdAt,desc',
                ...options
            });

            setNotifications(prev => {
                if (options.page === 0 || !options.page) {
                    return response.data.content || [];
                } else {
                    return [...prev, ...(response.data.content || [])];
                }
            });
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentUser]);

    // Function to fetch unread notification count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated || !currentUser?.id) return;

        try {
            const response = await notificationService.getUnreadCount(currentUser.id);
            setUnreadCount(response.data.count || 0);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, [isAuthenticated, currentUser]);

    // Function to fetch notification preferences
    const fetchPreferences = useCallback(async () => {
        if (!isAuthenticated || !currentUser?.id) return;

        try {
            const response = await notificationService.getUserPreferences(currentUser.id);
            setPreferences(response.data || []);
        } catch (err) {
            console.error('Error fetching notification preferences:', err);
            // If preferences don't exist, initialize default ones
            try {
                await notificationService.initializeDefaultPreferences(currentUser.id);
                const newResponse = await notificationService.getUserPreferences(currentUser.id);
                setPreferences(newResponse.data || []);
            } catch (initError) {
                console.error('Error initializing default preferences:', initError);
            }
        }
    }, [isAuthenticated, currentUser]);

    // Function to mark a notification as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!currentUser?.id) return;

        try {
            await notificationService.markAsRead(notificationId, currentUser.id);

            // Update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, readAt: new Date().toISOString() }
                        : notification
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            toast.error('Failed to mark notification as read');
        }
    }, [currentUser]);

    // Function to delete a notification
    const deleteNotification = useCallback(async (notificationId) => {
        if (!currentUser?.id) return;

        try {
            await notificationService.deleteNotification(notificationId, currentUser.id);

            // Update local state
            setNotifications(prev => {
                const notification = prev.find(n => n.id === notificationId);
                const isUnread = notification && !notification.readAt;

                if (isUnread) {
                    setUnreadCount(count => Math.max(0, count - 1));
                }

                return prev.filter(notification => notification.id !== notificationId);
            });

            toast.success('Notification deleted');
        } catch (err) {
            console.error('Error deleting notification:', err);
            toast.error('Failed to delete notification');
        }
    }, [currentUser]);

    // Function to update notification preferences
    const updatePreferences = useCallback(async (notificationType, updatedPreferences) => {
        if (!currentUser?.id) return;

        try {
            const response = await notificationService.updatePreference(
                currentUser.id,
                notificationType,
                updatedPreferences
            );

            // Update local state
            setPreferences(prev =>
                prev.map(pref =>
                    pref.notificationType === notificationType
                        ? response.data
                        : pref
                )
            );

            toast.success('Notification preferences updated');
        } catch (err) {
            console.error('Error updating notification preferences:', err);
            toast.error('Failed to update notification preferences');
        }
    }, [currentUser]);

    // Function to update all preferences at once
    const updateAllPreferences = useCallback(async (preferencesArray) => {
        if (!currentUser?.id) return;

        try {
            const updatePromises = preferencesArray.map(pref =>
                notificationService.updatePreference(
                    currentUser.id,
                    pref.notificationType,
                    {
                        emailEnabled: pref.emailEnabled,
                        pushEnabled: pref.pushEnabled,
                        inAppEnabled: pref.inAppEnabled
                    }
                )
            );

            await Promise.all(updatePromises);

            // Refresh preferences from server
            await fetchPreferences();

            toast.success('All notification preferences updated');
        } catch (err) {
            console.error('Error updating all notification preferences:', err);
            toast.error('Failed to update notification preferences');
        }
    }, [currentUser, fetchPreferences]);

    // Process new notification - used for real-time notifications
    const processNewNotification = useCallback((notification) => {
        // Only process in-app notifications for the UI
        if (notification.channel !== 'IN_APP') return;

        // Add notification to state
        setNotifications(prev => [notification, ...prev]);

        // Update unread count if not read
        if (!notification.readAt) {
            setUnreadCount(prev => prev + 1);
        }

        // Show toast for important notifications
        const isImportant = ['EVENT_CANCELLATION', 'VENUE_CHANGE', 'SYSTEM_ANNOUNCEMENT'].includes(notification.notificationType);

        if (isImportant) {
            toast((t) => (
                <div className="flex items-start">
                    <div className="flex-grow">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm">{notification.content}</p>
                    </div>
                    <button
                        onClick={() => {
                            if (!notification.readAt) {
                                markAsRead(notification.id);
                            }
                            toast.dismiss(t.id);
                        }}
                        className="ml-4 text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            ), {
                duration: 8000,
                style: {
                    borderLeft: `4px solid ${getNotificationColor(notification.notificationType)}`,
                    padding: '16px'
                }
            });
        }
    }, [markAsRead]);

    // Get notification color based on type
    const getNotificationColor = useCallback((notificationType) => {
        switch (notificationType) {
            case 'EVENT_REGISTRATION':
                return '#10B981'; // success
            case 'EVENT_REMINDER':
                return '#3B82F6'; // info
            case 'EVENT_CANCELLATION':
                return '#EF4444'; // error
            case 'EVENT_UPDATE':
            case 'VENUE_CHANGE':
                return '#F59E0B'; // warning
            case 'SYSTEM_ANNOUNCEMENT':
                return '#8B5CF6'; // purple
            default:
                return '#3B82F6'; // info
        }
    }, []);

    // Helper function to get user preference for a specific notification type
    const getPreferenceForType = useCallback((notificationType) => {
        return preferences.find(pref => pref.notificationType === notificationType) || {
            notificationType,
            emailEnabled: true,
            pushEnabled: true,
            inAppEnabled: true
        };
    }, [preferences]);

    // Send notification helper (for admin/organizer use)
    const sendNotification = useCallback(async (notificationData) => {
        try {
            const response = await notificationService.createNotification(notificationData);
            toast.success('Notification sent successfully');
            return response;
        } catch (err) {
            console.error('Error sending notification:', err);
            toast.error('Failed to send notification');
            throw err;
        }
    }, []);

    // Context value
    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        preferences,
        wsConnection,
        connectionState,

        // Core functions
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        deleteNotification,

        // Preferences
        updatePreferences,
        updateAllPreferences,
        getPreferenceForType,

        // Real-time
        processNewNotification,

        // Admin/Organizer functions
        sendNotification,

        // Helper functions
        getNotificationColor
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the notification context
export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};