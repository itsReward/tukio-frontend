import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import venueService from '../services/venueService';

// Components
import VenueCard from '../components/venues/VenueCard';
import VenueFilterSidebar from '../components/venues/VenueFilterSidebar';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';

const VenuesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalVenues, setTotalVenues] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [venuesPerPage] = useState(12);

    // Filter states
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        minCapacity: searchParams.get('minCapacity') ? Number(searchParams.get('minCapacity')) : null,
        venueType: searchParams.get('type') || '',
        amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
        location: searchParams.get('location') || '',
    });

    // Fetch venues
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setLoading(true);
                const response = await venueService.getAllVenues();

                // Apply filters
                let filteredVenues = response.data;

                // Filter by keyword (search in name, location, description)
                if (filters.keyword) {
                    const keyword = filters.keyword.toLowerCase();
                    filteredVenues = filteredVenues.filter(venue =>
                        venue.name.toLowerCase().includes(keyword) ||
                        venue.location.toLowerCase().includes(keyword) ||
                        (venue.description && venue.description.toLowerCase().includes(keyword))
                    );
                }

                // Filter by minimum capacity
                if (filters.minCapacity) {
                    filteredVenues = filteredVenues.filter(venue =>
                        venue.capacity >= filters.minCapacity
                    );
                }

                // Filter by venue type
                if (filters.venueType) {
                    filteredVenues = filteredVenues.filter(venue =>
                        venue.type === filters.venueType
                    );
                }

                // Filter by location
                if (filters.location) {
                    const location = filters.location.toLowerCase();
                    filteredVenues = filteredVenues.filter(venue =>
                        venue.location.toLowerCase().includes(location)
                    );
                }

                // Filter by amenities
                if (filters.amenities.length > 0) {
                    filteredVenues = filteredVenues.filter(venue => {
                        if (!venue.amenities) return false;
                        return filters.amenities.every(amenity =>
                            venue.amenities.map(a => a.toLowerCase()).includes(amenity.toLowerCase())
                        );
                    });
                }

                setTotalVenues(filteredVenues.length);

                // Paginate results
                const indexOfLastVenue = currentPage * venuesPerPage;
                const indexOfFirstVenue = indexOfLastVenue - venuesPerPage;
                setVenues(filteredVenues.slice(indexOfFirstVenue, indexOfLastVenue));
            } catch (error) {
                console.error('Error fetching venues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, [filters, currentPage, venuesPerPage]);

    // Update URL params when filters change
    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.keyword) params.set('keyword', filters.keyword);
        if (filters.minCapacity) params.set('minCapacity', filters.minCapacity.toString());
        if (filters.venueType) params.set('type', filters.venueType);
        if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
        if (filters.location) params.set('location', filters.location);

        setSearchParams(params);
    }, [filters, setSearchParams]);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // All possible venue types
    const venueTypes = [
        { value: 'CLASSROOM', label: 'Classroom' },
        { value: 'LECTURE_HALL', label: 'Lecture Hall' },
        { value: 'AUDITORIUM', label: 'Auditorium' },
        { value: 'LAB', label: 'Laboratory' },
        { value: 'MEETING_ROOM', label: 'Meeting Room' },
        { value: 'CONFERENCE_ROOM', label: 'Conference Room' },
        { value: 'OUTDOOR_SPACE', label: 'Outdoor Space' },
        { value: 'SPORTS_FACILITY', label: 'Sports Facility' },
        { value: 'DINING_AREA', label: 'Dining Area' },
        { value: 'MULTIPURPOSE', label: 'Multipurpose' }
    ];

    // Common amenities for quick filtering
    const commonAmenities = [
        'Wi-Fi',
        'Projector',
        'Sound System',
        'Air Conditioning',
        'Whiteboard',
        'Accessible',
        'Catering',
        'Computer Workstations',
        'Video Conferencing',
        'Microphones'
    ];

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="py-8">
                    <h1 className="text-3xl font-bold text-neutral-900">Campus Venues</h1>
                    <p className="mt-2 text-neutral-600">
                        Find and book the perfect venue for your events.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="lg:w-1/4">
                        <VenueFilterSidebar
                            filters={filters}
                            venueTypes={venueTypes}
                            commonAmenities={commonAmenities}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Result Count */}
                        <div className="mb-6">
                            <p className="text-neutral-600">
                                Found <span className="font-semibold">{totalVenues}</span> venues
                            </p>
                        </div>

                        {/* Venues Grid */}
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader size="lg" />
                            </div>
                        ) : venues.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {venues.map((venue) => (
                                    <VenueCard key={venue.id} venue={venue} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-neutral-200">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                    <span className="text-2xl">🏢</span>
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 mb-2">No venues found</h3>
                                <p className="text-neutral-600 mb-4">
                                    No venues match your current filters. Try adjusting your search criteria.
                                </p>
                                <button
                                    onClick={() => handleFilterChange({
                                        keyword: '',
                                        minCapacity: null,
                                        venueType: '',
                                        amenities: [],
                                        location: '',
                                    })}
                                    className="btn btn-outline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalVenues > venuesPerPage && !loading && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalVenues / venuesPerPage)}
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

export default VenuesPage;