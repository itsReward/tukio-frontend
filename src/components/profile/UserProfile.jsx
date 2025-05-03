import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import eventService from '../../services/eventService';

// Components
import Loader from '../common/Loader';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';
import Tabs from '../common/Tabs';
import BadgeDisplay from '../gamification/BadgeDisplay';
import LeaderboardPreview from '../gamification/LeaderboardPreview';

// Icons
import {
    UserCircleIcon,
    AcademicCapIcon,
    BuildingLibraryIcon,
    CalendarIcon,
    MapPinIcon,
    PencilIcon,
    ClockIcon,
    BriefcaseIcon,
    TagIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
    const { userId } = useParams();
    const { currentUser, isAuthenticated } = useAuth();

    const [user, setUser] = useState(null);
    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('about');

    // Determine if viewing own profile
    const isOwnProfile = isAuthenticated &&
        ((!userId && currentUser) || (userId === currentUser?.id.toString()));

    // Tabs configuration
    const tabs = [
        { id: 'about', label: 'About' },
        { id: 'events', label: 'Events' },
        { id: 'badges', label: 'Badges & Achievements' }
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Determine which ID to use
                const targetUserId = userId || (currentUser ? currentUser.id : null);

                if (!targetUserId) {
                    throw new Error('No user ID available');
                }

                // Fetch user profile
                const userResponse = await authService.getUserById(targetUserId);
                setUser(userResponse.data);

                // Fetch user events if viewing own profile
                if (isOwnProfile) {
                    const eventsResponse = await eventService.getRegistrationsByUser(targetUserId);
                    setUserEvents(eventsResponse.data || []);
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.response?.data?.message || 'Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, currentUser, isOwnProfile]);

    // Format date
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (error) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader size="lg" text="Loading profile..." />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Profile Not Found</h2>
                <p className="text-neutral-600 mb-6">{error || 'The requested user profile could not be found.'}</p>
                <Button variant="primary" as="link" to="/">
                    Return to Home
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-card border border-neutral-200 p-6 mb-6"
            >
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200">
                            {user.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-neutral-400">
                                    <UserCircleIcon className="h-20 w-20" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 mb-1">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-neutral-600">@{user.username}</p>
                            </div>

                            {isOwnProfile && (
                                <div className="mt-3 sm:mt-0">
                                    <Button
                                        variant="outline"
                                        icon={<PencilIcon className="h-5 w-5" />}
                                        iconPosition="left"
                                        as="link"
                                        to="/profile/edit"
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* User Meta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {user.department && (
                                <div className="flex items-center">
                                    <BuildingLibraryIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                    <span className="text-neutral-700">{user.department}</span>
                                </div>
                            )}

                            {user.graduationYear && (
                                <div className="flex items-center">
                                    <AcademicCapIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                    <span className="text-neutral-700">Class of {user.graduationYear}</span>
                                </div>
                            )}

                            {user.createdAt && (
                                <div className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 text-neutral-500 mr-2" />
                                    <span className="text-neutral-700">Member since {formatDate(user.createdAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Profile Content */}
            <div className="mb-6">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* About Tab */}
                {activeTab === 'about' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bio */}
                            <Card>
                                <Card.Header>
                                    <Card.Title>About</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    {user.bio ? (
                                        <p className="text-neutral-700 whitespace-pre-line">{user.bio}</p>
                                    ) : (
                                        <p className="text-neutral-500 italic">No bio provided yet.</p>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Interests */}
                            <Card>
                                <Card.Header>
                                    <Card.Title>Interests</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    {user.interests && user.interests.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {user.interests.map((interest, index) => (
                                                <Badge key={index} variant="default">
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-neutral-500 italic">No interests added yet.</p>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Stats */}
                            <Card>
                                <Card.Header>
                                    <Card.Title>Statistics</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Events Attended', value: '12', icon: CalendarIcon },
                                            { label: 'Events Created', value: '3', icon: PencilIcon },
                                            { label: 'Badges Earned', value: '8', icon: AcademicCapIcon },
                                            { label: 'Points', value: '570', icon: TagIcon }
                                        ].map((stat, index) => (
                                            <div key={index} className="text-center">
                                                <div className="flex justify-center mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <stat.icon className="h-5 w-5 text-primary-600" />
                                                    </div>
                                                </div>
                                                <div className="text-xl font-bold text-neutral-900">{stat.value}</div>
                                                <div className="text-sm text-neutral-600">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            {/* Badges Preview */}
                            <Card>
                                <Card.Header>
                                    <div className="flex justify-between items-center">
                                        <Card.Title>Recent Badges</Card.Title>
                                        <Button
                                            variant="link"
                                            onClick={() => setActiveTab('badges')}
                                            className="text-sm"
                                        >
                                            View All
                                        </Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <BadgeDisplay
                                        userId={user.id}
                                        limit={3}
                                        showRecent={true}
                                        layout="grid"
                                    />
                                </Card.Body>
                            </Card>

                            {/* Leaderboard Position */}
                            <Card>
                                <Card.Header>
                                    <Card.Title>Leaderboard Position</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <LeaderboardPreview
                                        userId={user.id}
                                        showUserRank={true}
                                        limit={1}
                                    />
                                </Card.Body>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <Card.Header>
                                <Card.Title>Events</Card.Title>
                                {isOwnProfile && (
                                    <Card.Subtitle>
                                        Here are the events you have registered for or attended.
                                    </Card.Subtitle>
                                )}
                            </Card.Header>
                            <Card.Body>
                                {isOwnProfile ? (
                                    userEvents.length > 0 ? (
                                        <div className="divide-y divide-neutral-200">
                                            {userEvents.map((event) => (
                                                <div key={event.id} className="py-4 first:pt-0 last:pb-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                                        <div className="flex-grow">
                                                            <Link
                                                                to={`/events/${event.eventId}`}
                                                                className="text-lg font-semibold text-neutral-900 hover:text-primary-600"
                                                            >
                                                                {event.eventTitle}
                                                            </Link>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-neutral-600">
                                <span className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                    {formatDate(event.startTime)}
                                </span>
                                                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                                                    {format(new Date(event.startTime), 'h:mm a')}
                                </span>
                                                                <span className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1" />
                                                                    {event.location || 'No location specified'}
                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 sm:mt-0 ml-0 sm:ml-4 flex items-center">
                                                            <Badge
                                                                variant={
                                                                    event.status === 'REGISTERED' ? 'primary' :
                                                                        event.status === 'ATTENDED' ? 'success' :
                                                                            event.status === 'CANCELLED' ? 'accent' : 'default'
                                                                }
                                                            >
                                                                {event.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                                <CalendarIcon className="h-8 w-8 text-neutral-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">No events found</h3>
                                            <p className="text-neutral-600 mb-4">
                                                You haven't registered for any events yet.
                                            </p>
                                            <Button
                                                variant="primary"
                                                as="link"
                                                to="/events"
                                            >
                                                Browse Events
                                            </Button>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                            <BriefcaseIcon className="h-8 w-8 text-neutral-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                            {user.firstName}'s events are private
                                        </h3>
                                        <p className="text-neutral-600">
                                            Event information is only visible to the user themselves.
                                        </p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <Card.Header>
                                <Card.Title>Badges & Achievements</Card.Title>
                                <Card.Subtitle>
                                    Badges earned through participation in campus events and activities.
                                </Card.Subtitle>
                            </Card.Header>
                            <Card.Body>
                                <BadgeDisplay
                                    userId={user.id}
                                    layout="grid"
                                    emptyMessage={`${isOwnProfile ? 'You haven\'t' : `${user.firstName} hasn't`} earned any badges yet. Participate in events to earn badges!`}
                                />
                            </Card.Body>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;