import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  TagIcon,
  PhotoIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { ROUTES, EVENT_STATUSES, DATE_FORMATS } from '../utils/constants';
import eventService from '../services/eventService';
import venueService from '../services/venueService';

// Validation schema
const CreateEventSchema = Yup.object().shape({
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

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [venueSearchCriteria, setVenueSearchCriteria] = useState({
    startTime: null,
    endTime: null,
    minCapacity: 0
  });
  const [availableVenues, setAvailableVenues] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch categories and venues on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesResponse, venuesResponse] = await Promise.all([
          eventService.getAllCategories(),
          venueService.getAllVenues()
        ]);
        
        setCategories(categoriesResponse.data || []);
        setVenues(venuesResponse.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load required data. Please refresh the page.');
      }
    };

    fetchInitialData();
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
      
      const response = await venueService.findAvailableVenues(venueRequest);
      setAvailableVenues(response.data || []);
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

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);

    try {
      // Combine date and time values
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
      const endDateTime = new Date(`${values.endDate}T${values.endTime}`);

      const eventData = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: values.location,
        venueId: values.venueId || null,
        maxParticipants: values.maxParticipants,
        organizerId: localStorage.getItem('userId'), // Assuming userId is stored in localStorage
        imageUrl: values.imageUrl || '',
        tags: values.tags,
        status: EVENT_STATUSES.SCHEDULED
      };

      const response = await eventService.createEvent(eventData);
      
      toast.success('Event created successfully!');
      resetForm();
      // Navigate to the event detail page
      navigate(`${ROUTES.EVENTS}/${response.data.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to create event. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Create New Event
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to create a new event
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
        <Formik
          initialValues={{
            title: '',
            description: '',
            categoryId: '',
            startDate: format(new Date(), DATE_FORMATS.YEAR_MONTH_DAY),
            startTime: '12:00',
            endDate: format(new Date(), DATE_FORMATS.YEAR_MONTH_DAY),
            endTime: '13:00',
            location: '',
            venueId: '',
            maxParticipants: 20,
            imageUrl: '',
            tags: []
          }}
          validationSchema={CreateEventSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isValid }) => (
            <Form className="space-y-8">
              {/* Event Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Title *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PencilSquareIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="text"
                        name="title"
                        id="title"
                        className={`pl-10 block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.title && touched.title 
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        placeholder="Enter event title"
                      />
                    </div>
                    <ErrorMessage name="title" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description *
                    </label>
                    <div className="mt-1">
                      <Field
                        as="textarea"
                        id="description"
                        name="description"
                        rows={4}
                        className={`block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                          errors.description && touched.description 
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        placeholder="Describe your event"
                      />
                    </div>
                    <ErrorMessage name="description" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category *
                    </label>
                    <div className="mt-1">
                      <Field
                        as="select"
                        id="categoryId"
                        name="categoryId"
                        className={`block w-full py-2 px-3 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          errors.categoryId && touched.categoryId 
                            ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <ErrorMessage name="categoryId" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image URL
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="url"
                        name="imageUrl"
                        id="imageUrl"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.imageUrl && touched.imageUrl 
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <ErrorMessage name="imageUrl" component="p" className="mt-2 text-sm text-red-600" />
                  </div>
                </div>
              </div>

              {/* Event Date and Time */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b pb-2">
                  Date and Time
                </h3>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="date"
                        name="startDate"
                        id="startDate"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.startDate && touched.startDate 
                            ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue('startDate', value);
                          
                          // Auto-update end date if it's before start date
                          if (values.endDate < value) {
                            setFieldValue('endDate', value);
                          }
                          
                          // Update venue search if all required fields are filled
                          if (values.startTime && values.endDate && values.endTime && values.maxParticipants) {
                            searchAvailableVenues(
                              value, 
                              values.startTime, 
                              values.endDate, 
                              values.endTime, 
                              values.maxParticipants
                            );
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name="startDate" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Time *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="time"
                        name="startTime"
                        id="startTime"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.startTime && touched.startTime 
                            ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue('startTime', value);
                          
                          // Update venue search if all required fields are filled
                          if (values.startDate && values.endDate && values.endTime && values.maxParticipants) {
                            searchAvailableVenues(
                              values.startDate, 
                              value, 
                              values.endDate, 
                              values.endTime, 
                              values.maxParticipants
                            );
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name="startTime" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="date"
                        name="endDate"
                        id="endDate"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.endDate && touched.endDate 
                            ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        min={values.startDate}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue('endDate', value);
                          
                          // Update venue search if all required fields are filled
                          if (values.startDate && values.startTime && values.endTime && values.maxParticipants) {
                            searchAvailableVenues(
                              values.startDate, 
                              values.startTime, 
                              value, 
                              values.endTime, 
                              values.maxParticipants
                            );
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name="endDate" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Time *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="time"
                        name="endTime"
                        id="endTime"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.endTime && touched.endTime 
                            ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue('endTime', value);
                          
                          // Update venue search if all required fields are filled
                          if (values.startDate && values.startTime && values.endDate && values.maxParticipants) {
                            searchAvailableVenues(
                              values.startDate, 
                              values.startTime, 
                              values.endDate, 
                              value, 
                              values.maxParticipants
                            );
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name="endTime" component="p" className="mt-2 text-sm text-red-600" />
                  </div>
                </div>
              </div>

              {/* Location and Capacity */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b pb-2">
                  Location and Capacity
                </h3>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="text"
                        name="location"
                        id="location"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.location && touched.location 
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        placeholder="e.g., Main Campus, Building A"
                      />
                    </div>
                    <ErrorMessage name="location" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum Participants *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <Field
                        type="number"
                        name="maxParticipants"
                        id="maxParticipants"
                        min="1"
                        className={`pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md py-2 ${
                          errors.maxParticipants && touched.maxParticipants 
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        }`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue('maxParticipants', value);
                          
                          // Update venue search if all required fields are filled
                          if (values.startDate && values.startTime && values.endDate && values.endTime) {
                            searchAvailableVenues(
                              values.startDate, 
                              values.startTime, 
                              values.endDate, 
                              values.endTime, 
                              value
                            );
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name="maxParticipants" component="p" className="mt-2 text-sm text-red-600" />
                  </div>

                  {/* Venue Selection */}
                  <div className="sm:col-span-6">
                    <label htmlFor="venueId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Venue (Optional)
                    </label>
                    
                    {availableVenues.length > 0 ? (
                      <>
                        <div className="mt-1">
                          <Field
                            as="select"
                            id="venueId"
                            name="venueId"
                            className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="">Select a venue (optional)</option>
                            {availableVenues.map((venue) => (
                              <option key={venue.id} value={venue.id}>
                                {venue.name} - Capacity: {venue.capacity} - {venue.location}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <p className="mt-2 text-sm text-green-600">
                          {availableVenues.length} available venues found for your event criteria
                        </p>
                      </>
                    ) : (
                      <div className="mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b pb-2">
                  Tags
                </h3>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Tags *
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        id="tagInput"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTagAdd(values, setFieldValue);
                          }
                        }}
                        className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2"
                        placeholder="Add tag and press Enter"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTagAdd(values, setFieldValue)}
                      className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-r-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                  
                  {values.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {values.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100"
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:text-indigo-500 focus:outline-none focus:bg-indigo-200 focus:text-indigo-500"
                            onClick={() => handleTagRemove(tag, values, setFieldValue)}
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
                  <ErrorMessage name="tags" component="p" className="mt-2 text-sm text-red-600" />
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => navigate(ROUTES.EVENTS)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateEventPage;