import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import eventService from '../services/eventService';

// Components
import EventCard from '../components/events/EventCard';
import EventFilterSidebar from '../components/events/EventFilterSidebar';
import EventSortOptions from '../components/events/EventSortOptions';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';

const EventsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEvents, setTotalEvents] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(12);

    // Filter states
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        categoryId: searchParams.get('category') ? Number(searchParams.get('category')) : null,
        startFrom: searchParams.get('startFrom') ? new Date(searchParams.get('startFrom')) : null,
        startTo: searchParams.get('startTo') ? new Date(searchParams.get('startTo')) : null,
        tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
    });

    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'date-asc');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await eventService.getAllCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Map filters to API expected format
                const searchCriteria = {
                    categoryId: filters.categoryId,
                    keyword: filters.keyword,
                    startFrom: filters.startFrom?.toISOString(),
                    startTo: filters.startTo?.toISOString(),
                    tags: filters.tags.length > 0 ? filters.tags : null,
                };

                const response = await eventService.searchEvents(searchCriteria);
                let filteredEvents = response.data;

                // Sort events based on selected option
                filteredEvents = sortEvents(filteredEvents, sortOption);

                setTotalEvents(filteredEvents.length);

                // Paginate results
                const indexOfLastEvent = currentPage * eventsPerPage;
                const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
                setEvents(filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent));
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [filters, sortOption, currentPage, eventsPerPage]);

    // Update URL params when filters or sort option changes
    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.keyword) params.set('keyword', filters.keyword);
        if (filters.categoryId) params.set('category', filters.categoryId.toString());
        if (filters.startFrom) params.set('startFrom', filters.startFrom.toISOString());
        if (filters.startTo) params.set('startTo', filters.startTo.toISOString());
        if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
        if (sortOption) params.set('sort', sortOption);

        setSearchParams(params);
    }, [filters, sortOption, setSearchParams]);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle sort option change
    const handleSortChange = (option) => {
        setSortOption(option);
        setCurrentPage(1); // Reset to first page on sort change
    };

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Sort events based on selected option
    const sortEvents = (eventsList, option) => {
        const sorted = [...eventsList];

        switch (option) {
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            case 'popularity':
                return sorted.sort((a, b) => (b.currentRegistrations || 0) - (a.currentRegistrations || 0));
            case 'title-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'title-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return sorted;
        }
    };

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="py-8">
                    <h1 className="text-3xl font-bold text-neutral-900">Explore Events</h1>
                    <p className="mt-2 text-neutral-600">
                        Discover and participate in upcoming campus events.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="lg:w-1/4">
                        <EventFilterSidebar
                            filters={filters}
                            categories={categories}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Sort and Result Count */}
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <p className="text-neutral-600 mb-3 sm:mb-0">
                                Found <span className="font-semibold">{totalEvents}</span> events
                            </p>
                            <EventSortOptions
                                sortOption={sortOption}
                                onSortChange={handleSortChange}
                            />
                        </div>

                        {/* Events Grid */}
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader size="lg" />
                            </div>
                        ) : events.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {events.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-neutral-200">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
                                <p className="text-neutral-600 mb-4">
                                    No events match your current filters. Try adjusting your search criteria.
                                </p>
                                <button
                                    onClick={() => handleFilterChange({
                                        keyword: '',
                                        categoryId: null,
                                        startFrom: null,
                                        startTo: null,
                                        tags: [],
                                    })}
                                    className="btn btn-outline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalEvents > eventsPerPage && !loading && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalEvents / eventsPerPage)}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsPage;