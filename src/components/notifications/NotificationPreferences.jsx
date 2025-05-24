import React, { useState, useEffect } from 'react';
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
    DevicePhoneMobileIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import Button from '../common/Button';
import Card from '../common/Card';

const NotificationPreferences = () => {
    const {
        preferences,
        updatePreferences,
        updateAllPreferences,
        getPreferenceForType
    } = useNotifications();

    const [localPreferences, setLocalPreferences] = useState({});
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Initialize local preferences when context preferences change
    useEffect(() => {
        if (preferences && preferences.length > 0) {
            const prefsMap = {};
            preferences.forEach(pref => {
                prefsMap[pref.notificationType] = {
                    emailEnabled: pref.emailEnabled,
                    pushEnabled: pref.pushEnabled,
                    inAppEnabled: pref.inAppEnabled
                };
            });
            setLocalPreferences(prefsMap);
        } else {
            // Initialize with default preferences if none exist
            initializeDefaultPreferences();
        }
    }, [preferences]);

    // Initialize default preferences for all notification types
    const initializeDefaultPreferences = () => {
        const defaultPrefs = {};
        notificationTypes.forEach(type => {
            defaultPrefs[type.key] = {
                emailEnabled: true,
                pushEnabled: true,
                inAppEnabled: true
            };
        });
        setLocalPreferences(defaultPrefs);
    };

    // Handle toggle change for a specific notification type and channel
    const handleToggleChange = (notificationType, channel, value) => {
        setLocalPreferences(prev => ({
            ...prev,
            [notificationType]: {
                ...prev[notificationType],
                [channel]: value
            }
        }));
        setIsDirty(true);
    };

    // Handle save changes
    const handleSaveChanges = async () => {
        try {
            setLoading(true);

            // Convert local preferences to array format for API
            const preferencesArray = Object.entries(localPreferences).map(([notificationType, prefs]) => ({
                notificationType,
                ...prefs
            }));

            await updateAllPreferences(preferencesArray);
            setIsDirty(false);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset changes
    const handleResetChanges = () => {
        if (preferences && preferences.length > 0) {
            const prefsMap = {};
            preferences.forEach(pref => {
                prefsMap[pref.notificationType] = {
                    emailEnabled: pref.emailEnabled,
                    pushEnabled: pref.pushEnabled,
                    inAppEnabled: pref.inAppEnabled
                };
            });
            setLocalPreferences(prefsMap);
        } else {
            initializeDefaultPreferences();
        }
        setIsDirty(false);
    };

    // Define notification types based on API documentation
    const notificationTypes = [
        {
            key: 'EVENT_REGISTRATION',
            label: 'Event Registration Confirmations',
            description: 'Confirmations when you register for events',
            icon: CalendarIcon,
            category: 'Event Notifications'
        },
        {
            key: 'EVENT_REMINDER',
            label: 'Event Reminders',
            description: 'Reminders before your events start',
            icon: BellIcon,
            category: 'Event Notifications'
        },
        {
            key: 'EVENT_CANCELLATION',
            label: 'Event Cancellations',
            description: 'Notifications when events are cancelled',
            icon: XCircleIcon,
            category: 'Event Notifications'
        },
        {
            key: 'EVENT_UPDATE',
            label: 'Event Updates',
            description: 'Notifications when event details change',
            icon: PencilSquareIcon,
            category: 'Event Notifications'
        },
        {
            key: 'VENUE_CHANGE',
            label: 'Venue Changes',
            description: 'Notifications when event venues change',
            icon: MapPinIcon,
            category: 'Event Notifications'
        },
        {
            key: 'SYSTEM_ANNOUNCEMENT',
            label: 'System Announcements',
            description: 'Important platform announcements and updates',
            icon: MegaphoneIcon,
            category: 'System Notifications'
        }
    ];

    // Group notification types by category
    const groupedNotificationTypes = notificationTypes.reduce((acc, type) => {
        if (!acc[type.category]) {
            acc[type.category] = [];
        }
        acc[type.category].push(type);
        return acc;
    }, {});

    // Custom Switch component
    const NotificationSwitch = ({ enabled, onChange, disabled = false }) => (
        <Switch
            checked={enabled}
            onChange={onChange}
            disabled={disabled}
            className={`${
                enabled ? 'bg-primary-600' : 'bg-neutral-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            <span
                className={`${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </Switch>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">Notification Preferences</h2>
                <p className="mt-1 text-neutral-600">
                    Choose how you want to receive notifications across different channels.
                </p>
            </div>

            {/* Channel Description */}
            <Card>
                <Card.Body>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Channels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-neutral-900">Email</h4>
                                <p className="text-sm text-neutral-600">Receive notifications via email</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-neutral-900">Push</h4>
                                <p className="text-sm text-neutral-600">Browser and mobile push notifications</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <BellIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-neutral-900">In-App</h4>
                                <p className="text-sm text-neutral-600">Notifications within the application</p>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Notification Types */}
            {Object.entries(groupedNotificationTypes).map(([category, types]) => (
                <Card key={category}>
                    <Card.Header>
                        <Card.Title>{category}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="space-y-6">
                            {types.map((type) => {
                                const currentPrefs = localPreferences[type.key] || {
                                    emailEnabled: true,
                                    pushEnabled: true,
                                    inAppEnabled: true
                                };

                                return (
                                    <div key={type.key} className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start space-x-3 mb-4">
                                            <div className="flex-shrink-0">
                                                <type.icon className="h-6 w-6 text-neutral-600" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-medium text-neutral-900">{type.label}</h4>
                                                <p className="text-sm text-neutral-600">{type.description}</p>
                                            </div>
                                        </div>

                                        <div className="ml-9 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700">Email</span>
                                                <NotificationSwitch
                                                    enabled={currentPrefs.emailEnabled}
                                                    onChange={(value) => handleToggleChange(type.key, 'emailEnabled', value)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700">Push</span>
                                                <NotificationSwitch
                                                    enabled={currentPrefs.pushEnabled}
                                                    onChange={(value) => handleToggleChange(type.key, 'pushEnabled', value)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700">In-App</span>
                                                <NotificationSwitch
                                                    enabled={currentPrefs.inAppEnabled}
                                                    onChange={(value) => handleToggleChange(type.key, 'inAppEnabled', value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card.Body>
                </Card>
            ))}

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

            {/* Help Text */}
            <Card variant="info">
                <Card.Body>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Need Help?</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                You can customize how you receive notifications for each type of event.
                                Email notifications are sent to your registered email address, push notifications
                                appear on your device, and in-app notifications show up in your notification bell.
                            </p>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

export default NotificationPreferences;