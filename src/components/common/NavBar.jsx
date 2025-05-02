import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const NavBar = () => {
    const { isAuthenticated, currentUser, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Navigation links
    const navigation = [
        { name: 'Home', to: '/', authenticated: false },
        { name: 'Events', to: '/events', authenticated: false },
        { name: 'Venues', to: '/venues', authenticated: false },
        { name: 'Leaderboard', to: '/leaderboard', authenticated: false },
        { name: 'Dashboard', to: '/dashboard', authenticated: true },
    ];

    // User menu items
    const userNavigation = [
        { name: 'Your Profile', to: '/profile' },
        { name: 'Settings', to: '/settings' },
        { name: 'Logout', onClick: logout },
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

    // Determine if a navigation item is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <Disclosure
            as="nav"
            className={`fixed w-full z-40 transition-all duration-300 ${
                scrolled
                    ? 'bg-white shadow-md'
                    : 'bg-transparent'
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
                                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
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
                                        .filter(item => !item.authenticated || (item.authenticated && isAuthenticated))
                                        .map((item) => (
                                            <NavLink
                                                key={item.name}
                                                to={item.to}
                                                className={({ isActive }) =>
                                                    `inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                                        isActive
                                                            ? 'text-primary-600 border-b-2 border-primary-500'
                                                            : 'text-neutral-600 hover:text-neutral-800 hover:border-b-2 hover:border-neutral-300'
                                                    }`
                                                }
                                            >
                                                {item.name}
                                            </NavLink>
                                        ))}
                                </div>
                            </div>

                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                {isAuthenticated ? (
                                    <>
                                        {/* Notification bell */}
                                        <button
                                            type="button"
                                            className="relative rounded-full p-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            <span className="absolute -inset-1.5" />
                                            <span className="sr-only">View notifications</span>
                                            <div className="relative">
                                                <BellIcon className="h-6 w-6" aria-hidden="true" />
                                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
                                            </div>
                                        </button>

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
                              <span className="font-medium">
                                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                              </span>
                                                        </div>
                                                    )}
                                                    <span className="ml-2 text-neutral-700">{currentUser?.firstName}</span>
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
                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    {userNavigation.map((item) => (
                                                        <Menu.Item key={item.name}>
                                                            {({ active }) => (
                                                                item.to ? (
                                                                    <Link
                                                                        to={item.to}
                                                                        className={`${
                                                                            active ? 'bg-neutral-100' : ''
                                                                        } block px-4 py-2 text-sm text-neutral-700`}
                                                                    >
                                                                        {item.name}
                                                                    </Link>
                                                                ) : (
                                                                    <button
                                                                        onClick={item.onClick}
                                                                        className={`${
                                                                            active ? 'bg-neutral-100' : ''
                                                                        } block w-full text-left px-4 py-2 text-sm text-neutral-700`}
                                                                    >
                                                                        {item.name}
                                                                    </button>
                                                                )
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </>
                                ) : (
                                    <div className="flex space-x-4">
                                        <Link
                                            to="/login"
                                            className="text-neutral-700 hover:text-neutral-900 inline-flex items-center px-3 py-1 text-sm font-medium"
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
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
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
                        </div>

                        {isAuthenticated ? (
                            <div className="border-t border-neutral-200 pt-4 pb-3">
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
                                    <button
                                        type="button"
                                        className="relative ml-auto flex-shrink-0 rounded-full p-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    >
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">View notifications</span>
                                        <div className="relative">
                                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
                                        </div>
                                    </button>
                                </div>
                                <div className="mt-3 space-y-1">
                                    {userNavigation.map((item) => (
                                        <Disclosure.Button
                                            key={item.name}
                                            as={item.to ? Link : 'button'}
                                            to={item.to}
                                            onClick={item.onClick}
                                            className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 w-full text-left"
                                        >
                                            {item.name}
                                        </Disclosure.Button>
                                    ))}
                                </div>
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