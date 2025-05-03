import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { DEPARTMENTS } from '../../utils/constants';

// Components
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';

// Icons
import {
    UserCircleIcon,
    AcademicCapIcon,
    BuildingLibraryIcon,
    LinkIcon,
    TagIcon,
    XMarkIcon,
    PhotoIcon,
    PencilIcon
} from '@heroicons/react/24/outline';

const ProfileEdit = () => {
    const navigate = useNavigate();
    const { currentUser, updateUserProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Validation schema
    const validationSchema = Yup.object({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        bio: Yup.string().max(500, 'Bio must be 500 characters or less'),
        department: Yup.string(),
        graduationYear: Yup.number().nullable().integer('Must be a valid year'),
        profilePictureUrl: Yup.string().url('Must be a valid URL').nullable()
    });

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            bio: '',
            department: '',
            graduationYear: null,
            profilePictureUrl: '',
            interests: []
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setSaving(true);
                const result = await updateUserProfile({
                    ...values,
                    id: currentUser.id
                });

                if (result.success) {
                    toast.success('Profile updated successfully');
                    navigate('/profile');
                } else {
                    toast.error(result.error || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                toast.error('An error occurred while updating your profile');
            } finally {
                setSaving(false);
            }
        }
    });

    // Load user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                if (!currentUser?.id) {
                    navigate('/login');
                    return;
                }

                const response = await authService.getUserById(currentUser.id);
                const userData = response.data;

                formik.setValues({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    bio: userData.bio || '',
                    department: userData.department || '',
                    graduationYear: userData.graduationYear || null,
                    profilePictureUrl: userData.profilePictureUrl || '',
                    interests: userData.interests || []
                });

                setAvatarPreview(userData.profilePictureUrl);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser, navigate]);

    // Handle tag input
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    // Add tag to interests
    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = tagInput.trim();
        if (tag && !formik.values.interests.includes(tag)) {
            formik.setFieldValue('interests', [...formik.values.interests, tag]);
            setTagInput('');
        }
    };

    // Remove tag from interests
    const handleRemoveTag = (tagToRemove) => {
        formik.setFieldValue(
            'interests',
            formik.values.interests.filter(tag => tag !== tagToRemove)
        );
    };

    // Handle avatar preview
    const handleAvatarUrlChange = (e) => {
        const url = e.target.value;
        formik.setFieldValue('profilePictureUrl', url);
        setAvatarPreview(url);
    };

    // Generate graduation year options
    const currentYear = new Date().getFullYear();
    const graduationYears = [];
    for (let year = currentYear - 5; year <= currentYear + 6; year++) {
        graduationYears.push(year);
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading profile data..." />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Edit Profile</h1>
                <p className="text-neutral-600">
                    Update your personal information and preferences.
                </p>
            </div>

            <form onSubmit={formik.handleSubmit}>
                <div className="space-y-6">
                    {/* Profile Picture */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Profile Picture</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-shrink-0">
                                    <div className="relative h-28 w-28 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Profile Preview"
                                                className="h-full w-full object-cover"
                                                onError={() => setAvatarPreview(null)}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-neutral-400">
                                                <PhotoIcon className="h-12 w-12" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div>
                                        <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-neutral-700 mb-1">
                                            Profile Picture URL
                                        </label>
                                        <input
                                            type="url"
                                            id="profilePictureUrl"
                                            name="profilePictureUrl"
                                            className="form-input"
                                            placeholder="https://example.com/your-image.jpg"
                                            value={formik.values.profilePictureUrl || ''}
                                            onChange={handleAvatarUrlChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.profilePictureUrl && formik.errors.profilePictureUrl && (
                                            <p className="mt-1 text-sm text-accent-600">{formik.errors.profilePictureUrl}</p>
                                        )}
                                        <p className="mt-1 text-xs text-neutral-500">
                                            Enter the URL of your profile picture. For best results, use a square image.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Basic Information</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className={`form-input ${
                                                formik.touched.firstName && formik.errors.firstName ? 'border-accent-500' : ''
                                            }`}
                                            value={formik.values.firstName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.firstName && formik.errors.firstName && (
                                            <p className="mt-1 text-sm text-accent-600">{formik.errors.firstName}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className={`form-input ${
                                                formik.touched.lastName && formik.errors.lastName ? 'border-accent-500' : ''
                                            }`}
                                            value={formik.values.lastName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.lastName && formik.errors.lastName && (
                                            <p className="mt-1 text-sm text-accent-600">{formik.errors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        className={`form-input ${
                                            formik.touched.bio && formik.errors.bio ? 'border-accent-500' : ''
                                        }`}
                                        placeholder="Tell us about yourself..."
                                        value={formik.values.bio || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {formik.touched.bio && formik.errors.bio ? (
                                            <p className="text-sm text-accent-600">{formik.errors.bio}</p>
                                        ) : (
                                            <div />
                                        )}
                                        <p className="text-xs text-neutral-500">
                                            {formik.values.bio?.length || 0}/500
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Academic Information</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Department */}
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        name="department"
                                        className="form-select"
                                        value={formik.values.department || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    >
                                        {DEPARTMENTS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Graduation Year */}
                                <div>
                                    <label htmlFor="graduationYear" className="block text-sm font-medium text-neutral-700 mb-1">
                                        Graduation Year
                                    </label>
                                    <select
                                        id="graduationYear"
                                        name="graduationYear"
                                        className="form-select"
                                        value={formik.values.graduationYear || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    >
                                        <option value="">Select Year</option>
                                        {graduationYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Interests */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Interests</Card.Title>
                            <Card.Subtitle>
                                Add your interests to help us personalize your event recommendations.
                            </Card.Subtitle>
                        </Card.Header>
                        <Card.Body>
                            <form onSubmit={handleAddTag} className="flex space-x-2 mb-3">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TagIcon className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add an interest..."
                                        className="form-input pl-10"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    Add
                                </Button>
                            </form>

                            {formik.values.interests && formik.values.interests.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formik.values.interests.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm"
                                        >
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 text-primary-600 hover:text-primary-800"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-neutral-500 text-sm">No interests added yet.</p>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline-neutral"
                            onClick={() => navigate('/profile')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            icon={<PencilIcon className="h-5 w-5" />}
                            iconPosition="left"
                            loading={saving}
                            disabled={saving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default ProfileEdit;