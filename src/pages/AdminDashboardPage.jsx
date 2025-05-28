// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    CalendarDaysIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    CheckCircleIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - in real app, this would come from APIs
    const mockStats = {
        totalEvents: 6,
        activeEvents: 4,
        totalUsers: 4,
        newUsersThisWeek: 1,
        totalVenues: 2,
        occupiedVenues: 1,
        pendingApprovals: 0,
        eventAttendanceRate: 87.5,
        popularCategory: 'Technology',
        systemHealth: 'healthy'
    };

    const mockRecentActivity = [
        {
            id: 4,
            type: 'system_alert',
            description: 'No recent activity',
            timestamp: '2025-05-25T08:30:00',
            severity: 'warning'
        }
    ];

    const mockPendingApprovals = [

    ];

    useEffect(() => {
        // Simulate API calls
        const fetchData = async () => {
            setLoading(true);
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats(mockStats);
            setRecentActivity(mockRecentActivity);
            setPendingApprovals(mockPendingApprovals);
            setLoading(false);
        };

        fetchData();
    }, []);

    const formatRelativeTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'event_created':
                return <CalendarDaysIcon className="h-5 w-5 text-blue-500" />;
            case 'user_registered':
                return <UserGroupIcon className="h-5 w-5 text-green-500" />;
            case 'venue_booking':
                return <BuildingOffice2Icon className="h-5 w-5 text-purple-500" />;
            case 'system_alert':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'success':
                return 'border-l-green-500';
            case 'warning':
                return 'border-l-yellow-500';
            case 'error':
                return 'border-l-red-500';
            default:
                return 'border-l-blue-500';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-64">
                    <Loader size="lg" text="Loading admin dashboard..." />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Helmet>
                <title>Admin Dashboard | Tukio</title>
                <meta name="description" content="Administrative dashboard for managing the Tukio platform" />
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-1 text-gray-600">
                            Monitor and manage your platform from here
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button as="link" to="/admin/settings">
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            System Settings
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Events
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalEvents}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                                            <span className="sr-only">Increased by</span>
                                            12%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserGroupIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Users
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalUsers.toLocaleString()}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                                            <span className="sr-only">Increased by</span>
                                            8%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Venue Utilization
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {Math.round((stats.occupiedVenues / stats.totalVenues) * 100)}%
                                        </div>
                                        <div className="ml-2 text-sm text-gray-600">
                                            {stats.occupiedVenues}/{stats.totalVenues} venues
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Attendance Rate
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.eventAttendanceRate}%
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                                            <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                                            <span className="sr-only">Decreased by</span>
                                            2%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button as="link" to="/admin/events" variant="outline" className="justify-center">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" />
                            Manage Events
                        </Button>
                        <Button as="link" to="/admin/users" variant="outline" className="justify-center">
                            <UserGroupIcon className="h-5 w-5 mr-2" />
                            Manage Users
                        </Button>
                        <Button as="link" to="/admin/venues" variant="outline" className="justify-center">
                            <BuildingOffice2Icon className="h-5 w-5 mr-2" />
                            Manage Venues
                        </Button>
                        <Button as="link" to="/admin/analytics" variant="outline" className="justify-center">
                            <ChartBarIcon className="h-5 w-5 mr-2" />
                            View Analytics
                        </Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Approvals */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Pending Approvals
                                {pendingApprovals.length > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {pendingApprovals.length}
                                    </span>
                                )}
                            </h2>
                            <Link
                                to="/admin/events?status=DRAFT"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {pendingApprovals.length === 0 ? (
                                <div className="text-center py-4">
                                    <CheckCircleIcon className="mx-auto h-8 w-8 text-green-500" />
                                    <p className="mt-2 text-sm text-gray-600">All caught up!</p>
                                </div>
                            ) : (
                                pendingApprovals.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                by {item.organizer} • {formatRelativeTime(item.submittedAt)}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="ghost">
                                                <EyeIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            <Link
                                to="/admin/activity-log"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className={`flex items-start space-x-3 p-3 border-l-4 bg-gray-50 rounded-r-lg ${getSeverityColor(activity.severity)}`}
                                >
                                    <div className="flex-shrink-0">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatRelativeTime(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* System Status */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">API Status</h3>
                            <p className="text-xs text-green-600">Operational</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Database</h3>
                            <p className="text-xs text-green-600">Healthy</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Server Load</h3>
                            <p className="text-xs text-yellow-600">High (85%)</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminDashboardPage;