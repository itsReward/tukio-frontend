import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Users as UsersIcon,
  Tag as TagIcon,
  Image as PhotoIcon,
  Pencil as PencilIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import venueService from '../services/venueService';
import { EVENT_STATUSES, DATE_FORMATS } from '../utils/constants';

// Components
import Loader from '../components/common/Loader';

const CreateEventPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [venueSearchCriteria, setVenueSearchCriteria] = useState({
    startTime: null,
    endTime: null,
    minCapacity: 0
  });
  const [availableVenues, setAvailableVenues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await eventService.getAllCategories();
        setCategories(categoriesResponse.data || []);

        // Fetch venues
        const venuesResponse = await venueService.getAllVenues();
        setVenues(venuesResponse.data || []);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search for available venues based on event criteria
  const searchAvailableVenues = async (startDate, startTime, endDate, endTime, capacity) => {
    if (!startDate || !startTime || !endDate || !endTime) return;

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      const venueRequest = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        minCapacity: capacity || 1
      };

      setVenueSearchCriteria(venueRequest);

      // For now, we'll just filter the venues by capacity as a simple simulation
      // In a real app, you would make an API call to check availability
      const filteredVenues = venues.filter(venue => venue.capacity >= capacity);
      setAvailableVenues(filteredVenues);
    } catch (error) {
      console.error('Error searching for venues:', error);
      toast.error('Failed to search for available venues');
    }
  };

  const handleTagAdd = (values, setFieldValue) => {
    if (tagInput.trim() && !values.tags.includes(tagInput.trim())) {
      const newTags = [...values.tags, tagInput.trim()];
      setFieldValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove, values, setFieldValue) => {
    const newTags = values.tags.filter(tag => tag !== tagToRemove);
    setFieldValue('tags', newTags);
  };

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters')
        .required('Title is required'),
    description: Yup.string()
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description must not exceed 2000 characters')
        .required('Description is required'),
    categoryId: Yup.number()
        .required('Category is required'),
    startDate: Yup.date()
        .min(new Date(), 'Start date cannot be in the past')
        .required('Start date is required'),
    startTime: Yup.string()
        .required('Start time is required'),
    endDate: Yup.date()
        .min(
            Yup.ref('startDate'),
            'End date cannot be before start date'
        )
        .required('End date is required'),
    endTime: Yup.string()
        .required('End time is required'),
    location: Yup.string()
        .required('Location is required'),
    organizer: Yup.string()
        .required('Organizer name is required')
        .max(100, 'Organizer name must not exceed 100 characters'),
    venueId: Yup.number(),
    maxParticipants: Yup.number()
        .min(1, 'At least 1 participant is required')
        .required('Maximum participants is required'),
    imageUrl: Yup.string()
        .url('Must be a valid URL'),
    tags: Yup.array()
        .of(Yup.string())
        .min(1, 'At least one tag is required'),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      categoryId: '',
      startDate: format(new Date(), DATE_FORMATS.YEAR_MONTH_DAY),
      startTime: '12:00',
      endDate: format(new Date(), DATE_FORMATS.YEAR_MONTH_DAY),
      endTime: '13:00',
      location: '',
      venueId: '',
      maxParticipants: 50,
      imageUrl: '',
      tags: [],
      organizer: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Unknown Organizer',
      organizerId: currentUser?.id || 0,
      status: EVENT_STATUSES.SCHEDULED
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Combine date and time values
        const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
        const endDateTime = new Date(`${values.endDate}T${values.endTime}`);

        // Format data for API
        const eventData = {
          title: values.title,
          description: values.description,
          categoryId: Number(values.categoryId),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: values.location,
          venueId: values.venueId ? Number(values.venueId) : null,
          maxParticipants: Number(values.maxParticipants),
          imageUrl: values.imageUrl || '',
          tags: values.tags,
          organizer: values.organizer,
          organizerId: values.organizerId,
          status: EVENT_STATUSES.SCHEDULED
        };

        console.log("Creating event with data:", eventData);

        const response = await eventService.createEvent(eventData);

        toast.success('Event created successfully!');
        navigate(`/events/${response.data.id}`);
      } catch (error) {
        console.error('Error creating event:', error);

        let errorMessage = 'Failed to create event. Please try again.';

        if (error.response) {
          console.log("Error response status:", error.response.status);
          console.log("Error response data:", error.response.data);

          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  if (loading && !formik.values.title) {
    return (
        <div className="flex justify-center py-12">
          <Loader size="lg" text="Loading form data..." />
        </div>
    );
  }

  return (
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 dark:text-white sm:text-3xl sm:truncate">
              Create New Event
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Fill in the details below to create a new event
            </p>
          </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-accent-50 text-accent-700 rounded-md border border-accent-200">
              <p>{error}</p>
            </div>
        )}

        <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-lg p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Event Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Event Title *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PencilIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.title && formik.touched.title
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                        placeholder="Enter event title"
                    />
                  </div>
                  {formik.errors.title && formik.touched.title && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.title}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="organizer" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Organizer Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UsersIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="organizer"
                        name="organizer"
                        value={formik.values.organizer}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.organizer && formik.touched.organizer
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                        placeholder="Enter organizer name"
                    />
                  </div>
                  {formik.errors.organizer && formik.touched.organizer && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.organizer}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Description *
                  </label>
                  <div className="mt-1">
                  <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                          formik.errors.description && formik.touched.description
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                              : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                      }`}
                      placeholder="Describe your event"
                  />
                  </div>
                  {formik.errors.description && formik.touched.description && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.description}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Category *
                  </label>
                  <div className="mt-1">
                    <select
                        id="categoryId"
                        name="categoryId"
                        value={formik.values.categoryId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            formik.errors.categoryId && formik.touched.categoryId
                                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  {formik.errors.categoryId && formik.touched.categoryId && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.categoryId}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Image URL
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhotoIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={formik.values.imageUrl}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.imageUrl && formik.touched.imageUrl
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                        placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formik.errors.imageUrl && formik.touched.imageUrl && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.imageUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Event Date and Time */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white border-b pb-2">
                Date and Time
              </h3>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Start Date *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formik.values.startDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue('startDate', value);

                          // Auto-update end date if it's before start date
                          if (formik.values.endDate < value) {
                            formik.setFieldValue('endDate', value);
                          }

                          // Update venue search if all required fields are filled
                          if (formik.values.startTime && formik.values.endDate && formik.values.endTime && formik.values.maxParticipants) {
                            searchAvailableVenues(
                                value,
                                formik.values.startTime,
                                formik.values.endDate,
                                formik.values.endTime,
                                formik.values.maxParticipants
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.startDate && formik.touched.startDate
                                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                    />
                  </div>
                  {formik.errors.startDate && formik.touched.startDate && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.startDate}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="startTime" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Start Time *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formik.values.startTime}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue('startTime', value);

                          // Update venue search if all required fields are filled
                          if (formik.values.startDate && formik.values.endDate && formik.values.endTime && formik.values.maxParticipants) {
                            searchAvailableVenues(
                                formik.values.startDate,
                                value,
                                formik.values.endDate,
                                formik.values.endTime,
                                formik.values.maxParticipants
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.startTime && formik.touched.startTime
                                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                    />
                  </div>
                  {formik.errors.startTime && formik.touched.startTime && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.startTime}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    End Date *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formik.values.endDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue('endDate', value);

                          // Update venue search if all required fields are filled
                          if (formik.values.startDate && formik.values.startTime && formik.values.endTime && formik.values.maxParticipants) {
                            searchAvailableVenues(
                                formik.values.startDate,
                                formik.values.startTime,
                                value,
                                formik.values.endTime,
                                formik.values.maxParticipants
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        min={formik.values.startDate}
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.endDate && formik.touched.endDate
                                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                    />
                  </div>
                  {formik.errors.endDate && formik.touched.endDate && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.endDate}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="endTime" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    End Time *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formik.values.endTime}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue('endTime', value);

                          // Update venue search if all required fields are filled
                          if (formik.values.startDate && formik.values.startTime && formik.values.endDate && formik.values.maxParticipants) {
                            searchAvailableVenues(
                                formik.values.startDate,
                                formik.values.startTime,
                                formik.values.endDate,
                                value,
                                formik.values.maxParticipants
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.endTime && formik.touched.endTime
                                ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                    />
                  </div>
                  {formik.errors.endTime && formik.touched.endTime && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location and Capacity */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white border-b pb-2">
                Location and Capacity
              </h3>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Location *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.location && formik.touched.location
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                        placeholder="e.g., Main Campus, Building A"
                    />
                  </div>
                  {formik.errors.location && formik.touched.location && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.location}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Maximum Participants *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UsersIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        value={formik.values.maxParticipants}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue('maxParticipants', value);

                          // Update venue search if all required fields are filled
                          if (formik.values.startDate && formik.values.startTime && formik.values.endDate && formik.values.endTime) {
                            searchAvailableVenues(
                                formik.values.startDate,
                                formik.values.startTime,
                                formik.values.endDate,
                                formik.values.endTime,
                                value
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                        min="1"
                        className={`pl-10 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md py-2 ${
                            formik.errors.maxParticipants && formik.touched.maxParticipants
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'
                        }`}
                    />
                  </div>
                  {formik.errors.maxParticipants && formik.touched.maxParticipants && (
                      <p className="mt-2 text-sm text-red-600">{formik.errors.maxParticipants}</p>
                  )}
                </div>

                {/* Venue Selection */}
                <div className="sm:col-span-6">
                  <label htmlFor="venueId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Venue (Optional)
                  </label>

                  {availableVenues.length > 0 ? (
                      <>
                        <div className="mt-1">
                          <select
                              id="venueId"
                              name="venueId"
                              value={formik.values.venueId}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="block w-full py-2 px-3 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="">Select a venue (optional)</option>
                            {availableVenues.map((venue) => (
                                <option key={venue.id} value={venue.id}>
                                  {venue.name} - Capacity: {venue.capacity} - {venue.location}
                                </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-2 text-sm text-green-600">
                          {availableVenues.length} available venues found for your event criteria
                        </p>
                      </>
                  ) : (
                      <div className="mt-1">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {venueSearchCriteria.startTime
                              ? "No available venues found for the selected criteria"
                              : "Complete the date, time, and capacity fields to see available venues"}
                        </p>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white border-b pb-2">
                Tags
              </h3>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Event Tags *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TagIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        id="tagInput"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTagAdd(formik.values, formik.setFieldValue);
                          }
                        }}
                        className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-none rounded-l-md sm:text-sm border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white py-2"
                        placeholder="Add tag and press Enter"
                    />
                  </div>
                  <button
                      type="button"
                      onClick={() => handleTagAdd(formik.values, formik.setFieldValue)}
                      className="-ml-px relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-r-md text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    Add
                  </button>
                </div>

                {formik.values.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formik.values.tags.map((tag, index) => (
                          <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100"
                          >
                      {tag}
                            <button
                                type="button"
                                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:text-primary-500 focus:outline-none focus:bg-primary-200 focus:text-primary-500"
                                onClick={() => handleTagRemove(tag, formik.values, formik.setFieldValue)}
                            >
                        <span className="sr-only">Remove tag</span>
                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                      ))}
                    </div>
                )}
                {formik.errors.tags && formik.touched.tags && (
                    <p className="mt-2 text-sm text-red-600">{formik.errors.tags}</p>
                )}
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                    type="button"
                    className="bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-500 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => navigate('/events')}
                    disabled={loading}
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading || !formik.isValid}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreateEventPage;