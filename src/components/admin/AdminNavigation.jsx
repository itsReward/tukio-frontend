// src/components/admin/AdminNavigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    BuildingOffice2Icon,
    CalendarDaysIcon,
    UserGroupIcon,
    ChartBarIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

/**
 * AdminNavigation Component
 * Shows admin-specific navigation links in the sidebar or as a dropdown
 */
const AdminNavigation = ({ className = '' }) => {
    const { currentUser } = useAuth();
    const location = useLocation();

    const isAdmin = currentUser?.roles?.includes('ADMIN');

    if (!isAdmin) {
        return null;
    }

    const adminLinks = [
        {
            name: 'Venue Management',
            href: '/admin/venues',
            icon: BuildingOffice2Icon,
            description: 'Manage campus venues'
        },
        {
            name: 'Event Management',
            href: '/admin/events',
            icon: CalendarDaysIcon,
            description: 'Manage all events'
        },
        {
            name: 'User Management',
            href: '/admin/users',
            icon: UserGroupIcon,
            description: 'Manage user accounts'
        },
        {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: ChartBarIcon,
            description: 'View system analytics'
        },
        {
            name: 'System Settings',
            href: '/admin/settings',
            icon: Cog6ToothIcon,
            description: 'Configure system settings'
        }
    ];

    const isActiveLink = (href) => {
        return location.pathname.startsWith(href);
    };

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
                    const isActive = isActiveLink(link.href);

                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                        >
                            <Icon
                                className={`mr-3 h-5 w-5 ${
                                    isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
                                }`}
                            />
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