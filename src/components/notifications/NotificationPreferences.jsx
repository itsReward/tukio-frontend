import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import {
    BellIcon,
    EnvelopeIcon,
    CalendarIcon,
    XCircleIcon,
    ChatBubbleLeftRightIcon,
    MegaphoneIcon,
    PencilSquareIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';

const NotificationPreferences = () => {
    const { preferences, updatePreferences } = useNotifications();
    const [localPreferences, setLocalPreferences] = useState(preferences);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Handle toggle change
    const handleToggleChange = (key, value) => {
        setLocalPreferences(prev => ({
            ...prev,
            [key]: value
        }));
        setIsDirty(true);
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            await updatePreferences(localPreferences);
            setIsDirty(false);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset changes
    const handleResetChanges = () => {
        setLocalPreferences(preferences);
        setIsDirty(false);
    };

    // Define settings groups with their items
    const settingsGroups = [
        {
            title: 'Delivery Channels',
            description: 'Choose how you want to receive notifications',
            settings: [
                {
                    key: 'emailNotifications',
                    label: 'Email Notifications',
                    description: 'Receive notifications via email',
                    icon: EnvelopeIcon
                },
                {
                    key: 'pushNotifications',
                    label: 'Push Notifications',
                    description: 'Receive push notifications on your devices',
                    icon: DevicePhoneMobileIcon
                }
            ]
        },
        {
            title: 'Event Notifications',
            description: 'Notifications related to events you are registered for',
            settings: [
                {
                    key: 'eventReminders',
                    label: 'Event Reminders',
                    description: 'Receive reminders before your events start',
                    icon: CalendarIcon
                },
                {
                    key: 'eventUpdates',
                    label: 'Event Updates',
                    description: 'Receive notifications when event details change',
                    icon: PencilSquareIcon
                },
                {
                    key: 'eventCancellations',
                    label: 'Event Cancellations',
                    description: 'Receive notifications when events are cancelled',
                    icon: XCircleIcon
                }
            ]
        },
        {
            title: 'Other Notifications',
            description: 'Other types of notifications',
            settings: [
                {
                    key: 'newMessages',
                    label: 'New Messages',
                    description: 'Receive notifications for new messages',
                    icon: ChatBubbleLeftRightIcon
                },
                {
                    key: 'systemAnnouncements',
                    label: 'System Announcements',
                    description: 'Important announcements about the platform',
                    icon: MegaphoneIcon
                },
                {
                    key: 'marketingCommunications',
                    label: 'Marketing Communications',
                    description: 'Updates about new features and promotions',
                    icon: BellIcon
                }
            ]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Action Buttons */}
            {isDirty && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end space-x-4"
                >
                    <Button
                        variant="outline-neutral"
                        onClick={handleResetChanges}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveChanges}
                        loading={loading}
                        disabled={loading}
                    >
                        Save Changes
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default NotificationPreferences;