import { format, formatDistance, formatRelative, differenceInDays, isToday, isTomorrow, isYesterday, isSameWeek, addDays } from 'date-fns';
import { DATE_FORMATS } from './constants';

/**
 * Date and time utility functions
 */

/**
 * Format a date string using date-fns
 * @param {string|Date} date - The date to format
 * @param {string} formatString - The format string (from date-fns)
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatString = DATE_FORMATS.DEFAULT) => {
    if (!date) return '';

    try {
        return format(new Date(date), formatString);
    } catch (error) {
        console.error('Date formatting error:', error);
        return String(date);
    }
};

/**
 * Format a date string with time using date-fns
 * @param {string|Date} date - The date to format
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date) => {
    return formatDate(date, DATE_FORMATS.WITH_TIME);
};

/**
 * Format time only from a date string
 * @param {string|Date} date - The date to extract and format time from
 * @returns {string} The formatted time string
 */
export const formatTime = (date) => {
    return formatDate(date, DATE_FORMATS.TIME_ONLY);
};

/**
 * Get relative time string (e.g., "2 days ago", "in 5 hours")
 * @param {string|Date} date - The date to calculate relative time from
 * @param {Date} baseDate - The base date to compare with (defaults to now)
 * @returns {string} The relative time string
 */
export const getRelativeTime = (date, baseDate = new Date()) => {
    if (!date) return '';

    try {
        return formatDistance(new Date(date), baseDate, { addSuffix: true });
    } catch (error) {
        console.error('Relative time formatting error:', error);
        return String(date);
    }
};

/**
 * Get a human-friendly date string (Today, Tomorrow, Yesterday, or formatted date)
 * @param {string|Date} date - The date to format
 * @returns {string} The friendly date string
 */
export const getFriendlyDate = (date) => {
    if (!date) return '';

    try {
        const dateObj = new Date(date);

        if (isToday(dateObj)) {
            return 'Today';
        } else if (isTomorrow(dateObj)) {
            return 'Tomorrow';
        } else if (isYesterday(dateObj)) {
            return 'Yesterday';
        } else if (isSameWeek(dateObj, new Date())) {
            return formatRelative(dateObj, new Date()).split(' at ')[0];
        } else {
            return formatDate(dateObj);
        }
    } catch (error) {
        console.error('Friendly date formatting error:', error);
        return String(date);
    }
};

/**
 * Calculate duration between two dates in a human-readable format
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {string} The duration string (e.g., "2 hours", "3 days")
 */
export const getDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInDays = differenceInDays(end, start);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
        } else {
            const diffInHours = (end - start) / (1000 * 60 * 60);
            if (diffInHours >= 1) {
                const hours = Math.floor(diffInHours);
                const minutes = Math.round((diffInHours - hours) * 60);

                if (minutes > 0) {
                    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
                }
                return `${hours} hour${hours > 1 ? 's' : ''}`;
            } else {
                const diffInMinutes = Math.round((end - start) / (1000 * 60));
                return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
            }
        }
    } catch (error) {
        console.error('Duration calculation error:', error);
        return '';
    }
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isFutureDate = (date) => {
    if (!date) return false;

    try {
        return new Date(date) > new Date();
    } catch (error) {
        console.error('Date comparison error:', error);
        return false;
    }
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date) => {
    if (!date) return false;

    try {
        return new Date(date) < new Date();
    } catch (error) {
        console.error('Date comparison error:', error);
        return false;
    }
};

/**
 * Get upcoming dates for the next x days
 * @param {number} days - Number of upcoming days to get
 * @returns {Array} Array of date objects for the upcoming days
 */
export const getUpcomingDays = (days = 7) => {
    const result = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        result.push(addDays(today, i));
    }

    return result;
};

/**
 * Format a date range (e.g., "Jan 1 - Jan 5, 2023" or "Jan 1, 2023 - Feb 1, 2023")
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {string} The formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Same day
        if (start.toDateString() === end.toDateString()) {
            return `${formatDate(start)} • ${formatTime(start)} - ${formatTime(end)}`;
        }

        // Same year
        if (start.getFullYear() === end.getFullYear()) {
            return `${format(start, 'MMM d')} - ${formatDate(end)}`;
        }

        // Different years
        return `${formatDate(start)} - ${formatDate(end)}`;
    } catch (error) {
        console.error('Date range formatting error:', error);
        return '';
    }
};