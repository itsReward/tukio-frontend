import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import eventService from '../services/eventService';
import gamificationService from '../services/gamificationService';

// Components
import PointsDisplay from '../components/gamification/PointsDisplay';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

// Icons
import {
    UserCircleIcon,
    PencilIcon,
    ShieldCheckIcon,
    AcademicCapIcon,
    BuildingLibraryIcon,
    IdentificationIcon,
    EnvelopeIcon,
    LockClosedIcon,
    TagIcon,
    XMarkIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
    const { currentUser, isAuthenticated, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userEvents, setUserEvents] = useState([]);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [tagInput, setTagInput] = useState('');

    // Check if a specific section is targeted in the URL
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && ['profile', 'events', 'badges', 'security'].includes(hash)) {
            setActiveTab(hash);
        }
    }, [location]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!isAuthenticated || !currentUser?.id) {
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);

                // Fetch user details
                const userResponse = await authService.getUserById(currentUser.id);
                setUserData(userResponse.data);

                // Fetch user events
                const eventsResponse = await eventService.getRegistrationsByUser(currentUser.id);
                setUserEvents(eventsResponse.data);

            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [isAuthenticated, currentUser, navigate]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    // Start editing profile
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Cancel editing
    const handleCancel = () => {
        // Reset form data
        authService.getUserById(currentUser.id).then(response => {
            setUserData(response.data);
            setIsEditing(false);
        });
    };

    // Save profile changes
    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateUserProfile(userData);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    // Validate password
    const validatePassword = () => {
        const errors = {};
        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Change password
    const handleChangePassword = async () => {
        if (!validatePassword()) return;

        try {
            setIsChangingPassword(true);
            await authService.changePassword(currentUser.id, passwordData);
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            toast.success('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to change password');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle tag input
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    // Add interest tag
    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !userData.interests.includes(tagInput.trim())) {
            setUserData({
                ...userData,
                interests: [...userData.interests, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    // Remove interest tag
    const handleRemoveTag = (tag) => {
        setUserData({
            ...userData,
            interests: userData.interests.filter(t => t !== tag)
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader size="xl" />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">User Not Found</h2>
                    <p className="text-neutral-600 mb-6">Unable to load user profile.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 pb-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="py-8 flex items-center gap-6 flex-wrap">
                    <div className="bg-white p-4 rounded-full shadow-md">
                        {userData.profilePictureUrl ? (
                            <img
                                src={userData.profilePictureUrl}
                                alt={`${userData.firstName} ${userData.lastName}`}
                                className="h-24 w-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                <span className="text-2xl font-bold">
                                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">
                            {userData.firstName} {userData.lastName}
                        </h1>
                        <p className="text-neutral-600">@{userData.username}</p>
                        <p className="text-neutral-500 mt-1">
                            {userData.department ? `${userData.department}` : 'No department'}
                            {userData.graduationYear ? ` • Class of ${userData.graduationYear}` : ''}
                        </p>
                    </div>

                    <div className="ml-auto">
                        <PointsDisplay userId={userData.id} showButton={true} />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-neutral-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'profile'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                            }`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'events'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                            }`}
                        >
                            My Events
                        </button>
                        <button
                            onClick={() => setActiveTab('badges')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'badges'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                            }`}
                        >
                            Badges & Achievements
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'security'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                            }`}
                        >
                            Security
                        </button>
                    </nav>
                </div>

                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-neutral-900">Profile Information</h2>
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="text-primary-600 hover:text-primary-800 flex items-center"
                                >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancel}
                                        className="text-neutral-500 hover:text-neutral-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="text-primary-600 hover:text-primary-800 flex items-center"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader size="sm" color="primary" />
                                                <span className="ml-1">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <div className="flex items-center mb-1">
                                        <UserCircleIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            First Name
                                        </label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-input"
                                            value={userData.firstName}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <p className="text-neutral-900">{userData.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center mb-1">
                                        <UserCircleIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Last Name
                                        </label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-input"
                                            value={userData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <p className="text-neutral-900">{userData.lastName}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center mb-1">
                                        <EnvelopeIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Email
                                        </label>
                                    </div>
                                    <p className="text-neutral-900">{userData.email}</p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center mb-1">
                                        <IdentificationIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Username
                                        </label>
                                    </div>
                                    <p className="text-neutral-900">@{userData.username}</p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Username cannot be changed
                                    </p>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <div className="flex items-center mb-1">
                                        <BuildingLibraryIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Department
                                        </label>
                                    </div>
                                    {isEditing ? (
                                        <select
                                            name="department"
                                            className="form-select"
                                            value={userData.department || ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Business">Business</option>
                                            <option value="Arts & Humanities">Arts & Humanities</option>
                                            <option value="Sciences">Sciences</option>
                                            <option value="Medicine & Health">Medicine & Health</option>
                                            <option value="Education">Education</option>
                                            <option value="Law">Law</option>
                                            <option value="Social Sciences">Social Sciences</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="text-neutral-900">
                                            {userData.department || 'Not specified'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center mb-1">
                                        <AcademicCapIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Graduation Year
                                        </label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="graduationYear"
                                            className="form-input"
                                            min="2022"
                                            max="2030"
                                            value={userData.graduationYear || ''}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <p className="text-neutral-900">
                                            {userData.graduationYear || 'Not specified'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center mb-1">
                                        <ShieldCheckIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Roles
                                        </label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {userData.roles.map((role, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    {/* This could be additional info in the future */}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-8">
                                <div className="flex items-start mb-1">
                                    <UserCircleIcon className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" />
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Bio
                                    </label>
                                </div>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        rows={4}
                                        className="form-input"
                                        placeholder="Tell us about yourself..."
                                        value={userData.bio || ''}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p className="text-neutral-900 whitespace-pre-line">
                                        {userData.bio || 'No bio provided'}
                                    </p>
                                )}
                            </div>

                            {/* Interests */}
                            <div>
                                <div className="flex items-start mb-3">
                                    <TagIcon className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" />
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Interests
                                    </label>
                                </div>

                                {isEditing && (
                                    <form onSubmit={handleAddTag} className="flex space-x-2 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Add an interest"
                                            className="form-input flex-grow"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-outline"
                                        >
                                            Add
                                        </button>
                                    </form>
                                )}

                                {userData.interests && userData.interests.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {userData.interests.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
                                            >
                                                {tag}
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 flex-shrink-0 text-neutral-500 hover:text-neutral-700"
                                                    >
                                                        <span className="sr-only">Remove interest</span>
                                                        <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-neutral-500">No interests specified</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* My Events Tab Content */}
                {activeTab === 'events' && (
                    <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-200">
                            <h2 className="text-xl font-semibold text-neutral-900">My Events</h2>
                        </div>

                        <div className="p-6">
                            {userEvents.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Filter tabs */}
                                    <div className="flex border-b border-neutral-200">
                                        <button className="px-4 py-2 border-b-2 border-primary-500 text-primary-600 font-medium">
                                            Upcoming
                                        </button>
                                        <button className="px-4 py-2 text-neutral-500 hover:text-neutral-700">
                                            Past
                                        </button>
                                        <button className="px-4 py-2 text-neutral-500 hover:text-neutral-700">
                                            Created by Me
                                        </button>
                                    </div>

                                    {/* Event list */}
                                    <div className="divide-y divide-neutral-200">
                                        {userEvents.slice(0, 5).map((event) => (
                                            <div key={event.id} className="py-4 flex flex-col sm:flex-row sm:items-center">
                                                <div className="flex-grow">
                                                    <h3 className="text-lg font-medium text-neutral-900">
                                                        {event.title}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-1">
                                                        <span className="flex items-center">
                                                            <CalendarIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                                            {new Date(event.startTime).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <ClockIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                                            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <MapPinIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                                            {event.venueName || 'TBD'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:mt-0 flex items-center">
                                                    <span className={`mr-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        event.status === 'REGISTERED' ? 'bg-primary-100 text-primary-800' :
                                                            event.status === 'ATTENDED' ? 'bg-success-100 text-success-800' :
                                                                event.status === 'CANCELLED' ? 'bg-accent-100 text-accent-800' :
                                                                    'bg-neutral-100 text-neutral-800'
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                    <Link
                                                        to={`/events/${event.eventId}`}
                                                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                                    >
                                                        View Event
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {userEvents.length > 5 && (
                                        <div className="mt-6 text-center">
                                            <Link
                                                to="/events/my-events"
                                                className="text-primary-600 hover:text-primary-800 font-medium"
                                            >
                                                View all {userEvents.length} events
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                        <CalendarIcon className="h-8 w-8 text-neutral-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
                                    <p className="text-neutral-600 mb-4">
                                        You haven't registered for any events yet.
                                    </p>
                                    <Link
                                        to="/events"
                                        className="btn btn-primary"
                                    >
                                        Browse Events
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Badges Tab Content */}
                {activeTab === 'badges' && (
                    <div className="space-y-6">
                        {/* Badges Display */}
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200">
                                <h2 className="text-xl font-semibold text-neutral-900">My Badges</h2>
                            </div>

                            <div className="p-6">
                                <BadgeDisplay userId={userData.id} />
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-200">
                                <h2 className="text-xl font-semibold text-neutral-900">Achievements</h2>
                            </div>

                            <div className="p-6">
                                <div className="divide-y divide-neutral-200">
                                    {/* This would be actual achievements from the backend */}
                                    {[
                                        { name: "First Event", description: "Attended your first campus event", date: "Oct 15, 2023", points: 50 },
                                        { name: "Social Butterfly", description: "Attended 5 different event categories", date: "Nov 3, 2023", points: 100 },
                                        { name: "Feedback Champion", description: "Rated 10 events you attended", date: "Dec 17, 2023", points: 75 }
                                    ].map((achievement, index) => (
                                        <div key={index} className="py-4 flex items-start">
                                            <div className="mr-4 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                                🏆
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-medium text-neutral-900">
                                                    {achievement.name}
                                                </h3>
                                                <p className="text-neutral-600">
                                                    {achievement.description}
                                                </p>
                                                <div className="mt-1 flex items-center text-sm text-neutral-500">
                                                    <span>{achievement.date}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-primary-600">+{achievement.points} points</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab Content */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-200">
                            <h2 className="text-xl font-semibold text-neutral-900">Account Security</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Password Management */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900">Password</h3>
                                    <p className="text-neutral-600 text-sm">
                                        Change your account password
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="btn btn-outline"
                                >
                                    Change Password
                                </button>
                            </div>

                            <div className="border-t border-neutral-200 pt-6">
                                <h3 className="text-lg font-medium text-neutral-900 mb-3">Account Information</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <LockClosedIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                            <span className="text-neutral-700">Two-factor authentication</span>
                                        </div>
                                        <span className="text-accent-600">Not enabled</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <IdentificationIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                            <span className="text-neutral-700">Account type</span>
                                        </div>
                                        <span className="text-neutral-700">{userData.roles.includes('ADMIN') ? 'Administrator' : 'Standard User'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                            <span className="text-neutral-700">Account created</span>
                                        </div>
                                        <span className="text-neutral-700">
                                            {new Date(userData.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ClockIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                            <span className="text-neutral-700">Last updated</span>
                                        </div>
                                        <span className="text-neutral-700">
                                            {new Date(userData.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Password Change Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
            >
                <div className="p-5 space-y-4">
                    <p className="text-neutral-600 mb-4">
                        Please enter your current password and choose a new password.
                    </p>

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            className={`form-input ${passwordErrors.currentPassword ? 'border-accent-500' : ''}`}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                        />
                        {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-accent-600">{passwordErrors.currentPassword}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            className={`form-input ${passwordErrors.newPassword ? 'border-accent-500' : ''}`}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                        />
                        {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-accent-600">{passwordErrors.newPassword}</p>
                        )}
                        <p className="mt-1 text-xs text-neutral-500">
                            Password must be at least 8 characters long.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`form-input ${passwordErrors.confirmPassword ? 'border-accent-500' : ''}`}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                        />
                        {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-accent-600">{passwordErrors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleChangePassword}
                            className="btn btn-primary"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? (
                                <>
                                    <Loader size="sm" color="white" />
                                    <span className="ml-2">Changing...</span>
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;