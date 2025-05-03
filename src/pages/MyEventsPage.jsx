import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';

// Components
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Tabs from '../components/common/Tabs';
import Button from '../components/common/Button';

// Icons
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  TagIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const MyEventsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering and viewing
  const [activeTab, setActiveTab] = useState('upcoming');
  const [eventType, setEventType] = useState('registered');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState({
    category: 'all',
    time: 'all',
    status: 'all',
  });
  
  // State for sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'all', label: 'All Events' },
  ];
  
  const eventTypeOptions = [
    { id: 'registered', label: 'Registered Events' },
    { id: 'created', label: 'Created Events' },
    { id: 'attended', label: 'Attended Events' },
  ];
  
  // Fetch events based on active filters
  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        switch (eventType) {
          case 'created':
            response = await eventService.getEventsByCreator(currentUser.id);
            break;
          case 'attended':
            response = await eventService.getAttendedEvents(currentUser.id);
            break;
          case 'registered':
          default:
            response = await eventService.getRegistrationsByUser(currentUser.id);
            break;
        }
        
        setEvents(response.data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load your events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentUser, eventType]);
  
  // Apply filters and search to events
  const filteredEvents = events.filter(event => {
    // Basic text search
    if (searchQuery && !event.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filter.category !== 'all' && event.categoryName !== filter.category) {
      return false;
    }
    
    // Status filter (for registered events)
    if (filter.status !== 'all' && eventType === 'registered' && event.status !== filter.status) {
      return false;
    }
    
    // Time filter - upcoming or past
    const now = new Date();
    const eventDate = new Date(event.startTime || event.startDate);
    
    if (activeTab === 'upcoming' && eventDate < now) {
      return false;
    }
    
    if (activeTab === 'past' && eventDate >= now) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'date':
        compareValue = new Date(a.startTime || a.startDate) - new Date(b.startTime || b.startDate);
        break;
      case 'name':
        compareValue = (a.title || '').localeCompare(b.title || '');
        break;
      case 'category':
        compareValue = (a.categoryName || '').localeCompare(b.categoryName || '');
        break;
      default:
        compareValue = new Date(a.startTime || a.startDate) - new Date(b.startTime || b.startDate);
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });
  
  const toggleFilterPanel = () => {
    setFilterVisible(!filterVisible);
  };
  
  const resetFilters = () => {
    setFilter({
      category: 'all',
      time: 'all',
      status: 'all',
    });
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('asc');
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleCancelRegistration = async (eventId) => {
    if (!confirm('Are you sure you want to cancel your registration?')) {
      return;
    }
    
    try {
      await eventService.cancelRegistration(eventId);
      // Update the local state
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, status: 'CANCELLED' } 
          : event
      ));
    } catch (error) {
      console.error('Failed to cancel registration:', error);
      alert('Failed to cancel your registration. Please try again.');
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      await eventService.deleteEvent(eventId);
      // Remove the event from the local state
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete the event. Please try again.');
    }
  };
  
  // Helper to format date
  const formatEventDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Date unavailable';
    }
  };
  
  // Helper to format time
  const formatEventTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Time unavailable';
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Extract unique categories from events for filter dropdown
  const categories = ['all', ...new Set(events.map(event => event.categoryName).filter(Boolean))];
  
  // For registered events, get unique statuses
  const statuses = ['all', ...new Set(events.map(event => event.status).filter(Boolean))];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" text="Loading your events..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
          {eventType === 'registered' && 'Events you have registered for'}
          {eventType === 'created' && 'Events you have created'}
          {eventType === 'attended' && 'Events you have attended'}
        </p>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {eventTypeOptions.map(option => (
              <button
                key={option.id}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  eventType === option.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => setEventType(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="form-input pl-10 pr-4 py-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={toggleFilterPanel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FunnelIcon className="h-4 w-4 mr-1.5" />
              Filters
            </button>
            
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={toggleSortOrder}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
        </div>
        
        {/* Expanded Filter Panel */}
        {filterVisible && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="form-select w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  value={filter.category}
                  onChange={(e) => setFilter({...filter, category: e.target.value})}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              {eventType === 'registered' && (
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    className="form-select w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    value={filter.status}
                    onChange={(e) => setFilter({...filter, status: e.target.value})}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  className="form-select w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
      
      {/* Events List */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {sortedEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description={
            searchQuery || filter.category !== 'all' || filter.status !== 'all'
              ? "Try adjusting your search or filters to find what you're looking for."
              : eventType === 'registered'
                ? "You haven't registered for any events yet."
                : eventType === 'created'
                  ? "You haven't created any events yet."
                  : "You haven't attended any events yet."
          }
          icon={CalendarIcon}
          action={
            eventType === 'created' ? (
              <Button
                variant="primary"
                onClick={() => navigate('/events/create')}
                icon={<PlusIcon className="h-5 w-5" />}
              >
                Create New Event
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/events')}
                icon={<CalendarIcon className="h-5 w-5" />}
              >
                Browse Events
              </Button>
            )
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedEvents.map((event) => (
            <motion.div key={event.id} variants={itemVariants}>
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  {event.imageUrl && (
                    <div className="md:w-48 lg:w-56 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Event Details */}
                  <div className="p-4 md:p-6 flex-grow">
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link 
                              to={`/events/${event.id || event.eventId}`}
                              className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {event.title}
                            </Link>
                            
                            <div className="mt-1 flex flex-wrap gap-2">
                              {event.categoryName && (
                                <Badge variant="secondary" size="sm">
                                  {event.categoryName}
                                </Badge>
                              )}
                              
                              {eventType === 'registered' && event.status && (
                                <Badge 
                                  variant={
                                    event.status === 'REGISTERED' ? 'primary' :
                                    event.status === 'ATTENDED' ? 'success' :
                                    event.status === 'CANCELLED' ? 'danger' : 'default'
                                  } 
                                  size="sm"
                                >
                                  {event.status}
                                </Badge>
                              )}
                              
                              {eventType === 'created' && (
                                <Badge variant={event.published ? 'success' : 'warning'} size="sm">
                                  {event.published ? 'Published' : 'Draft'}
                                </Badge>
                              )}
                              
                              {event.isFree === false && (
                                <Badge variant="warning" size="sm" icon={<BanknotesIcon className="h-3 w-3 mr-1" />}>
                                  Paid
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {eventType === 'registered' && event.status === 'REGISTERED' && (
                            <Badge variant="primary" size="md" icon={<CheckBadgeIcon className="h-4 w-4 mr-1" />}>
                              Registered
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                            <span>{formatEventDate(event.startTime || event.startDate)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                            <span>
                              {formatEventTime(event.startTime || event.startDate)} - {formatEventTime(event.endTime || event.endDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                            <span>{event.location || event.venueName || 'Location unavailable'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                            <span>
                              {event.registeredParticipants !== undefined ? 
                                `${event.registeredParticipants} / ${event.maxParticipants || 'Unlimited'}` : 
                                'Attendance unavailable'}
                            </span>
                          </div>
                        </div>
                        
                        {event.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-end">
                        <Link
                          to={`/events/${event.id || event.eventId}`}
                          className="btn btn-outline btn-sm"
                        >
                          View Details
                        </Link>
                        
                        {eventType === 'registered' && event.status === 'REGISTERED' && (
                          <button
                            onClick={() => handleCancelRegistration(event.id || event.eventId)}
                            className="btn btn-danger btn-sm flex items-center"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1.5" />
                            Cancel Registration
                          </button>
                        )}
                        
                        {eventType === 'created' && (
                          <>
                            <Link
                              to={`/events/edit/${event.id}`}
                              className="btn btn-primary btn-sm flex items-center"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                              Edit
                            </Link>
                            
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="btn btn-danger btn-sm flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-1.5" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Create Event CTA for Created Events Tab */}
      {eventType === 'created' && (
        <div className="mt-8 text-center">
          <Link
            to="/events/create"
            className="btn btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Event
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;