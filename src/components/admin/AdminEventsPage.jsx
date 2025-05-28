import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Services
import eventService from '../../services/eventService.js';

const AdminEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAndSortEvents();
    }, [events, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch events and categories from real API
            const [eventsResponse, categoriesResponse] = await Promise.all([
                eventService.getAllEvents(),
                eventService.getAllCategories()
            ]);

            setEvents(eventsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load events data');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortEvents = () => {
        let filtered = [...events];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(event => event.status === statusFilter);
        }

        // Category filter
        if (categoryFilter !== 'ALL') {
            filtered = filtered.filter(event => event.categoryId === parseInt(categoryFilter));
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'startTime' || sortBy === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredEvents(filtered);
        setCurrentPage(1);
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        try {
            setActionLoading(true);
            await eventService.deleteEvent(selectedEvent.id);

            setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
            toast.success('Event deleted successfully');
            setShowDeleteModal(false);
            setSelectedEvent(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveEvent = async (eventId, approved) => {
        try {
            setActionLoading(true);

            if (approved) {
                await eventService.approveEvent(eventId);
            } else {
                await eventService.rejectEvent(eventId);
            }

            const newStatus = approved ? 'SCHEDULED' : 'CANCELLED';
            setEvents(prev => prev.map(event =>
                event.id === eventId
                    ? { ...event, status: newStatus }
                    : event
            ));

            toast.success(`Event ${approved ? 'approved' : 'rejected'} successfully`);
        } catch (error) {
            console.error('Error updating event status:', error);
            toast.error(`Failed to ${approved ? 'approve' : 'reject'} event`);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badgeClasses = {
            'SCHEDULED': 'bg-green-100 text-green-800',
            'DRAFT': 'bg-yellow-100 text-yellow-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'COMPLETED': 'bg-gray-100 text-gray-800',
            'RESCHEDULED': 'bg-orange-100 text-orange-800'
        };

        const statusText = {
            'SCHEDULED': 'Scheduled',
            'DRAFT': 'Pending Approval',
            'CANCELLED': 'Cancelled',
            'COMPLETED': 'Completed',
            'RESCHEDULED': 'Rescheduled'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {statusText[status] || status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Pagination logic
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    const pendingApprovalCount = events.filter(event => event.status === 'DRAFT').length;

    const Card = ({ children, className = '' }) => (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {children}
        </div>
    );

    const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '' }) => {
        const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
        const variants = {
            primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
            danger: 'border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            >
                {children}
            </button>
        );
    };

    const Loader = () => (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    );

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {title}
                                    </h3>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                        <p className="mt-1 text-gray-600">
                            Manage, approve, and monitor all platform events
                        </p>
                        {pendingApprovalCount > 0 && (
                            <div className="mt-2 flex items-center text-amber-600">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">
                                    {pendingApprovalCount} event{pendingApprovalCount !== 1 ? 's' : ''} pending approval
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Event
                        </Button>
                    </div>
                </div>

                {/* Filters and Search */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Events
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by title, description, or organizer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="DRAFT">Pending Approval</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="RESCHEDULED">Rescheduled</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="ALL">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <div className="flex space-x-2">
                                <select
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="createdAt">Created Date</option>
                                    <option value="startTime">Event Date</option>
                                    <option value="title">Title</option>
                                    <option value="currentRegistrations">Registrations</option>
                                </select>
                                <button
                                    type="button"
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Events Table */}
                <Card>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                <ClockIcon className="h-6 w-6 text-gray-500" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search criteria or create a new event.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-3">Event</div>
                                    <div className="col-span-2">Organizer</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-1">Registrations</div>
                                    <div className="col-span-3">Actions</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-200">
                                {currentEvents.map((event) => (
                                    <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            {/* Event Info */}
                                            <div className="col-span-3">
                                                <div className="flex items-center">
                                                    {event.imageUrl ? (
                                                        <img
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                            src={event.imageUrl}
                                                            alt={event.title}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xs">📅</span>
                                                        </div>
                                                    )}
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {event.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {event.categoryName || 'Unknown Category'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Organizer */}
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-900">{event.organizer}</p>
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-900">
                                                    {formatDate(event.startTime)}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-1">
                                                {getStatusBadge(event.status)}
                                            </div>

                                            {/* Registrations */}
                                            <div className="col-span-1">
                                                <p className="text-sm text-gray-900">
                                                    {event.currentRegistrations || 0}/{event.maxParticipants}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-3">
                                                <div className="flex items-center space-x-2">
                                                    {/* View */}
                                                    <button
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="View Event"
                                                        onClick={() => window.open(`/events/${event.id}`, '_blank')}
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit Event"
                                                        onClick={() => window.location.href = `/admin/events/${event.id}/edit`}
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>

                                                    {/* Approve/Reject for pending events */}
                                                    {event.status === 'DRAFT' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveEvent(event.id, true)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Approve Event"
                                                                disabled={actionLoading}
                                                            >
                                                                <CheckIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproveEvent(event.id, false)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Reject Event"
                                                                disabled={actionLoading}
                                                            >
                                                                <XMarkIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEvent(event);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Event"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of{' '}
                            {filteredEvents.length} events
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-sm rounded ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Delete Event"
                >
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Are you sure you want to delete this event?
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            "{selectedEvent?.title}" will be permanently deleted. This action cannot be undone.
                        </p>
                        <div className="flex justify-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteEvent}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Deleting...' : 'Delete Event'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </motion.div>
        </div>
    );
};

export default AdminEventsPage;