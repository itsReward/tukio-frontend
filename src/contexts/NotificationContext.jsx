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
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        eventReminders: true,
        eventUpdates: true,
        eventCancellations: true,
        newMessages: true,
        systemAnnouncements: true,
        marketingCommunications: false
    });
    const { isAuthenticated, currentUser } = useAuth();

    // Fetch notifications when user authenticates
    useEffect(() => {
        if (isAuthenticated && currentUser?.id) {
            fetchNotifications();
            fetchUnreadCount();
            fetchPreferences();
        } else {
            // Reset state when logged out
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, currentUser]);

    // Poll for new notifications every minute
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

    // Function to fetch user notifications
    const fetchNotifications = useCallback(async (page = 0, size = 10) => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getUserNotifications(page, size);
            setNotifications(prev => {
                if (page === 0) {
                    return response.data.content;
                } else {
                    return [...prev, ...response.data.content];
                }
            });
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Function to fetch unread notification count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, [isAuthenticated]);

    // Function to fetch notification preferences
    const fetchPreferences = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const response = await notificationService.getNotificationPreferences();
            setPreferences(response.data);
        } catch (err) {
            console.error('Error fetching notification preferences:', err);
        }
    }, [isAuthenticated]);

    // Function to mark a notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            toast.error('Failed to mark notification as read');
        }
    }, []);

    // Function to mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );

            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            toast.error('Failed to mark all notifications as read');
        }
    }, []);

    // Function to delete a notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            // Update local state
            setNotifications(prev => {
                const notification = prev.find(n => n.id === notificationId);
                const isUnread = notification && !notification.read;

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
    }, []);

    // Function to clear all notifications
    const clearAllNotifications = useCallback(async () => {
        try {
            await notificationService.clearAllNotifications();

            // Update local state
            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications cleared');
        } catch (err) {
            console.error('Error clearing notifications:', err);
            toast.error('Failed to clear notifications');
        }
    }, []);

    // Function to update notification preferences
    const updatePreferences = useCallback(async (updatedPreferences) => {
        try {
            await notificationService.updatePreferences(updatedPreferences);
            setPreferences(updatedPreferences);
            toast.success('Notification preferences updated');
        } catch (err) {
            console.error('Error updating notification preferences:', err);
            toast.error('Failed to update notification preferences');
        }
    }, []);

    // Function to subscribe to event notifications
    const subscribeToEvent = useCallback(async (eventId) => {
        try {
            await notificationService.subscribeToEvent(eventId);
            toast.success('Subscribed to event notifications');
        } catch (err) {
            console.error('Error subscribing to event:', err);
            toast.error('Failed to subscribe to event notifications');
        }
    }, []);

    // Function to unsubscribe from event notifications
    const unsubscribeFromEvent = useCallback(async (eventId) => {
        try {
            await notificationService.unsubscribeFromEvent(eventId);
            toast.success('Unsubscribed from event notifications');
        } catch (err) {
            console.error('Error unsubscribing from event:', err);
            toast.error('Failed to unsubscribe from event notifications');
        }
    }, []);

    // Process new notification - used for real-time notifications
    const processNewNotification = useCallback((notification) => {
        // Add notification to state
        setNotifications(prev => [notification, ...prev]);

        // Update unread count
        if (!notification.read) {
            setUnreadCount(prev => prev + 1);
        }

        // Show toast for important notifications
        if (notification.important) {
            toast((t) => (
                <div className="flex items-start">
                    <div className="flex-grow">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => {
                            markAsRead(notification.id);
                            toast.dismiss(t.id);
                        }}
                        className="ml-4 text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            ), {
                duration: 5000,
                style: {
                    borderLeft: `4px solid ${
                        notification.type === 'success' ? '#10B981' :
                            notification.type === 'warning' ? '#F59E0B' :
                                notification.type === 'error' ? '#EF4444' : '#3B82F6'
                    }`,
                    padding: '16px'
                }
            });
        }
    }, [markAsRead]);

    // Context value
    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        preferences,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        updatePreferences,
        subscribeToEvent,
        unsubscribeFromEvent,
        processNewNotification
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