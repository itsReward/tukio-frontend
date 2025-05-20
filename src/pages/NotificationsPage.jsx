import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    BellIcon,
    CheckIcon,
    TrashIcon,
    BellSlashIcon,
    XMarkIcon,
    FunnelIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationContext';
import Tabs from '../components/common/Tabs';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Pagination from '../components/common/Pagination';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

const NotificationsPage = () => {
    const {
        notifications,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications
    } = useNotifications();

    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Fetch notifications on mount and when tab changes
    useEffect(() => {
        fetchNotifications(currentPage, pageSize);
    }, [currentPage, pageSize, fetchNotifications]);

    // Filter notifications based on active tab
    useEffect(() => {
        let filtered = [...notifications];

        // Apply tab filter
        if (activeTab === 'unread') {
            filtered = filtered.filter(notification => !notification.read);
        } else if (activeTab === 'preferences') {
            // Preferences tab shows a different component, no need to filter
            return;
        }

        // Apply type filter if not 'all'
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(notification => notification.type === selectedFilter);
        }

        setFilteredNotifications(filtered);

        // Set total pages (this would normally come from backend pagination)
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    }, [notifications, activeTab, selectedFilter, pageSize]);

    // Define tabs
    const tabs = [
        { id: 'all', label: 'All Notifications', icon: BellIcon },
        { id: 'unread', label: 'Unread', icon: BellSlashIcon },
        { id: 'preferences', label: 'Preferences', icon: FunnelIcon }
    ];

    // Filter options
    const filterOptions = [
        { id: 'all', label: 'All Types', icon: BellIcon },
        { id: 'info', label: 'Information', icon: InformationCircleIcon, color: 'bg-primary-100 text-primary-800' },
        { id: 'success', label: 'Success', icon: CheckCircleIcon, color: 'bg-success-100 text-success-800' },
        { id: 'warning', label: 'Warning', icon: ExclamationTriangleIcon, color: 'bg-warning-100 text-warning-800' },
        { id: 'error', label: 'Error', icon: XCircleIcon, color: 'bg-accent-100 text-accent-800' }
    ];

    // Format date
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    };

    // Get icon and color based on notification type
    const getNotificationStyles = (type) => {
        switch(type) {
            case 'success':
                return {
                    bgColor: 'bg-success-100',
                    textColor: 'text-success-800',
                    borderColor: 'border-success-200',
                    icon: CheckCircleIcon
                };
            case 'warning':
                return {
                    bgColor: 'bg-warning-100',
                    textColor: 'text-warning-800',
                    borderColor: 'border-warning-200',
                    icon: ExclamationTriangleIcon
                };
            case 'error':
                return {
                    bgColor: 'bg-accent-100',
                    textColor: 'text-accent-800',
                    borderColor: 'border-accent-200',
                    icon: XCircleIcon
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-primary-100',
                    textColor: 'text-primary-800',
                    borderColor: 'border-primary-200',
                    icon: InformationCircleIcon
                };
        }
    };

    // Handle mark as read
    const handleMarkAsRead = (notificationId, e) => {
        e?.stopPropagation();
        markAsRead(notificationId);
    };

    // Handle delete notification
    const handleDeleteNotification = (notificationId, e) => {
        e?.stopPropagation();
        deleteNotification(notificationId);
    };

    // Render the content based on active tab
    const renderContent = () => {
        if (activeTab === 'preferences') {
            return <NotificationPreferences />;
        }

        if (loading && notifications.length === 0) {
            return (
                <div className="flex justify-center py-12">
                    <Loader size="lg" text="Loading notifications..." />
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-accent-50 rounded-lg p-6 text-center text-accent-700 border border-accent-200">
                    <p>{error}</p>
                    <Button
                        variant="primary"
                        onClick={() => fetchNotifications(currentPage, pageSize)}
                        className="mt-4"
                        icon={<ArrowPathIcon className="h-5 w-5" />}
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        if (filteredNotifications.length === 0) {
            return (
                <div className="bg-white rounded-xl shadow-card border border-neutral-200 p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-neutral-100">
                        <BellSlashIcon className="h-8 w-8 text-neutral-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-neutral-900 mb-2">No notifications</h3>
                    <p className="text-neutral-600">
                        {activeTab === 'unread'
                            ? "You've read all your notifications."
                            : "You don't have any notifications yet."}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        {filterOptions.map((filter) => (
                            <Button
                                key={filter.id}
                                variant={selectedFilter === filter.id ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setSelectedFilter(filter.id)}
                                icon={<filter.icon className="h-4 w-4" />}
                                iconPosition="left"
                            >
                                {filter.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline-neutral"
                            size="sm"
                            onClick={clearAllNotifications}
                            icon={<TrashIcon className="h-4 w-4" />}
                            iconPosition="left"
                        >
                            Clear All
                        </Button>
                        {activeTab === 'unread' && filteredNotifications.length > 0 && (
                            <Button
                                variant="outline-neutral"
                                size="sm"
                                onClick={markAllAsRead}
                                icon={<CheckIcon className="h-4 w-4" />}
                                iconPosition="left"
                            >
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {filteredNotifications.map((notification) => {
                        const { bgColor, textColor, borderColor, icon: NotificationIcon } = getNotificationStyles(notification.type);

                        const NotificationContent = (
                            <Card
                                className={`transition-colors duration-200 ${!notification.read ? 'border-l-4 border-primary-500' : ''}`}
                                hover="shadow"
                            >
                                <Card.Body>
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} mr-4`}>
                                            <NotificationIcon className="h-6 w-6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-medium text-neutral-900 truncate pr-2">
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    {!notification.read && (
                                                        <Badge variant="primary" size="sm">Unread</Badge>
                                                    )}
                                                    <Badge
                                                        variant={notification.type}
                                                        size="sm"
                                                        className={`${bgColor} ${textColor}`}
                                                    >
                                                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <p className="mt-1 text-neutral-600">
                                                {notification.message}
                                            </p>

                                            <div className="mt-2 flex items-center justify-between text-sm">
                                                <span className="text-neutral-500">
                                                    {formatDate(notification.timestamp)}
                                                </span>

                                                <div className="flex space-x-2">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                            className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                                                        >
                                                            <CheckIcon className="h-4 w-4 mr-1" />
                                                            Mark as read
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                        className="text-neutral-500 hover:text-neutral-700 flex items-center"
                                                    >
                                                        <TrashIcon className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        );

                        // Wrap in Link if notification has a link
                        return notification.link ? (
                            <Link
                                key={notification.id}
                                to={notification.link}
                                className="block"
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                            >
                                {NotificationContent}
                            </Link>
                        ) : (
                            <div
                                key={notification.id}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                            >
                                {NotificationContent}
                            </div>
                        );
                    })}
                </motion.div>

                {/* Pagination */}
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Notifications</h1>
                <p className="text-neutral-600">Manage your notifications and preferences</p>
            </div>

            <div className="mb-6">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="boxed"
                    iconPosition="left"
                />
            </div>

            {renderContent()}
        </div>
    );
};

export default NotificationsPage;