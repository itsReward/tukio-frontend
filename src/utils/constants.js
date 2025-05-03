/**
 * Application Constants
 *
 * This file contains constants used throughout the application
 */

// API ENDPOINTS
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ROUTE PATHS
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    EVENTS: '/events',
    EVENT_DETAIL: '/events/:id',
    EVENT_CREATE: '/events/create',
    EVENT_EDIT: '/events/:id/edit',
    VENUES: '/venues',
    VENUE_DETAIL: '/venues/:id',
    PROFILE: '/profile',
    PROFILE_EDIT: '/profile/edit',
    LEADERBOARD: '/leaderboard',
    SETTINGS: '/settings',
    NOT_FOUND: '*',
};

// LOCAL STORAGE KEYS
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
};

// USER ROLES
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    EVENT_ORGANIZER: 'EVENT_ORGANIZER',
    FACULTY: 'FACULTY',
    STUDENT: 'STUDENT',
};

// EVENT STATUSES
export const EVENT_STATUSES = {
    SCHEDULED: 'SCHEDULED',
    RESCHEDULED: 'RESCHEDULED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    DRAFT: 'DRAFT',
};

// REGISTRATION STATUSES
export const REGISTRATION_STATUSES = {
    REGISTERED: 'REGISTERED',
    ATTENDED: 'ATTENDED',
    CANCELLED: 'CANCELLED',
    WAITLISTED: 'WAITLISTED',
};

// VENUE TYPES
export const VENUE_TYPES = [
    { value: 'CLASSROOM', label: 'Classroom' },
    { value: 'LECTURE_HALL', label: 'Lecture Hall' },
    { value: 'AUDITORIUM', label: 'Auditorium' },
    { value: 'LAB', label: 'Laboratory' },
    { value: 'MEETING_ROOM', label: 'Meeting Room' },
    { value: 'CONFERENCE_ROOM', label: 'Conference Room' },
    { value: 'OUTDOOR_SPACE', label: 'Outdoor Space' },
    { value: 'SPORTS_FACILITY', label: 'Sports Facility' },
    { value: 'DINING_AREA', label: 'Dining Area' },
    { value: 'MULTIPURPOSE', label: 'Multipurpose Room' },
];

// COMMON FORM VALIDATION MESSAGES
export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    PASSWORDS_MUST_MATCH: 'Passwords must match',
    USERNAME_MIN_LENGTH: 'Username must be at least 3 characters',
    USERNAME_MAX_LENGTH: 'Username must not exceed 20 characters',
};

// ACTIVITY TYPES (for gamification)
export const ACTIVITY_TYPES = {
    VIEW: 'VIEW',
    REGISTER: 'REGISTER',
    ATTEND: 'ATTEND',
    RATE: 'RATE',
    SHARE: 'SHARE',
    FAVORITE: 'FAVORITE',
    CANCEL: 'CANCEL',
};

// DEPARTMENTS (for user profiles)
export const DEPARTMENTS = [
    { value: '', label: 'Select a department' },
    { value: 'computerScience', label: 'Computer Science' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business' },
    { value: 'arts', label: 'Arts & Humanities' },
    { value: 'science', label: 'Sciences' },
    { value: 'medicine', label: 'Medicine & Health' },
    { value: 'education', label: 'Education' },
    { value: 'law', label: 'Law' },
    { value: 'socialSciences', label: 'Social Sciences' },
    { value: 'other', label: 'Other' },
];

// PAGINATION DEFAULTS
export const PAGINATION = {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
    PAGE_SIZES: [5, 10, 25, 50, 100],
};

// DATE FORMATS
export const DATE_FORMATS = {
    DEFAULT: 'MMM dd, yyyy',
    WITH_TIME: 'MMM dd, yyyy • h:mm a',
    TIME_ONLY: 'h:mm a',
    DAY_MONTH: 'MMM dd',
    YEAR_MONTH_DAY: 'yyyy-MM-dd',
};

// THEME OPTIONS
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
};

// APP SETTINGS
export const APP_SETTINGS = {
    DEFAULT_THEME: THEMES.SYSTEM,
    DEFAULT_LANGUAGE: 'en',
};