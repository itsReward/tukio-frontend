import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-700 text-white p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
                        <path fill="white" d="M256,0C114.8,0,0,114.8,0,256S114.8,512,256,512s256-114.8,256-256S397.2,0,256,0z"></path>
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8">
                        <Link to="/" className="flex items-center">
                            <img src="/assets/images/logo-white.svg" alt="Tukio Logo" className="h-8 w-auto mr-2" />
                            <span className="text-2xl font-bold">Tukio</span>
                        </Link>
                    </div>

                    <motion.div
                        className="my-auto max-w-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-bold mb-6">Welcome to Campus Event Central</h1>
                        <p className="text-xl mb-8 opacity-90">
                            Your one-stop platform for all campus events, venue bookings, and community engagement.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-2 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Discover Events</h3>
                                    <p className="opacity-80">Find and join campus events that match your interests.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-2 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Book Venues</h3>
                                    <p className="opacity-80">Find and reserve the perfect space for your events.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-2 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Earn Rewards</h3>
                                    <p className="opacity-80">Get points and badges as you participate in events.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-auto">
                        <p className="text-sm opacity-80">
                            © {new Date().getFullYear()} Tukio. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="flex items-center justify-center">
                            <img src="/assets/images/logo.svg" alt="Tukio Logo" className="h-10 w-auto mr-2" />
                            <span className="text-2xl font-bold text-primary-600">Tukio</span>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;