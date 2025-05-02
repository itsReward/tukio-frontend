import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8">
                        <h1 className="text-9xl font-bold text-primary-600">404</h1>
                        <h2 className="text-3xl font-bold text-neutral-900 mt-4">Page Not Found</h2>
                        <p className="mt-3 text-neutral-600">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-outline flex items-center justify-center w-full"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Go Back
                        </button>
                        <Link
                            to="/"
                            className="btn btn-primary flex items-center justify-center w-full"
                        >
                            <HomeIcon className="h-5 w-5 mr-2" />
                            Return to Home
                        </Link>
                    </div>

                    <div className="mt-12">
                        <div className="flex items-center justify-center space-x-4">
                            <Link
                                to="/events"
                                className="text-neutral-600 hover:text-primary-600"
                            >
                                Browse Events
                            </Link>
                            <span className="text-neutral-300">|</span>
                            <Link
                                to="/help"
                                className="text-neutral-600 hover:text-primary-600"
                            >
                                Help Center
                            </Link>
                            <span className="text-neutral-300">|</span>
                            <Link
                                to="/contact"
                                className="text-neutral-600 hover:text-primary-600"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFoundPage;