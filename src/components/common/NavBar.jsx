// src/components/common/NavBar.jsx - Updated with admin panel access (MockAPI removed from admin)
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';
import MockApiToggle from '../common/MockApiToggle';
import AdminNavigation from '../admin/AdminNavigation';

const NavBar = () => {
    const { isAuthenticated, currentUser, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Check if current page is home page
    const isHomePage = location.pathname === '/';
    const isAdminPage = location.pathname.startsWith('/admin');

    // Navigation links
    const navigation = [
        { name: 'Home', to: '/', authenticated: false },
        { name: 'Events', to: '/events', authenticated: false },
        { name: 'Venues', to: '/venues', authenticated: false },
        { name: 'Leaderboard', to: '/leaderboard', authenticated: false },
        { name: 'Dashboard', to: '/dashboard', authenticated: true }
    ];

    // User menu items
    const userNavigation = [
        { name: 'Your Profile', to: '/profile' },
        { name: 'Settings', to: '/settings' },
        // Admin-specific navigation for admin users
        ...(currentUser?.roles?.includes('ADMIN') ? [
            { name: 'Admin Panel', to: '/admin/dashboard', divider: true, icon: ShieldCheckIcon },
            { name: 'User Management', to: '/admin/users' },
            { name: 'Event Management', to: '/admin/events' },
            { name: 'Venue Management', to: '/admin/venues' },
            { name: 'Analytics', to: '/admin/analytics' },
        ] : []),
        { name: 'Logout', onClick: logout, divider: true }
    ];

    // Check if the window has been scrolled
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    // Determine text color based on home page status and scroll position
    const textColorClass = (isHomePage && !scrolled) ? 'text-white' : 'text-neutral-600';
    const hoverTextColorClass = (isHomePage && !scrolled) ? 'hover:text-gray-200' : 'hover:text-neutral-800';
    const activeTextColorClass = (isHomePage && !scrolled) ? 'text-white' : 'text-primary-600';
    const logoBtnTextColorClass = (isHomePage && !scrolled) ? 'text-white' : 'text-primary-600';

    return (
        <Disclosure
            as="nav"
            className={`fixed w-full z-40 transition-all duration-300 ${
                scrolled || isAdminPage
                    ? 'bg-white shadow-md'
                    : isHomePage ? 'bg-transparent' : 'bg-white'
            }`}
        >
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <Link
                                        to="/"
                                        className={`flex items-center space-x-2 ${logoBtnTextColorClass} hover:${hoverTextColorClass}`}
                                    >
                                        <img
                                            className="h-8 w-auto"
                                            src="/assets/images/logo.svg"
                                            alt="Tukio"
                                        />
                                        <span className="text-xl font-semibold font-heading">Tukio</span>
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    {navigation
                                        .filter(item => {
                                            // Check authentication requirement
                                            if (item.authenticated && !isAuthenticated) return false;
                                            return true;
                                        })
                                        .map((item) => (
                                            <NavLink
                                                key={item.name}
                                                to={item.to}
                                                className={({ isActive }) =>
                                                    `inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                                                        isActive
                                                            ? `${activeTextColorClass} border-b-2 border-primary-500`
                                                            : `${textColorClass} ${hoverTextColorClass} hover:border-b-2 hover:border-neutral-300`
                                                    }`
                                                }
                                            >
                                                {item.name}
                                            </NavLink>
                                        ))}

                                    {/* Admin Panel Link for Admins */}
                                    {currentUser?.roles?.includes('ADMIN') && (
                                        <NavLink
                                            to="/admin/dashboard"
                                            className={({ isActive }) =>
                                                `inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                                                    isActive || isAdminPage
                                                        ? `${activeTextColorClass} border-b-2 border-primary-500`
                                                        : `${textColorClass} ${hoverTextColorClass} hover:border-b-2 hover:border-neutral-300`
                                                }`
                                            }
                                        >
                                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                            Admin Panel
                                        </NavLink>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                {/* Mock API Toggle - Only show for non-admin pages */}
                                {isAuthenticated && !isAdminPage && (
                                    <MockApiToggle className="mr-4" />
                                )}

                                {isAuthenticated ? (
                                    <>
                                        {/* Notification bell */}
                                        <NotificationBell />

                                        {/* User dropdown */}
                                        <Menu as="div" className="relative ml-3">
                                            <div>
                                                <Menu.Button className="relative flex rounded-full items-center bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                                    <span className="absolute -inset-1.5" />
                                                    <span className="sr-only">Open user menu</span>
                                                    {currentUser?.profilePictureUrl ? (
                                                        <img
                                                            className="h-8 w-8 rounded-full"
                                                            src={currentUser.profilePictureUrl}
                                                            alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                                            <span className="font-medium text-sm">
                                                                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className={`ml-2 ${textColorClass}`}>{currentUser?.firstName}</span>
                                                </Menu.Button>
                                            </div>
                                            <Transition
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {userNavigation.map((item, index) => (
                                                        <React.Fragment key={item.name}>
                                                            {item.divider && index > 0 && (
                                                                <hr className="border-neutral-200 my-1" />
                                                            )}
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    item.to ? (
                                                                        <Link
                                                                            to={item.to}
                                                                            className={`${
                                                                                active ? 'bg-neutral-100' : ''
                                                                            } flex items-center px-4 py-2 text-sm text-neutral-700`}
                                                                        >
                                                                            {item.icon && (
                                                                                <item.icon className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            {item.name}
                                                                        </Link>
                                                                    ) : (
                                                                        <button
                                                                            onClick={item.onClick}
                                                                            className={`${
                                                                                active ? 'bg-neutral-100' : ''
                                                                            } flex items-center w-full text-left px-4 py-2 text-sm text-neutral-700`}
                                                                        >
                                                                            {item.icon && (
                                                                                <item.icon className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            {item.name}
                                                                        </button>
                                                                    )
                                                                )}
                                                            </Menu.Item>
                                                        </React.Fragment>
                                                    ))}
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </>
                                ) : (
                                    <div className="flex space-x-4">
                                        <Link
                                            to="/login"
                                            className={`${textColorClass} ${hoverTextColorClass} inline-flex items-center px-3 py-1 text-sm font-medium`}
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="btn btn-primary"
                                        >
                                            Sign up
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <div className="flex items-center sm:hidden">
                                <Disclosure.Button className={`relative inline-flex items-center justify-center rounded-md p-2 ${textColorClass} ${hoverTextColorClass} hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500`}>
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <Disclosure.Panel className="sm:hidden bg-white shadow-lg">
                        <div className="space-y-1 pt-2 pb-3">
                            {navigation
                                .filter(item => !item.authenticated || (item.authenticated && isAuthenticated))
                                .map((item) => (
                                    <Disclosure.Button
                                        key={item.name}
                                        as={NavLink}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `block py-2 pl-3 pr-4 text-base font-medium ${
                                                isActive
                                                    ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-500'
                                                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 hover:border-l-4 hover:border-neutral-300'
                                            }`
                                        }
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ))}

                            {/* Admin Panel Link in Mobile */}
                            {currentUser?.roles?.includes('ADMIN') && (
                                <Disclosure.Button
                                    as={NavLink}
                                    to="/admin/dashboard"
                                    className={({ isActive }) =>
                                        `flex items-center py-2 pl-3 pr-4 text-base font-medium ${
                                            isActive || isAdminPage
                                                ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-500'
                                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 hover:border-l-4 hover:border-neutral-300'
                                        }`
                                    }
                                >
                                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                    Admin Panel
                                </Disclosure.Button>
                            )}
                        </div>

                        {isAuthenticated ? (
                            <div className="border-t border-neutral-200 pt-4 pb-3">
                                {/* Mock API Toggle in mobile menu - Only show for non-admin pages */}
                                {!isAdminPage && (
                                    <div className="px-4 mb-4">
                                        <MockApiToggle />
                                    </div>
                                )}

                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        {currentUser?.profilePictureUrl ? (
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={currentUser.profilePictureUrl}
                                                alt="Profile"
                                            />
                                        ) : (
                                            <UserCircleIcon className="h-10 w-10 text-neutral-400" aria-hidden="true" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-neutral-800">
                                            {currentUser?.firstName} {currentUser?.lastName}
                                        </div>
                                        <div className="text-sm font-medium text-neutral-500">{currentUser?.email}</div>
                                    </div>

                                    {/* Notification Bell */}
                                    <div className="ml-auto">
                                        <NotificationBell />
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1">
                                    {userNavigation.map((item, index) => (
                                        <React.Fragment key={item.name}>
                                            {item.divider && index > 0 && <hr className="border-neutral-200 my-2" />}
                                            <Disclosure.Button
                                                as={item.to ? Link : 'button'}
                                                to={item.to}
                                                onClick={item.onClick}
                                                className="flex items-center px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 w-full text-left"
                                            >
                                                {item.icon && (
                                                    <item.icon className="h-5 w-5 mr-3" />
                                                )}
                                                {item.name}
                                            </Disclosure.Button>
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Admin Navigation in Mobile */}
                                {currentUser?.roles?.includes('ADMIN') && (
                                    <AdminNavigation isMobile={true} className="mt-4" />
                                )}
                            </div>
                        ) : (
                            <div className="border-t border-neutral-200 pt-4 pb-3">
                                <div className="flex items-center justify-center space-x-4 px-4 py-2">
                                    <Link
                                        to="/login"
                                        className="text-neutral-700 hover:text-neutral-900 inline-flex items-center px-3 py-1 text-base font-medium"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-primary"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        )}
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
};

export default NavBar;