import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import UserEventsList from '../components/events/UserEventsList';
import Loader from '../components/common/Loader';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * MyEventsPage
 * Displays all events the user has registered for or created
 */
const MyEventsPage = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user registrations
        const response = await eventService.getRegistrationsByUser(currentUser.id);

        // Make sure we have valid data
        if (response.data && Array.isArray(response.data)) {
          // Process the events to ensure they have valid data
          const processedEvents = response.data.map(event => ({
            ...event,
            id: event.id || event.eventId || `event-${Math.random()}`,
            eventId: event.eventId || event.id,
            title: event.eventTitle || event.title || 'Untitled Event',
            // Ensure we have valid dates or provide fallbacks
            startTime: event.startTime || new Date().toISOString(),
            endTime: event.endTime || new Date().toISOString(),
            // Ensure location info is available
            location: event.location || event.venueName || 'Location TBD',
            // Default status if not provided
            status: event.status || 'REGISTERED'
          }));

          setEvents(processedEvents);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching user events:', err);
        setError('Failed to load your events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [currentUser]);

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {/* Page Header */}
          <motion.div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
              variants={itemVariants}
          >
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                <CalendarDaysIcon className="h-6 w-6 mr-2 text-primary-600" />
                My Events
              </h1>
              <p className="mt-1 text-neutral-600">
                View and manage all your event registrations
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                  to="/events/create"
                  className="btn btn-primary flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create Event
              </Link>
            </div>
          </motion.div>

          {/* Events Section */}
          <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Your Events</h2>
            </div>

            <div className="p-6">
              {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader size="lg" />
                  </div>
              ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-accent-600 mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                      Retry
                    </button>
                  </div>
              ) : (
                  <UserEventsList events={events} />
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default MyEventsPage;