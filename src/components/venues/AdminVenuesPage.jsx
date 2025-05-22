import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    BuildingOffice2Icon,
    MapPinIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Components
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';

// Services and hooks
import { useAuth } from '../../hooks/useAuth';
import venueService from '../../services/venueService';
import { VENUE_TYPES } from '../../utils/constants';


const AdminVenuesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, venue: null });

    // Pagination and filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [venuesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const isAdmin = currentUser?.roles?.includes('ADMIN');

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            toast.error('Access denied. Admin privileges required.');
        }
    }, [isAdmin, navigate]);

    // Fetch venues
    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await venueService.getAllVenues();
            setVenues(response.data || []);
        } catch (err) {
            console.error('Error fetching venues:', err);
            setError('Failed to load venues');
            toast.error('Failed to load venues');
        } finally {
            setLoading(false);
        }
    };

    // Handle venue deletion
    const handleDeleteVenue = async (venue) => {
        try {
            setDeleteLoading(true);
            await venueService.deleteVenue(venue.id);
            setVenues(venues.filter(v => v.id !== venue.id));
            toast.success('Venue deleted successfully');
            setDeleteModal({ isOpen: false, venue: null });
        } catch (err) {
            console.error('Error deleting venue:', err);
            toast.error(err.response?.data?.message || 'Failed to delete venue');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Filter venues based on search and filters
    const getFilteredVenues = () => {
        let filtered = [...venues];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(venue =>
                venue.name.toLowerCase().includes(search) ||
                venue.location.toLowerCase().includes(search) ||
                venue.building?.toLowerCase().includes(search) ||
                venue.description?.toLowerCase().includes(search)
            );
        }

        // Type filter
        if (typeFilter) {
            filtered = filtered.filter(venue => venue.type === typeFilter);
        }

        // Status filter
        if (statusFilter === 'available') {
            filtered = filtered.filter(venue => venue.availabilityStatus);
        } else if (statusFilter === 'unavailable') {
            filtered = filtered.filter(venue => !venue.availabilityStatus);
        }

        return filtered;
    };

    // Paginate venues
    const getPaginatedVenues = () => {
        const filtered = getFilteredVenues();
        const indexOfLastVenue = currentPage * venuesPerPage;
        const indexOfFirstVenue = indexOfLastVenue - venuesPerPage;
        return {
            venues: filtered.slice(indexOfFirstVenue, indexOfLastVenue),
            totalVenues: filtered.length,
            totalPages: Math.ceil(filtered.length / venuesPerPage)
        };
    };

    const { venues: paginatedVenues, totalVenues, totalPages } = getPaginatedVenues();

    // Get venue type label
    const getVenueTypeLabel = (type) => {
        const venueType = VENUE_TYPES.find(t => t.value === type);
        return venueType ? venueType.label : type;
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    if (!isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" text="Loading venues..." />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Venue Management</h1>
                            <p className="mt-2 text-neutral-600">
                                Manage campus venues and their availability.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Button
                                variant="primary"
                                as="link"
                                to="/admin/venues/create"
                                icon={<PlusIcon className="h-5 w-5" />}
                                iconPosition="left"
                            >
                                Add New Venue
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6"
                >
                    <Card>
                        <Card.Body padding="default">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-input pl-10 w-full"
                                            placeholder="Search venues by name, location, or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="w-full lg:w-48">
                                    <select
                                        className="form-select w-full"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        {VENUE_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div className="w-full lg:w-48">
                                    <select
                                        className="form-select w-full"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(searchTerm || typeFilter || statusFilter) && (
                                    <Button
                                        variant="outline-neutral"
                                        onClick={clearFilters}
                                        icon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
                                        iconPosition="left"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </motion.div>

                {/* Results Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                >
                    <p className="text-neutral-600">
                        Showing <span className="font-semibold">{paginatedVenues.length}</span> of{' '}
                        <span className="font-semibold">{totalVenues}</span> venues
                    </p>
                </motion.div>

                {/* Venues List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-4"
                >
                    {error ? (
                        <Card>
                            <Card.Body>
                                <div className="text-center py-8">
                                    <p className="text-accent-600 mb-4">{error}</p>
                                    <Button variant="primary" onClick={fetchVenues}>
                                        Try Again
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ) : paginatedVenues.length === 0 ? (
                        <Card>
                            <Card.Body>
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                        <BuildingOffice2Icon className="h-8 w-8 text-neutral-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                        {venues.length === 0 ? 'No venues found' : 'No venues match your filters'}
                                    </h3>
                                    <p className="text-neutral-600 mb-6">
                                        {venues.length === 0
                                            ? 'Get started by adding your first venue.'
                                            : 'Try adjusting your search criteria or filters.'
                                        }
                                    </p>
                                    {venues.length === 0 ? (
                                        <Button
                                            variant="primary"
                                            as="link"
                                            to="/admin/venues/create"
                                        >
                                            Add First Venue
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={clearFilters}>
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    ) : (
                        paginatedVenues.map((venue) => (
                            <Card key={venue.id} hover="shadow">
                                <Card.Body>
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-neutral-900 truncate">
                                                            {venue.name}
                                                        </h3>
                                                        <Badge
                                                            variant={getVenueTypeLabel(venue.type) === 'Auditorium' ? 'primary' : 'secondary'}
                                                            size="sm"
                                                        >
                                                            {getVenueTypeLabel(venue.type)}
                                                        </Badge>
                                                        <div className="flex items-center">
                                                            {venue.availabilityStatus ? (
                                                                <CheckCircleIcon className="h-5 w-5 text-success-500" />
                                                            ) : (
                                                                <XCircleIcon className="h-5 w-5 text-accent-500" />
                                                            )}
                                                            <span className={`ml-1 text-sm ${
                                                                venue.availabilityStatus ? 'text-success-600' : 'text-accent-600'
                                                            }`}>
                                                                {venue.availabilityStatus ? 'Available' : 'Unavailable'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
                                                        <div className="flex items-center">
                                                            <MapPinIcon className="h-4 w-4 mr-2 text-neutral-500 flex-shrink-0" />
                                                            <span className="truncate">{venue.location}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <UserGroupIcon className="h-4 w-4 mr-2 text-neutral-500 flex-shrink-0" />
                                                            <span>Capacity: {venue.capacity}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BuildingOffice2Icon className="h-4 w-4 mr-2 text-neutral-500 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {venue.building || 'No building specified'}
                                                                {venue.floor && `, ${venue.floor}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {venue.description && (
                                                        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                                                            {venue.description}
                                                        </p>
                                                    )}

                                                    {venue.amenities && venue.amenities.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1">
                                                            {venue.amenities.slice(0, 3).map((amenity, index) => (
                                                                <Badge key={index} variant="neutral" size="sm">
                                                                    {amenity}
                                                                </Badge>
                                                            ))}
                                                            {venue.amenities.length > 3 && (
                                                                <Badge variant="neutral" size="sm">
                                                                    +{venue.amenities.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                as="link"
                                                to={`/venues/${venue.id}`}
                                                className="flex-1 lg:flex-none"
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                as="link"
                                                to={`/admin/venues/${venue.id}/edit`}
                                                icon={<PencilIcon className="h-4 w-4" />}
                                                className="flex-1 lg:flex-none"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteModal({ isOpen: true, venue })}
                                                icon={<TrashIcon className="h-4 w-4" />}
                                                className="flex-1 lg:flex-none text-accent-600 border-accent-300 hover:bg-accent-50"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8"
                    >
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </motion.div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, venue: null })}
                    title="Delete Venue"
                    size="md"
                >
                    <div className="space-y-4">
                        <p className="text-neutral-600">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">{deleteModal.venue?.name}</span>?
                            This action cannot be undone.
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                            <p className="text-sm text-amber-800">
                                <strong>Warning:</strong> Deleting this venue may affect existing event bookings
                                and could cause scheduling conflicts.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline-neutral"
                                onClick={() => setDeleteModal({ isOpen: false, venue: null })}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="accent"
                                onClick={() => handleDeleteVenue(deleteModal.venue)}
                                loading={deleteLoading}
                                disabled={deleteLoading}
                            >
                                Delete Venue
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AdminVenuesPage;