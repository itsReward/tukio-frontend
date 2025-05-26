// src/services/adminUserService.js - Fixed to use correct API endpoints
import api from './api';

const USER_ENDPOINTS = {
    USERS: 'tukio-user-service/api/users',
    AUTH: 'tukio-user-service/api/auth',
};

class AdminUserService {
    // ========== User Management ==========

    /**
     * Get all users (Admin access using regular users endpoint)
     * According to the documentation, /api/users is admin-only
     */
    async getAllUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add any query parameters if needed
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.direction) queryParams.append('direction', params.direction);

            const url = queryParams.toString()
                ? `${USER_ENDPOINTS.USERS}?${queryParams.toString()}`
                : USER_ENDPOINTS.USERS;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user by ID (Admin or current user only)
     * @param {string|number} userId User ID
     */
    async getUserById(userId) {
        try {
            return await api.get(`${USER_ENDPOINTS.USERS}/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Update user information (Admin or current user only)
     * @param {string|number} userId User ID
     * @param {Object} userData Updated user data
     */
    async updateUser(userId, userData) {
        try {
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}`, userData);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Delete user account (Admin or current user only)
     * @param {string|number} userId User ID
     */
    async deleteUser(userId) {
        try {
            const response = await api.delete(`${USER_ENDPOINTS.USERS}/${userId}`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Change user password
     * @param {string|number} userId User ID
     * @param {Object} passwordData Password data
     */
    async changePassword(userId, passwordData) {
        try {
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}/password`, passwordData);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Update user interests
     * @param {string|number} userId User ID
     * @param {Array} interests Array of interests
     */
    async updateUserInterests(userId, interests) {
        try {
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}/interests`, interests);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Role Management ==========
    // Note: According to the documentation, these are the available role endpoints

    /**
     * Get all available roles - Mock implementation since not explicitly documented
     * Returns predefined roles based on the documentation
     */
    async getAllRoles() {
        try {
            // Since the API doesn't have a dedicated roles endpoint,
            // we'll return the roles mentioned in the documentation
            const roles = [
                { id: 1, name: 'USER' },
                { id: 2, name: 'ADMIN' },
                { id: 3, name: 'EVENT_ORGANIZER' },
                { id: 4, name: 'FACULTY' },
                { id: 5, name: 'STUDENT' }
            ];

            return { data: roles };
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Add role to user
     * @param {string|number} userId User ID
     * @param {string} roleName Role name
     */
    async addUserRole(userId, roleName) {
        try {
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}/roles/add/${roleName}`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Remove role from user
     * @param {string|number} userId User ID
     * @param {string} roleName Role name
     */
    async removeUserRole(userId, roleName) {
        try {
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}/roles/remove/${roleName}`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== User Search and Discovery ==========

    /**
     * Search users by keyword
     * @param {string} keyword Search keyword
     */
    async searchUsers(keyword) {
        try {
            return await api.get(`${USER_ENDPOINTS.USERS}/search?keyword=${encodeURIComponent(keyword)}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get users with similar interests
     * @param {Array|string} interests Interests to search for
     */
    async getUsersByInterests(interests) {
        try {
            const interestsParam = Array.isArray(interests) ? interests.join(',') : interests;
            return await api.get(`${USER_ENDPOINTS.USERS}/interests?interests=${encodeURIComponent(interestsParam)}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== User Status Management ==========
    // Note: The documentation doesn't mention activate/deactivate endpoints
    // These might need to be implemented using the update user endpoint

    /**
     * Activate user account (using update endpoint)
     * @param {string|number} userId User ID
     */
    async activateUser(userId) {
        try {
            // Since there's no specific activate endpoint, we'll update the user status
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}`, {
                enabled: true,
                accountNonLocked: true
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Deactivate user account (using update endpoint)
     * @param {string|number} userId User ID
     */
    async deactivateUser(userId) {
        try {
            // Since there's no specific deactivate endpoint, we'll update the user status
            const response = await api.put(`${USER_ENDPOINTS.USERS}/${userId}`, {
                enabled: false
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== User Creation ==========

    /**
     * Create a new user (using registration endpoint)
     * @param {Object} userData User data
     */
    async createUser(userData) {
        try {
            // Use the registration endpoint to create new users
            const response = await api.post(`${USER_ENDPOINTS.AUTH}/register`, userData);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Helper Methods ==========

    /**
     * Get current user (for reference)
     */
    async getCurrentUser() {
        try {
            // This requires the username parameter according to the documentation
            return await api.get(`${USER_ENDPOINTS.USERS}/me`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user public profile
     * @param {string|number} userId User ID
     */
    async getUserProfile(userId) {
        try {
            return await api.get(`${USER_ENDPOINTS.USERS}/profile/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Error Handling ==========

    /**
     * Handle API errors with user-friendly messages
     * @param {Error} error The error object
     */
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    throw new Error(data.message || 'Invalid request. Please check your input.');
                case 401:
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    throw new Error('Your session has expired. Please log in again.');
                case 403:
                    throw new Error('You do not have permission to perform this action.');
                case 404:
                    throw new Error('The requested user or resource was not found.');
                case 409:
                    throw new Error(data.message || 'Conflict: This action cannot be completed due to a conflict.');
                case 422:
                    if (data.errors && Array.isArray(data.errors)) {
                        const errorMessages = data.errors.map(err => err.message).join(', ');
                        throw new Error(`Validation error: ${errorMessages}`);
                    }
                    throw new Error(data.message || 'Validation error: Please check your input data.');
                case 429:
                    throw new Error('Too many requests. Please try again in a few minutes.');
                case 500:
                    throw new Error('Server error. Please try again later or contact support.');
                default:
                    throw new Error(data.message || `An error occurred (${status}). Please try again.`);
            }
        } else if (error.request) {
            throw new Error('Network error. Please check your internet connection and try again.');
        } else {
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }

    // ========== Utility Methods ==========

    /**
     * Validate user data before submission
     * @param {Object} userData User data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validateUserData(userData) {
        const errors = [];
        const required = ['firstName', 'lastName', 'email'];

        // Check required fields
        required.forEach(field => {
            if (!userData[field] || (typeof userData[field] === 'string' && !userData[field].trim())) {
                errors.push(`${field} is required`);
            }
        });

        // Validate email format
        if (userData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                errors.push('Please enter a valid email address');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Format user data for API submission
     * @param {Object} userData Raw user data
     * @returns {Object} Formatted user data
     */
    formatUserData(userData) {
        const formatted = { ...userData };

        // Remove empty strings and null values
        Object.keys(formatted).forEach(key => {
            if (formatted[key] === '' || formatted[key] === null) {
                delete formatted[key];
            }
        });

        return formatted;
    }

    /**
     * Get user status display information
     * @param {Object} user User object
     * @returns {Object} Status display info
     */
    getUserStatusInfo(user) {
        // Determine status based on user properties from the API
        let status = 'ACTIVE';

        if (!user.enabled) {
            status = 'INACTIVE';
        } else if (!user.accountNonLocked) {
            status = 'SUSPENDED';
        } else if (!user.accountNonExpired) {
            status = 'EXPIRED';
        }

        const statusMap = {
            'ACTIVE': {
                label: 'Active',
                color: 'success',
                description: 'User can access the system'
            },
            'INACTIVE': {
                label: 'Inactive',
                color: 'error',
                description: 'User cannot access the system'
            },
            'SUSPENDED': {
                label: 'Suspended',
                color: 'error',
                description: 'User account is locked'
            },
            'EXPIRED': {
                label: 'Expired',
                color: 'warning',
                description: 'User account has expired'
            }
        };

        return statusMap[status] || {
            label: status,
            color: 'neutral',
            description: 'Unknown status'
        };
    }
}

export default new AdminUserService();