import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import venueService from '../services/venueService';
import { EVENT_STATUSES } from '../utils/constants';

// Components
import EventForm from '../components/events/EventForm';
import Loader from '../components/common/Loader';

const CreateEventPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

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

  // Form validation schema - FIXED CYCLIC DEPENDENCY
  const validationSchema = Yup.object({
    title: Yup.string()
        .required('Event title is required')
        .max(100, 'Title must be 100 characters or less'),
    description: Yup.string()
        .required('Description is required')
        .max(2000, 'Description must be 2000 characters or less'),
    startTime: Yup.date()
        .required('Start time is required')
        .min(new Date(), 'Start time must be in the future'),
    endTime: Yup.date()
        .required('End time is required')
        .min(
            Yup.ref('startTime'),
            'End time must be after start time'
        ),
    categoryId: Yup.number()
        .required('Category is required'),
    // FIXED: Removed circular dependency between location and venueId
    location: Yup.string()
        .test(
            'location-or-venue',
            'Either location or venue must be specified',
            function(value) {
              return value || this.parent.venueId;
            }
        ),
    venueId: Yup.number()
        .nullable()
        .test(
            'venue-or-location',
            'Either venue or location must be specified',
            function(value) {
              return value || this.parent.location;
            }
        ),
    maxParticipants: Yup.number()
        .required('Maximum participants is required')
        .min(1, 'Maximum participants must be at least 1')
        .integer('Maximum participants must be a whole number'),
    tags: Yup.array()
        .of(Yup.string())
        .nullable(),
    imageUrl: Yup.string()
        .url('Must be a valid URL')
        .nullable(),
    organizer: Yup.string()
        .required('Organizer is required'),
    organizerId: Yup.number()
        .required('Organizer ID is required')
  });

  // Initialize form with default values
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      categoryId: '',
      location: '',
      venueId: '',
      maxParticipants: 50,
      tags: [],
      imageUrl: '',
      organizer: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Unknown Organizer',
      organizerId: currentUser?.id || 0,
      status: EVENT_STATUSES.SCHEDULED
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Format dates properly for API
        const formattedValues = {
          ...values,
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          categoryId: Number(values.categoryId),
          maxParticipants: Number(values.maxParticipants),
          venueId: values.venueId ? Number(values.venueId) : null,

          // IMPORTANT: Ensure these are never null/undefined
          organizer: values.organizer || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Unknown Organizer',
          organizerId: values.organizerId || currentUser?.id || 0
        };

        console.log("Creating event with data:", formattedValues);

        const response = await eventService.createEvent(formattedValues);

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create Event</h1>
          <p className="text-neutral-600">Fill in the details to create a new event.</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-accent-50 text-accent-700 rounded-md border border-accent-200">
              <p>{error}</p>
            </div>
        )}

        <EventForm
            formik={formik}
            categories={categories}
            venues={venues}
            loading={loading}
        />
      </div>
  );
};

export default CreateEventPage;