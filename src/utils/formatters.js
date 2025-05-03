/**
 * Various formatting utility functions
 */

/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number string with commas
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a number as currency (USD by default)
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US') => {
    if (amount === null || amount === undefined) return '';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

/**
 * Format a percentage
 * @param {number} value - The decimal value to format as percentage
 * @param {number} decimalPlaces - Number of decimal places to show
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimalPlaces = 0) => {
    if (value === null || value === undefined) return '';

    return `${(value * 100).toFixed(decimalPlaces)}%`;
};

/**
 * Truncate text to a specified length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
    if (!str) return '';

    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Format a phone number to a standard format
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';

    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }

    // Return original if not a standard format
    return phoneNumber;
};

/**
 * Format an email address with obfuscation for privacy
 * @param {string} email - The email to format
 * @param {boolean} obfuscate - Whether to obfuscate part of the email
 * @returns {string} Formatted email address
 */
export const formatEmail = (email, obfuscate = false) => {
    if (!email) return '';
    if (!obfuscate) return email;

    const parts = email.split('@');
    if (parts.length !== 2) return email;

    const username = parts[0];
    const domain = parts[1];

    // Obfuscate the username, keeping first and last characters
    if (username.length <= 2) {
        return email; // Too short to meaningfully obfuscate
    }

    const firstChar = username.charAt(0);
    const lastChar = username.charAt(username.length - 1);
    const obfuscatedUsername = `${firstChar}${'*'.repeat(username.length - 2)}${lastChar}`;

    return `${obfuscatedUsername}@${domain}`;
};

/**
 * Format a list of items as a comma-separated string with conjunction
 * @param {Array} items - The array of items to format
 * @param {string} conjunction - The conjunction to use (default: 'and')
 * @returns {string} Formatted list string
 */
export const formatList = (items, conjunction = 'and') => {
    if (!items || !items.length) return '';

    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, items.length - 1);

    return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
};

/**
 * Format a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param {number} num - The number to format
 * @returns {string} Number with ordinal suffix
 */
export const formatOrdinal = (num) => {
    if (num === null || num === undefined) return '';

    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder10 = num % 10;
    const remainder100 = num % 100;

    // Special case for 11, 12, 13
    if (remainder100 >= 11 && remainder100 <= 13) {
        return num + 'th';
    }

    return num + (suffixes[remainder10] || suffixes[0]);
};

/**
 * Format bytes as a string with the appropriate unit (B, KB, MB, etc.)
 * @param {number} bytes - The number of bytes
 * @returns {string} Formatted string with the appropriate unit
 */
export const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @param {boolean} showSeconds - Whether to show seconds in the output
 * @returns {string} Formatted duration string
 */
export const formatDuration = (ms, showSeconds = true) => {
    if (ms === null || ms === undefined) return '';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (showSeconds && seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
};

/**
 * Format a name (first name, last name) into different formats
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} format - Format type ('full', 'initials', 'firstInitialLast', 'lastFirstInitial')
 * @returns {string} Formatted name
 */
export const formatName = (firstName, lastName, format = 'full') => {
    if (!firstName && !lastName) return '';

    const first = firstName || '';
    const last = lastName || '';

    switch (format) {
        case 'full':
            return `${first} ${last}`.trim();
        case 'initials':
            return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase().trim();
        case 'firstInitialLast':
            return `${first.charAt(0)}. ${last}`.trim();
        case 'lastFirstInitial':
            return `${last}, ${first.charAt(0)}.`.trim();
        default:
            return `${first} ${last}`.trim();
    }
};