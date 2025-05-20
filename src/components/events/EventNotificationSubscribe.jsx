import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';
import { Tooltip } from '@headlessui/react';

/**
 * EventNotificationSubscribe Component
 *
 * A toggle button to subscribe/unsubscribe to notifications for a specific event
 */
const EventNotificationSubscribe = ({ eventId, className = '' }) => {
    const { subscribeToEvent, unsubscribeFromEvent } = useNotifications();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if user is already subscribed (could be fetched from API)
    useEffect(() => {
        // This is a placeholder. In a real implementation, you would check
        // if the user is already subscribed to this event's notifications
        const checkSubscription = async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));

            // For demo purposes, we'll just set a random subscription status
            setIsSubscribed(Math.random() > 0.5);
        };

        checkSubscription();
    }, [eventId]);

    // Toggle subscription
    const toggleSubscription = async () => {
        try {
            setLoading(true);

            if (isSubscribed) {
                await unsubscribeFromEvent(eventId);
                setIsSubscribed(false);
            } else {
                await subscribeToEvent(eventId);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Error toggling notification subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip>
            <Tooltip.Button>
                <button
                    type="button"
                    onClick={toggleSubscription}
                    disabled={loading}
                    className={`relative rounded-full p-2 ${
                        isSubscribed
                            ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
                    aria-label={isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}
                >
                    {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : isSubscribed ? (
                        <BellIcon className="h-5 w-5" />
                    ) : (
                        <BellSlashIcon className="h-5 w-5" />
                    )}
                </button>
            </Tooltip.Button>
            <Tooltip.Panel className="absolute z-10 bg-neutral-800 text-white p-2 rounded-md text-xs">
                {isSubscribed ? 'Unsubscribe from notifications' : 'Subscribe to notifications'}
            </Tooltip.Panel>
        </Tooltip>
    );
};

EventNotificationSubscribe.propTypes = {
    /** Event ID to subscribe/unsubscribe to */
    eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    /** Additional CSS classes */
    className: PropTypes.string
};

export default EventNotificationSubscribe;