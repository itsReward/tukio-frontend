import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';

// Components
import Tabs from '../components/common/Tabs';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

// Icons
import {
    UserCircleIcon,
    BellIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    CogIcon,
    AtSymbolIcon,
    PhoneIcon,
    CalendarIcon,
    AcademicCapIcon,
    BuildingLibraryIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
    const { currentUser, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [deleteAccountStep, setDeleteAccountStep] = useState(0);

    // Settings tabs configuration
    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: UserCircleIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon },
        { id: 'privacy', label: 'Privacy', icon: EyeIcon },
        { id: 'security', label: 'Security', icon: ShieldCheckIcon },
        { id: 'account', label: 'Account', icon: CogIcon },
    ];

    // Profile Settings Form
    const profileForm = useFormik({
        initialValues: {
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
            email: currentUser?.email || '',
            bio: currentUser?.bio || '',
            phone: currentUser?.phone || '',
            department: currentUser?.department || '',
            graduationYear: currentUser?.graduationYear || '',
            address: currentUser?.address || '',
            interests: currentUser?.interests?.join(', ') || '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('First name is required'),
            lastName: Yup.string().required('Last name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            bio: Yup.string().max(500, 'Bio must be 500 characters or less'),
            phone: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
            graduationYear: Yup.number().nullable().typeError('Must be a valid year').min(1900).max(2100),
        }),
        onSubmit: async (values) => {
            try {
                setSaving(true);

                // Convert comma-separated interests to array
                const formattedValues = {
                    ...values,
                    interests: values.interests ? values.interests.split(',').map(i => i.trim()).filter(Boolean) : []
                };

                await userService.updateUserProfile(currentUser.id, formattedValues);

                // Update the user in context
                updateUser({
                    ...currentUser,
                    ...formattedValues
                });

                toast.success('Profile updated successfully');
            } catch (error) {
                console.error('Failed to update profile:', error);
                toast.error('Failed to update profile');
            } finally {
                setSaving(false);
            }
        }
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        eventReminders: true,
        eventUpdates: true,
        eventInvitations: true,
        systemAnnouncements: true,
        marketingEmails: false,
    });

    // Privacy Settings
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        eventParticipation: 'friends',
        allowTagging: true,
        showBadges: true,
    });

    // Security Settings Form
    const securityForm = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string().required('Current password is required'),
            newPassword: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
                .required('New password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                .required('Password confirmation is required'),
        }),
        onSubmit: async (values) => {
            try {
                setSaving(true);

                await userService.changePassword(
                    currentUser.id,
                    values.currentPassword,
                    values.newPassword
                );

                toast.success('Password changed successfully');
                securityForm.resetForm();
            } catch (error) {
                console.error('Failed to change password:', error);
                toast.error(error.response?.data?.message || 'Failed to change password');
            } finally {
                setSaving(false);
            }
        }
    });

    // Save notification preferences
    const saveNotificationPreferences = async () => {
        try {
            setSaving(true);

            await userService.updateNotificationSettings(currentUser.id, notificationSettings);

            toast.success('Notification preferences updated');
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
            toast.error('Failed to update notification preferences');
        } finally {
            setSaving(false);
        }
    };

    // Save privacy settings
    const savePrivacySettings = async () => {
        try {
            setSaving(true);

            await userService.updatePrivacySettings(currentUser.id, privacySettings);

            toast.success('Privacy settings updated');
        } catch (error) {
            console.error('Failed to update privacy settings:', error);
            toast.error('Failed to update privacy settings');
        } finally {
            setSaving(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (deleteAccountStep === 2) {
            try {
                setSaving(true);

                await userService.deleteAccount(currentUser.id);

                toast.success('Your account has been deleted');

                // Log the user out
                await logout();

                // Navigate to home page
                navigate('/');
            } catch (error) {
                console.error('Failed to delete account:', error);
                toast.error('Failed to delete account');
                setSaving(false);
            }
        } else {
            setDeleteAccountStep(deleteAccountStep + 1);
        }
    };

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
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3 }
        }
    };

    // Initial data loading
    useEffect(() => {
        const loadSettingsData = async () => {
            try {
                setLoading(true);

                // In a real application, we would fetch these settings from the backend
                // Simulating API call with a timeout
                setTimeout(() => {
                    // Let's assume these settings come from the API
                    setNotificationSettings({
                        emailNotifications: true,
                        pushNotifications: true,
                        eventReminders: true,
                        eventUpdates: true,
                        eventInvitations: true,
                        systemAnnouncements: true,
                        marketingEmails: false,
                    });

                    setPrivacySettings({
                        profileVisibility: 'public',
                        showEmail: false,
                        showPhone: false,
                        eventParticipation: 'friends',
                        allowTagging: true,
                        showBadges: true,
                    });

                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Failed to load settings:', error);
                toast.error('Failed to load settings');
                setLoading(false);
            }
        };

        loadSettingsData();
    }, [currentUser]);

    // If loading, show a loader
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader size="lg" text="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">Account Settings</h1>

            {/* Tabs */}
            <div className="mb-8">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    iconPosition="left"
                />
            </div>

            {/* Tab Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Personal Information</Card.Title>
                                <Card.Subtitle>
                                    Update your personal details and profile information
                                </Card.Subtitle>
                            </Card.Header>
                            <Card.Body>
                                <form onSubmit={profileForm.handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name */}
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">
                                                First Name *
                                            </label>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                className={`form-input w-full rounded-md ${
                                                    profileForm.touched.firstName && profileForm.errors.firstName
                                                        ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                }`}
                                                value={profileForm.values.firstName}
                                                onChange={profileForm.handleChange}
                                                onBlur={profileForm.handleBlur}
                                            />
                                            {profileForm.touched.firstName && profileForm.errors.firstName && (
                                                <p className="mt-1 text-sm text-accent-600">{profileForm.errors.firstName}</p>
                                            )}
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Last Name *
                                            </label>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                className={`form-input w-full rounded-md ${
                                                    profileForm.touched.lastName && profileForm.errors.lastName
                                                        ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                }`}
                                                value={profileForm.values.lastName}
                                                onChange={profileForm.handleChange}
                                                onBlur={profileForm.handleBlur}
                                            />
                                            {profileForm.touched.lastName && profileForm.errors.lastName && (
                                                <p className="mt-1 text-sm text-accent-600">{profileForm.errors.lastName}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <AtSymbolIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    className={`form-input pl-10 w-full rounded-md ${
                                                        profileForm.touched.email && profileForm.errors.email
                                                            ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                    }`}
                                                    value={profileForm.values.email}
                                                    onChange={profileForm.handleChange}
                                                    onBlur={profileForm.handleBlur}
                                                />
                                            </div>
                                            {profileForm.touched.email && profileForm.errors.email && (
                                                <p className="mt-1 text-sm text-accent-600">{profileForm.errors.email}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <PhoneIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    className={`form-input pl-10 w-full rounded-md ${
                                                        profileForm.touched.phone && profileForm.errors.phone
                                                            ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                    }`}
                                                    value={profileForm.values.phone}
                                                    onChange={profileForm.handleChange}
                                                    onBlur={profileForm.handleBlur}
                                                />
                                            </div>
                                            {profileForm.touched.phone && profileForm.errors.phone && (
                                                <p className="mt-1 text-sm text-accent-600">{profileForm.errors.phone}</p>
                                            )}
                                        </div>

                                        {/* Department */}
                                        <div>
                                            <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Department
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <BuildingLibraryIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="department"
                                                    name="department"
                                                    type="text"
                                                    className="form-input pl-10 w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                                    value={profileForm.values.department}
                                                    onChange={profileForm.handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Graduation Year */}
                                        <div>
                                            <label htmlFor="graduationYear" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Graduation Year
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <AcademicCapIcon className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    id="graduationYear"
                                                    name="graduationYear"
                                                    type="number"
                                                    className={`form-input pl-10 w-full rounded-md ${
                                                        profileForm.touched.graduationYear && profileForm.errors.graduationYear
                                                            ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                    }`}
                                                    value={profileForm.values.graduationYear}
                                                    onChange={profileForm.handleChange}
                                                    onBlur={profileForm.handleBlur}
                                                />
                                            </div>
                                            {profileForm.touched.graduationYear && profileForm.errors.graduationYear && (
                                                <p className="mt-1 text-sm text-accent-600">{profileForm.errors.graduationYear}</p>
                                            )}
                                        </div>

                                        {/* Interests */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="interests" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Interests (comma separated)
                                            </label>
                                            <input
                                                id="interests"
                                                name="interests"
                                                type="text"
                                                className="form-input w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                                                value={profileForm.values.interests}
                                                onChange={profileForm.handleChange}
                                                placeholder="e.g. Sports, Music, Technology"
                                            />
                                            <p className="mt-1 text-sm text-neutral-500">
                                                Enter your interests separated by commas
                                            </p>
                                        </div>

                                        {/* Bio */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                                                Bio
                                            </label>
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                rows={4}
                                                className={`form-textarea w-full rounded-md ${
                                                    profileForm.touched.bio && profileForm.errors.bio
                                                        ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                }`}
                                                value={profileForm.values.bio}
                                                onChange={profileForm.handleChange}
                                                onBlur={profileForm.handleBlur}
                                                placeholder="Tell us about yourself..."
                                            />
                                            {profileForm.touched.bio && profileForm.errors.bio ? (
                                                <p className="mt-1 text-sm text-accent-600">{profileForm.errors.bio}</p>
                                            ) : (
                                                <p className="mt-1 text-sm text-neutral-500">
                                                    {500 - (profileForm.values.bio?.length || 0)} characters remaining
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => profileForm.resetForm()}
                                            disabled={saving}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            isLoading={saving}
                                            disabled={!profileForm.dirty || !profileForm.isValid || saving}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Notification Preferences</Card.Title>
                                <Card.Subtitle>
                                    Manage how and when you receive notifications
                                </Card.Subtitle>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-6">
                                    {/* Notification Channels */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Notification Channels</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="emailNotifications" className="font-medium text-neutral-800">
                                                        Email Notifications
                                                    </label>
                                                    <p className="text-sm text-neutral-500">Receive notifications via email</p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="emailNotifications"
                                                        name="emailNotifications"
                                                        className="toggle"
                                                        checked={notificationSettings.emailNotifications}
                                                        onChange={() => setNotificationSettings({
                                                            ...notificationSettings,
                                                            emailNotifications: !notificationSettings.emailNotifications
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="pushNotifications" className="font-medium text-neutral-800">
                                                        Push Notifications
                                                    </label>
                                                    <p className="text-sm text-neutral-500">Receive notifications in your browser</p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="pushNotifications"
                                                        name="pushNotifications"
                                                        className="toggle"
                                                        checked={notificationSettings.pushNotifications}
                                                        onChange={() => setNotificationSettings({
                                                            ...notificationSettings,
                                                            pushNotifications: !notificationSettings.pushNotifications
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Notification Types */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Notification Types</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="eventReminders" className="font-medium text-neutral-800">
                                                        Event Reminders
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Notifications for events you're registered for
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="eventReminders"
                                                        name="eventReminders"
                                                        className="toggle"
                                                        checked={notificationSettings.eventReminders}
                                                        onChange={() => setNotificationSettings({
                                                            ...notificationSettings,
                                                            eventReminders: !notificationSettings.eventReminders
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="eventUpdates" className="font-medium text-neutral-800">
                                                        Event Updates
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Changes or updates to events you're registered for
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="eventUpdates"
                                                        name="eventUpdates"
                                                        className="toggle"
                                                        checked={notificationSettings.eventUpdates}
                                                        onChange={() => setNotificationSettings({
                                                            ...notificationSettings,
                                                            eventUpdates: !notificationSettings.eventUpdates
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="eventInvitations" className="font-medium text-neutral-800">
                                                        Event Invitations
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        When someone invites you to an event
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="eventInvitations"
                                                        name="eventInvitations"
                                                        className="toggle"
                                                        checked={notificationSettings.eventInvitations}
                                                        onChange={() => setNotificationSettings({
                                                            ...notificationSettings,
                                                            eventInvitations: !notificationSettings.eventInvitations
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="marketingEmails" className="font-medium text-neutral-800">
                                                        Marketing Emails
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Newsletters, promotions, and feature updates
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="marketingEmails"
                                                        name="marketingEmails"
                                                        className="toggle"
                                                        checked={notificationSettings.marketingEmails}
                                                        onChange={() => setNotificationSettings({
                                                            ...notificationSettings,
                                                            marketingEmails: !notificationSettings.marketingEmails
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            variant="primary"
                                            onClick={saveNotificationPreferences}
                                            isLoading={saving}
                                            disabled={saving}
                                        >
                                            Save Preferences
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Privacy Settings</Card.Title>
                                <Card.Subtitle>
                                    Control who can see your information and how it's used
                                </Card.Subtitle>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-6">
                                    {/* Profile Visibility */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Profile Visibility</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    id="profile-public"
                                                    name="profileVisibility"
                                                    type="radio"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                    checked={privacySettings.profileVisibility === 'public'}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        profileVisibility: 'public'
                                                    })}
                                                />
                                                <label htmlFor="profile-public" className="ml-3 block text-neutral-700">
                                                    <span className="font-medium">Public</span>
                                                    <p className="text-sm text-neutral-500">Anyone can view your profile</p>
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="profile-friends"
                                                    name="profileVisibility"
                                                    type="radio"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                    checked={privacySettings.profileVisibility === 'friends'}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        profileVisibility: 'friends'
                                                    })}
                                                />
                                                <label htmlFor="profile-friends" className="ml-3 block text-neutral-700">
                                                    <span className="font-medium">Friends Only</span>
                                                    <p className="text-sm text-neutral-500">Only your connections can view your profile</p>
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="profile-private"
                                                    name="profileVisibility"
                                                    type="radio"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                    checked={privacySettings.profileVisibility === 'private'}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        profileVisibility: 'private'
                                                    })}
                                                />
                                                <label htmlFor="profile-private" className="ml-3 block text-neutral-700">
                                                    <span className="font-medium">Private</span>
                                                    <p className="text-sm text-neutral-500">Only you can view your full profile</p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Contact Information</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="showEmail" className="font-medium text-neutral-800">
                                                        Show Email Address
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Show your email address to other users
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="showEmail"
                                                        name="showEmail"
                                                        className="toggle"
                                                        checked={privacySettings.showEmail}
                                                        onChange={() => setPrivacySettings({
                                                            ...privacySettings,
                                                            showEmail: !privacySettings.showEmail
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="showPhone" className="font-medium text-neutral-800">
                                                        Show Phone Number
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Show your phone number to other users
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="showPhone"
                                                        name="showPhone"
                                                        className="toggle"
                                                        checked={privacySettings.showPhone}
                                                        onChange={() => setPrivacySettings({
                                                            ...privacySettings,
                                                            showPhone: !privacySettings.showPhone
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Event Participation */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Event Participation</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    id="event-public"
                                                    name="eventParticipation"
                                                    type="radio"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                    checked={privacySettings.eventParticipation === 'public'}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        eventParticipation: 'public'
                                                    })}
                                                />
                                                <label htmlFor="event-public" className="ml-3 block text-neutral-700">
                                                    <span className="font-medium">Public</span>
                                                    <p className="text-sm text-neutral-500">Anyone can see events you've registered for or attended</p>
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="event-friends"
                                                    name="eventParticipation"
                                                    type="radio"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                    checked={privacySettings.eventParticipation === 'friends'}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        eventParticipation: 'friends'
                                                    })}
                                                />
                                                <label htmlFor="event-friends" className="ml-3 block text-neutral-700">
                                                    <span className="font-medium">Friends Only</span>
                                                    <p className="text-sm text-neutral-500">Only your connections can see your event activity</p>
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="event-private"
                                                    name="eventParticipation"
                                                    type="radio"
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                    checked={privacySettings.eventParticipation === 'private'}
                                                    onChange={() => setPrivacySettings({
                                                        ...privacySettings,
                                                        eventParticipation: 'private'
                                                    })}
                                                />
                                                <label htmlFor="event-private" className="ml-3 block text-neutral-700">
                                                    <span className="font-medium">Private</span>
                                                    <p className="text-sm text-neutral-500">Only you can see your event activity</p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Other Privacy Settings */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Other Privacy Settings</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="allowTagging" className="font-medium text-neutral-800">
                                                        Allow Tagging
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Allow others to tag you in event photos and posts
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="allowTagging"
                                                        name="allowTagging"
                                                        className="toggle"
                                                        checked={privacySettings.allowTagging}
                                                        onChange={() => setPrivacySettings({
                                                            ...privacySettings,
                                                            allowTagging: !privacySettings.allowTagging
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="showBadges" className="font-medium text-neutral-800">
                                                        Show Badges
                                                    </label>
                                                    <p className="text-sm text-neutral-500">
                                                        Display earned badges and achievements on your profile
                                                    </p>
                                                </div>
                                                <div className="relative inline-block w-12 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        id="showBadges"
                                                        name="showBadges"
                                                        className="toggle"
                                                        checked={privacySettings.showBadges}
                                                        onChange={() => setPrivacySettings({
                                                            ...privacySettings,
                                                            showBadges: !privacySettings.showBadges
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            variant="primary"
                                            onClick={savePrivacySettings}
                                            isLoading={saving}
                                            disabled={saving}
                                        >
                                            Save Privacy Settings
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Security Settings</Card.Title>
                                <Card.Subtitle>
                                    Manage your password and account security
                                </Card.Subtitle>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-6">
                                    {/* Change Password */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Change Password</h3>
                                        <form onSubmit={securityForm.handleSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                                                    Current Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="currentPassword"
                                                        name="currentPassword"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        className={`form-input w-full rounded-md pr-10 ${
                                                            securityForm.touched.currentPassword && securityForm.errors.currentPassword
                                                                ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                        }`}
                                                        value={securityForm.values.currentPassword}
                                                        onChange={securityForm.handleChange}
                                                        onBlur={securityForm.handleBlur}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-neutral-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {securityForm.touched.currentPassword && securityForm.errors.currentPassword && (
                                                    <p className="mt-1 text-sm text-accent-600">{securityForm.errors.currentPassword}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                                                    New Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="newPassword"
                                                        name="newPassword"
                                                        type={showNewPassword ? "text" : "password"}
                                                        className={`form-input w-full rounded-md pr-10 ${
                                                            securityForm.touched.newPassword && securityForm.errors.newPassword
                                                                ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                        }`}
                                                        value={securityForm.values.newPassword}
                                                        onChange={securityForm.handleChange}
                                                        onBlur={securityForm.handleBlur}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-neutral-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {securityForm.touched.newPassword && securityForm.errors.newPassword && (
                                                    <p className="mt-1 text-sm text-accent-600">{securityForm.errors.newPassword}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                                                    Confirm New Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className={`form-input w-full rounded-md pr-10 ${
                                                            securityForm.touched.confirmPassword && securityForm.errors.confirmPassword
                                                                ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500'
                                                                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                                                        }`}
                                                        value={securityForm.values.confirmPassword}
                                                        onChange={securityForm.handleChange}
                                                        onBlur={securityForm.handleBlur}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5 text-neutral-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {securityForm.touched.confirmPassword && securityForm.errors.confirmPassword && (
                                                    <p className="mt-1 text-sm text-accent-600">{securityForm.errors.confirmPassword}</p>
                                                )}
                                            </div>

                                            <div className="pt-2">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    isLoading={saving}
                                                    disabled={!securityForm.dirty || !securityForm.isValid || saving}
                                                >
                                                    Change Password
                                                </Button>
                                            </div>
                                        </form>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Two-Factor Authentication */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-neutral-900">Two-Factor Authentication</h3>
                                            <Badge variant="success">Recommended</Badge>
                                        </div>

                                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <ShieldCheckIcon className="h-5 w-5 text-success-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-neutral-700">
                                                        Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            icon={<LockClosedIcon className="h-5 w-5" />}
                                            iconPosition="left"
                                        >
                                            Enable Two-Factor Authentication
                                        </Button>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Active Sessions */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Active Sessions</h3>
                                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                            <div className="bg-neutral-50 px-4 py-3 flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
                                                    <CheckCircleIcon className="h-6 w-6 text-success-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-neutral-900">Current Session</div>
                                                    <div className="text-xs text-neutral-500">
                                                        {`${navigator.platform} · ${navigator.userAgent.includes('Chrome') ? 'Chrome' :
                                                            navigator.userAgent.includes('Firefox') ? 'Firefox' :
                                                                navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown Browser'}`}
                                                    </div>
                                                </div>
                                                <div className="ml-auto text-xs text-neutral-500">
                                                    Active now
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                icon={<ArrowPathIcon className="h-5 w-5" />}
                                                iconPosition="left"
                                            >
                                                Log Out All Other Sessions
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}

                {/* Account Settings */}
                {activeTab === 'account' && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Account Settings</Card.Title>
                                <Card.Subtitle>
                                    Manage your account and data
                                </Card.Subtitle>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-6">
                                    {/* Account Information */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Account Information</h3>
                                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                            <div>
                                                <dt className="text-sm font-medium text-neutral-500">User ID</dt>
                                                <dd className="mt-1 text-neutral-900">{currentUser?.id || 'N/A'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-neutral-500">Account Type</dt>
                                                <dd className="mt-1 text-neutral-900">
                                                    <Badge variant="primary">{currentUser?.role || 'Student'}</Badge>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-neutral-500">Account Created</dt>
                                                <dd className="mt-1 text-neutral-900">
                                                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-neutral-500">Last Updated</dt>
                                                <dd className="mt-1 text-neutral-900">
                                                    {currentUser?.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString() : 'N/A'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Data Management */}
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Data Management</h3>
                                        <div className="space-y-4">
                                            <Button
                                                variant="outline"
                                                icon={<ArrowPathIcon className="h-5 w-5" />}
                                                iconPosition="left"
                                            >
                                                Export Account Data
                                            </Button>
                                        </div>
                                    </div>

                                    <hr className="border-neutral-200" />

                                    {/* Danger Zone */}
                                    <div>
                                        <h3 className="text-lg font-medium text-accent-600 mb-4">Danger Zone</h3>
                                        <div className="bg-neutral-50 border border-accent-300 rounded-lg p-4">
                                            <h4 className="text-base font-medium text-neutral-900 mb-2">Delete Account</h4>
                                            <p className="text-sm text-neutral-700 mb-4">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>

                                            {deleteAccountStep === 0 ? (
                                                <Button
                                                    variant="accent"
                                                    icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                                                    iconPosition="left"
                                                    onClick={() => setDeleteAccountStep(1)}
                                                >
                                                    Delete Account
                                                </Button>
                                            ) : deleteAccountStep === 1 ? (
                                                <div>
                                                    <p className="text-sm text-accent-600 mb-3">
                                                        Are you sure? All of your data will be permanently removed. This action cannot be undone.
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setDeleteAccountStep(0)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="accent"
                                                            onClick={() => setDeleteAccountStep(2)}
                                                        >
                                                            Yes, Delete My Account
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-accent-600 font-medium mb-3">
                                                        Final confirmation: This will permanently delete your account and all associated data.
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setDeleteAccountStep(0)}
                                                        >
                                                            Keep My Account
                                                        </Button>
                                                        <Button
                                                            variant="accent"
                                                            isLoading={saving}
                                                            onClick={handleDeleteAccount}
                                                        >
                                                            Permanently Delete Account
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default SettingsPage;