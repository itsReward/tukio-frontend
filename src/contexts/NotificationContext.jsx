import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { isAuthenticated, currentUser } = useAuth();

    // Load notifications from local storage on mount
    useEffect(() => {
        if (isAuthenticated && currentUser?.id) {
            const storedNotifications = localStorage.getItem(`notifications_${currentUser.id}`);
            if (storedNotifications) {
                const parsedNotifications = JSON.parse(storedNotifications);
                setNotifications(parsedNotifications);

                // Calculate unread count
                const unread = parsedNotifications.filter(notification => !notification.read).length;
                setUnreadCount(unread);
            }
        }
    }, [isAuthenticated, currentUser]);

    // Save notifications to local storage when they change
    useEffect(() => {
        if (isAuthenticated && currentUser?.id && notifications.length > 0) {
            localStorage.setItem(
                `notifications_${currentUser.id}`,
                JSON.stringify(notifications)
            );
        }
    }, [notifications, isAuthenticated, currentUser]);

    // Function to add a new notification
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast if notification is important
        if (notification.important) {
            toast(notification.message, {
                icon: notification.type === 'success' ? '✅' :
                    notification.type === 'error' ? '❌' :
                        notification.type === 'warning' ? '⚠️' : '📢',
            });
        }
    }, []);

    // Function to mark a notification as read
    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    // Function to mark all notifications as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    }, []);

    // Function to remove a notification
    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === notificationId);
            const isUnread = notification && !notification.read;

            if (isUnread) {
                setUnreadCount(count => Math.max(0, count - 1));
            }

            return prev.filter(notification => notification.id !== notificationId);
        });
    }, []);

    // Function to clear all notifications
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // Context value
    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
