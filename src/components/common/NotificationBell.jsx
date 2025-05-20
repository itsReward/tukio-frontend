import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon, TrashIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { format, formatDistance } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationBell = () => {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        fetchNotifications
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Load notifications when menu is opened
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(0, 5);
        }
    }, [isOpen, fetchNotifications]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get relative time
    const getRelativeTime = (date) => {
        try {
            return formatDistance(new Date(date), new Date(), { addSuffix: true });
        } catch (error) {
            console.error('Date formatting error:', error);
            return date;
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Close the menu
        setIsOpen(false);

        // If there's a link, the actual navigation will be handled by the Link component
    };

    // Get icon and color based on notification type
    const getNotificationStyles = (type) => {
        switch(type) {
            case 'success':
                return {
                    bgColor: 'bg-success-100',
                    textColor: 'text-success-800',
                    icon: CheckIcon
                };
            case 'warning':
                return {
                    bgColor: 'bg-warning-100',
                    textColor: 'text-warning-800',
                    icon: BellIcon
                };
            case 'error':
                return {
                    bgColor: 'bg-accent-100',
                    textColor: 'text-accent-800',
                    icon: BellSlashIcon
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-primary-100',
                    textColor: 'text-primary-800',
                    icon: BellIcon
                };
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="relative rounded-full p-1 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <Transition
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="absolute right-0 mt-2 w-80 md:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-4 border-b border-neutral-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
                            <div className="flex space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllAsRead();
                                        }}
                                        className="text-sm text-primary-600 hover:text-primary-800"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearAllNotifications();
                                    }}
                                    className="text-sm text-neutral-600 hover:text-neutral-800"
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-neutral-600">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100">
                                    <BellSlashIcon className="h-6 w-6 text-neutral-500" />
                                </div>
                                <p className="mt-2 text-neutral-600">No notifications</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-200">
                                {notifications.map((notification) => {
                                    const { bgColor, textColor, icon: NotificationIcon } = getNotificationStyles(notification.type);

                                    const NotificationContent = (
                                        <div
                                            className={`px-4 py-3 transition-colors duration-200 ${notification.read ? 'bg-white' : 'bg-neutral-50'}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start">
                                                <div className={`flex-shrink-0 h-9 w-9 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
                                                    <NotificationIcon className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {notification.title}
                                                    </div>
                                                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <span className="text-xs text-neutral-500">
                                                            {getRelativeTime(notification.timestamp)}
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification.id);
                                                                    }}
                                                                    className="text-xs text-primary-600 hover:text-primary-800"
                                                                >
                                                                    Mark as read
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="text-xs text-neutral-500 hover:text-neutral-700"
                                                            >
                                                                <TrashIcon className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    // Wrap in Link if the notification has a link
                                    return (
                                        <li key={notification.id}>
                                            {notification.link ? (
                                                <Link to={notification.link} className="block hover:bg-neutral-50">
                                                    {NotificationContent}
                                                </Link>
                                            ) : (
                                                NotificationContent
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="p-2 border-t border-neutral-200 bg-neutral-50">
                        <Link
                            to="/notifications"
                            className="block w-full text-center py-2 px-4 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-neutral-100 rounded-md"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

export default NotificationBell;