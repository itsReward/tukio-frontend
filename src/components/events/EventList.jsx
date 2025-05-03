import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import eventService from '../../services/eventService';
import EventCard from './EventCard';
import Button from '../common/Button';
import Loader from '../common/Loader';

/**
 * EventList Component
 * Displays a filterable, searchable list of events
 */
const EventList = ({
                       initialEvents = [],
                       showFilters = true,
                       showSearch = true,
                       maxItems = 0,
                       emptyMessage = 'No events found',
                       fetchEvents = true,
                       userId = null,
                       categoryId = null,
                       className = '',
                   }) => {
    const [events, setEvents] = useState(initialEvents);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(fetchEvents);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        category: categoryId || '',
        timeFrame: 'upcoming',
        tags: []
    });
    const [categories, setCategories] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Fetch events and categories
    useEffect(() => {
        const fetchData = async () => {
            if (fetchEvents) {
                try {
                    setLoading(true);
                    setError(null);

                    let eventsResponse;
                    if (userId) {
                        // Fetch user specific events
                        eventsResponse = await eventService.getRegistrationsByUser(userId);
                    } else if (categoryId) {
                        // Fetch category specific events
                        eventsResponse = await eventService.getEventsByCategory(categoryId);
                    } else {
                        // Fetch all events
                        eventsResponse = await eventService.getAllEvents();
                    }

                    setEvents(eventsResponse.data || []);

                    // Fetch categories for filters
                    if (showFilters) {
                        const categoriesResponse = await eventService.getAllCategories();
                        setCategories(categoriesResponse.data || []);
                    }
                } catch (err) {
                    console.error('Error fetching events data:', err);
                    setError(err.message || 'Failed to load events');
                } finally {
                    setLoading(false);
                }
            } else {
                // If not fetching from API, use initialEvents
                setFilteredEvents(initialEvents);
            }
        };

        fetchData();
    }, [fetchEvents, userId, categoryId, initialEvents, showFilters]);

    // Apply filters and search whenever events, filters, or searchTerm changes
    useEffect(() => {
        if (!events.length) {
            setFilteredEvents([]);
            return;
        }

        let result = [...events];

        // Apply time frame filter
        const now = new Date();
        if (filters.timeFrame === 'upcoming') {
            result = result.filter(event => new Date(event.startTime) > now);
        } else if (filters.timeFrame === 'past') {
            result = result.filter(event => new Date(event.startTime) < now);
        }

        // Apply status filter
        if (filters.status) {
            result = result.filter(event => event.status === filters.status);
        }

        // Apply category filter
        if (filters.category) {
            result = result.filter(event => event.categoryId === Number(filters.category));
        }

        // Apply tags filter
        if (filters.tags.length > 0) {
            result = result.filter(event =>
                filters.tags.some(tag =>
                    event.tags && event.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
                )
            );
        }

        // Apply search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                event =>
                    event.title.toLowerCase().includes(search) ||
                    event.description.toLowerCase().includes(search) ||
                    event.location.toLowerCase().includes(search) ||
                    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(search)))
            );
        }

        // Apply maxItems limit if specified
        if (maxItems > 0) {
            result = result.slice(0, maxItems);
        }

        setFilteredEvents(result);
    }, [events, filters, searchTerm, maxItems]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle tag input
    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !filters.tags.includes(tag)) {
            setFilters(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            status: '',
            category: categoryId || '',
            timeFrame: 'upcoming',
            tags: []
        });
        setSearchTerm('');
    };

    // Toggle filters panel
    const toggleFilters = () => {
        setFilterOpen(prev => !prev);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (loading) {
        return (
            <div className={`flex justify-center py-8 ${className}`}>
                <Loader size="lg" text="Loading events..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-accent-600">{error}</p>
                <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Search and Filters */}
            {(showSearch || showFilters) && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-3">
                        {/* Search Box */}
                        {showSearch && (
                            <div className="flex-1 min-w-[200px] relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-neutral-500" />
                                </div>
                                <input
                                    type="text"
                                    className="form-input pl-10 pr-10 w-full"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={handleClearSearch}
                                    >
                                        <XMarkIcon className="h-5 w-5 text-neutral-500" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Filter Toggle Button */}
                        {showFilters && (
                            <Button
                                variant="outline"
                                onClick={toggleFilters}
                                className="whitespace-nowrap"
                                icon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
                                iconPosition="left"
                            >
                                {filterOpen ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        )}

                        {/* Create Event Button - If showing filters, likely on events page */}
                        {showFilters && (
                            <Button
                                as="link"
                                to="/events/create"
                                variant="primary"
                                className="whitespace-nowrap"
                            >
                                Create Event
                            </Button>
                        )}
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {filterOpen && showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Time Frame Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                Time Frame
                                            </label>
                                            <select
                                                className="form-select"
                                                value={filters.timeFrame}
                                                onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                                            >
                                                <option value="all">All Events</option>
                                                <option value="upcoming">Upcoming Events</option>
                                                <option value="past">Past Events</option>
                                            </select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                className="form-select"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="SCHEDULED">Scheduled</option>
                                                <option value="RESCHEDULED">Rescheduled</option>
                                                <option value="CANCELLED">Cancelled</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </div>

                                        {/* Category Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                Category
                                            </label>
                                            <select
                                                className="form-select"
                                                value={filters.category}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Tags Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                Tags
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    className="form-input flex-grow"
                                                    placeholder="Add tag..."
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={handleTagInputKeyDown}
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="ml-2"
                                                    onClick={addTag}
                                                    disabled={!tagInput.trim()}
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            {/* Display selected tags */}
                                            {filters.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {filters.tags.map((tag) => (
                                                        <div
                                                            key={tag}
                                                            className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs flex items-center"
                                                        >
                                                            <span>{tag}</span>
                                                            <button
                                                                type="button"
                                                                className="ml-1 text-primary-600 hover:text-primary-800"
                                                                onClick={() => removeTag(tag)}
                                                            >
                                                                <XMarkIcon className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filter Actions */}
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="outline-neutral"
                                            onClick={resetFilters}
                                            className="mr-2"
                                        >
                                            Reset Filters
                                        </Button>
                                        <Button variant="primary" onClick={toggleFilters}>
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Events List */}
            {filteredEvents.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                            }}
                        >
                            <EventCard event={event} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
                    <CalendarIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-900">No events found</h3>
                    <p className="mt-1 text-neutral-500">{emptyMessage}</p>
                    {showFilters && (
                        <div className="mt-6">
                            <Button variant="primary" onClick={resetFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* View All Link - Only show if maxItems is set and there are more events */}
            {maxItems > 0 && events.length > maxItems && (
                <div className="mt-6 text-center">
                    <Link
                        to="/events"
                        className="inline-flex items-center text-primary-600 hover:text-primary-800"
                    >
                        <span>View All Events</span>
                        <svg
                            className="ml-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
};

EventList.propTypes = {
    /** Initial events data array */
    initialEvents: PropTypes.array,
    /** Whether to show filter controls */
    showFilters: PropTypes.bool,
    /** Whether to show search input */
    showSearch: PropTypes.bool,
    /** Maximum number of items to display (0 for unlimited) */
    maxItems: PropTypes.number,
    /** Message to display when no events are found */
    emptyMessage: PropTypes.string,
    /** Whether to fetch events from API */
    fetchEvents: PropTypes.bool,
    /** User ID to fetch events for */
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Category ID to filter events by */
    categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Additional CSS classes */
    className: PropTypes.string
};

export default EventList;