import { VALIDATION_MESSAGES } from './constants';

/**
 * Common validation utility functions
 */

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is empty
 */
export const isEmpty = (value) => {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
};

/**
 * Check if an email address is valid
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid
 */
export const isValidEmail = (email) => {
    if (isEmpty(email)) return false;

    // RFC 5322 compliant email regex (simplified)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Check if a password meets minimum complexity requirements
 * @param {string} password - The password to validate
 * @returns {boolean} True if the password meets requirements
 */
export const isStrongPassword = (password) => {
    if (isEmpty(password)) return false;
    if (password.length < 8) return false;

    // At least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Check if a phone number is valid
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if the phone number is valid
 */
export const isValidPhone = (phone) => {
    if (isEmpty(phone)) return false;

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it has 10 digits (US/Canada) or 11 digits starting with 1
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned.charAt(0) === '1');
};

/**
 * Check if a URL is valid
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is valid
 */
export const isValidUrl = (url) => {
    if (isEmpty(url)) return false;

    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Check if a date is valid
 * @param {string|Date} date - The date to validate
 * @returns {boolean} True if the date is valid
 */
export const isValidDate = (date) => {
    if (isEmpty(date)) return false;

    try {
        const d = new Date(date);
        return !isNaN(d.getTime());
    } catch (error) {
        return false;
    }
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isFutureDate = (date) => {
    if (!isValidDate(date)) return false;

    const dateObj = new Date(date);
    const now = new Date();

    return dateObj > now;
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date) => {
    if (!isValidDate(date)) return false;

    const dateObj = new Date(date);
    const now = new Date();

    return dateObj < now;
};

/**
 * Check if a value is a valid number
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is a valid number
 */
export const isNumber = (value) => {
    if (isEmpty(value)) return false;

    return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Check if a value is within a specified range
 * @param {number} value - The value to check
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {boolean} True if the value is within the range
 */
export const isInRange = (value, min, max) => {
    if (!isNumber(value)) return false;

    const num = parseFloat(value);
    return num >= min && num <= max;
};

/**
 * Check if a string matches a specific length
 * @param {string} str - The string to check
 * @param {number} length - The exact length required
 * @returns {boolean} True if the string matches the length
 */
export const hasExactLength = (str, length) => {
    if (isEmpty(str)) return false;

    return str.length === length;
};

/**
 * Check if a string has a minimum length
 * @param {string} str - The string to check
 * @param {number} minLength - The minimum length required
 * @returns {boolean} True if the string meets the minimum length
 */
export const hasMinLength = (str, minLength) => {
    if (isEmpty(str)) return false;

    return str.length >= minLength;
};

/**
 * Check if a string has a maximum length
 * @param {string} str - The string to check
 * @param {number} maxLength - The maximum length allowed
 * @returns {boolean} True if the string is within the maximum length
 */
export const hasMaxLength = (str, maxLength) => {
    if (isEmpty(str)) return true; // Empty strings are within any maximum length

    return str.length <= maxLength;
};

/**
 * Check if two values match (for password confirmation)
 * @param {*} value1 - The first value
 * @param {*} value2 - The second value to compare
 * @returns {boolean} True if the values match
 */
export const doValuesMatch = (value1, value2) => {
    return value1 === value2;
};

/**
 * Get validation error message for a field
 * @param {string} field - The field name
 * @param {string} type - The type of validation error
 * @returns {string} The validation error message
 */
export const getValidationMessage = (field, type) => {
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();

    switch (type) {
        case 'required':
            return `${fieldName} is required`;
        case 'email':
            return VALIDATION_MESSAGES.EMAIL_INVALID;
        case 'password':
            return VALIDATION_MESSAGES.PASSWORD_COMPLEXITY;
        case 'passwordMinLength':
            return VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
        case 'passwordsMatch':
            return VALIDATION_MESSAGES.PASSWORDS_MUST_MATCH;
        case 'minLength':
            return `${fieldName} is too short`;
        case 'maxLength':
            return `${fieldName} is too long`;
        case 'url':
            return `Please enter a valid URL`;
        case 'date':
            return `Please enter a valid date`;
        case 'futureDate':
            return `Date must be in the future`;
        case 'pastDate':
            return `Date must be in the past`;
        case 'phone':
            return `Please enter a valid phone number`;
        case 'number':
            return `Please enter a valid number`;
        case 'range':
            return `Value is outside the allowed range`;
        default:
            return `${fieldName} is invalid`;
    }
};