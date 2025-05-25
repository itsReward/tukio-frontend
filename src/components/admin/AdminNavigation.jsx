// src/components/admin/AdminNavigation.jsx - Enhanced version
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    BuildingOffice2Icon,
    CalendarDaysIcon,
    UserGroupIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

/**
 * AdminNavigation Component
 * Enhanced admin navigation with all administrative functions
 */
const AdminNavigation = ({ className = '', isMobile = false }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    const isAdmin = currentUser?.roles?.includes('ADMIN');

    if (!isAdmin) {
        return null;
    }

    const adminLinks = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: HomeIcon,
            description: 'Admin overview',
            exact: true
        },
        {
            name: 'User Management',
            href: '/admin/users',
            icon: UserGroupIcon,
            description: 'Manage user accounts and roles'
        },
        {
            name: 'Event Management',
            href: '/admin/events',
            icon: CalendarDaysIcon,
            description: 'Manage and approve events'
        },
        {
            name: 'Venue Management',
            href: '/admin/venues',
            icon: BuildingOffice2Icon,
            description: 'Manage campus venues'
        },
        {
            name: 'Analytics & Reports',
            href: '/admin/analytics',
            icon: ChartBarIcon,
            description: 'View system analytics and reports'
        },
        {
            name: 'Notifications',
            href: '/admin/notifications',
            icon: BellIcon,
            description: 'Manage system notifications'
        },
        {
            name: 'System Settings',
            href: '/admin/settings',
            icon: Cog6ToothIcon,
            description: 'Configure system settings'
        }
    ];

    const isActiveLink = (href, exact = false) => {
        if (exact) {
            return location.pathname === href || (href === '/admin/dashboard' && location.pathname === '/admin');
        }
        return location.pathname.startsWith(href);
    };

    const getLinkClasses = (link) => {
        const isActive = isActiveLink(link.href, link.exact);
        const baseClasses = `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`;

        if (isMobile) {
            return `${baseClasses} ${
                isActive
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`;
        }

        return `${baseClasses} ${
            isActive
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        }`;
    };

    const getIconClasses = (link) => {
        const isActive = isActiveLink(link.href, link.exact);
        return `${isMobile ? 'mr-4' : 'mr-3'} h-5 w-5 ${
            isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
        }`;
    };

    if (isMobile) {
        return (
            <div className={`border-t border-neutral-200 pt-4 pb-3 ${className}`}>
                <div className="px-4 mb-3">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        Administration
                    </h3>
                </div>
                <nav className="space-y-1 px-2">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={getLinkClasses(link)}
                            >
                                <Icon className={getIconClasses(link)} />
                                <div className="flex-1">
                                    <div className="font-medium">{link.name}</div>
                                    {!isMobile && (
                                        <div className="text-xs text-neutral-500">{link.description}</div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
                    Administration
                </h3>
            </div>
            <nav className="space-y-1">
                {adminLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={getLinkClasses(link)}
                        >
                            <Icon className={getIconClasses(link)} />
                            <div>
                                <div className="font-medium">{link.name}</div>
                                <div className="text-xs text-neutral-500">{link.description}</div>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default AdminNavigation;