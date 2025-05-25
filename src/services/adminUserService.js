// src/services/adminUserService.js
import api from './api';

const ADMIN_USER_ENDPOINTS = {
    USERS: 'tukio-user-service/api/admin/users',
    ROLES: 'tukio-user-service/api/admin/roles',
    STATS: 'tukio-user-service/api/admin/stats'
};

class AdminUserService {
    // ========== User Management ==========

    /**
     * Get all users with admin privileges
     * @param {Object} params Query parameters
     */
    async getAllUsers(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.search) queryParams.append('search', params.search);
            if (params.role) queryParams.append('role', params.role);
            if (params.status) queryParams.append('status', params.status);
            if (params.department) queryParams.append('department', params.department);
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.direction) queryParams.append('direction', params.direction);

            const url = queryParams.toString()
                ? `${ADMIN_USER_ENDPOINTS.USERS}?${queryParams.toString()}`
                : ADMIN_USER_ENDPOINTS.USERS;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user by ID with admin details
     * @param {string|number} userId User ID
     */
    async getUserById(userId) {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Create a new user (admin only)
     * @param {Object} userData User data
     */
    async createUser(userData) {
        try {
            const response = await api.post(ADMIN_USER_ENDPOINTS.USERS, userData);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Update user information (admin only)
     * @param {string|number} userId User ID
     * @param {Object} userData Updated user data
     */
    async updateUser(userId, userData) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}`, userData);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Delete user account (admin only)
     * @param {string|number} userId User ID
     */
    async deleteUser(userId) {
        try {
            const response = await api.delete(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Activate user account
     * @param {string|number} userId User ID
     */
    async activateUser(userId) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/activate`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Deactivate user account
     * @param {string|number} userId User ID
     */
    async deactivateUser(userId) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/deactivate`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Reset user password (admin only)
     * @param {string|number} userId User ID
     * @param {string} newPassword New password
     */
    async resetUserPassword(userId, newPassword) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/reset-password`, {
                newPassword
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Send password reset email
     * @param {string|number} userId User ID
     */
    async sendPasswordResetEmail(userId) {
        try {
            const response = await api.post(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/send-password-reset`);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Role Management ==========

    /**
     * Get all available roles
     */
    async getAllRoles() {
        try {
            return await api.get(ADMIN_USER_ENDPOINTS.ROLES);
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
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/roles/add`, {
                roleName
            });
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
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/roles/remove`, {
                roleName
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Update user roles (replace all roles)
     * @param {string|number} userId User ID
     * @param {Array} roles Array of role names
     */
    async updateUserRoles(userId, roles) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/roles`, {
                roles
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Bulk Operations ==========

    /**
     * Bulk update users
     * @param {Array} userUpdates Array of user updates
     */
    async bulkUpdateUsers(userUpdates) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/bulk-update`, {
                updates: userUpdates
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk delete users
     * @param {Array} userIds Array of user IDs
     */
    async bulkDeleteUsers(userIds) {
        try {
            const response = await api.delete(`${ADMIN_USER_ENDPOINTS.USERS}/bulk-delete`, {
                data: { userIds }
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk activate users
     * @param {Array} userIds Array of user IDs
     */
    async bulkActivateUsers(userIds) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/bulk-activate`, {
                userIds
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk deactivate users
     * @param {Array} userIds Array of user IDs
     */
    async bulkDeactivateUsers(userIds) {
        try {
            const response = await api.put(`${ADMIN_USER_ENDPOINTS.USERS}/bulk-deactivate`, {
                userIds
            });
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Statistics and Analytics ==========

    /**
     * Get user statistics
     * @param {Object} dateRange Date range filter
     */
    async getUserStats(dateRange = {}) {
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const url = params.toString()
                ? `${ADMIN_USER_ENDPOINTS.STATS}?${params.toString()}`
                : ADMIN_USER_ENDPOINTS.STATS;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user growth analytics
     * @param {string} period Period ('7d', '30d', '90d', '1y')
     */
    async getUserGrowthAnalytics(period = '30d') {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.STATS}/growth?period=${period}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user activity analytics
     * @param {Object} params Analytics parameters
     */
    async getUserActivityAnalytics(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.period) queryParams.append('period', params.period);
            if (params.groupBy) queryParams.append('groupBy', params.groupBy);

            const url = queryParams.toString()
                ? `${ADMIN_USER_ENDPOINTS.STATS}/activity?${queryParams.toString()}`
                : `${ADMIN_USER_ENDPOINTS.STATS}/activity`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get users by department analytics
     */
    async getUsersByDepartment() {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.STATS}/departments`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get users by role analytics
     */
    async getUsersByRole() {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.STATS}/roles`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Export and Import ==========

    /**
     * Export users data
     * @param {string} format Export format ('csv', 'xlsx', 'json')
     * @param {Object} filters Export filters
     */
    async exportUsers(format = 'csv', filters = {}) {
        try {
            const params = new URLSearchParams();
            params.append('format', format);

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key]);
                }
            });

            return await api.get(`${ADMIN_USER_ENDPOINTS.USERS}/export?${params.toString()}`, {
                responseType: 'blob'
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Import users from file
     * @param {File} file CSV or Excel file
     * @param {Object} options Import options
     */
    async importUsers(file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            Object.keys(options).forEach(key => {
                formData.append(key, options[key]);
            });

            return await api.post(`${ADMIN_USER_ENDPOINTS.USERS}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Search and Filtering ==========

    /**
     * Advanced user search
     * @param {Object} searchCriteria Search criteria
     */
    async searchUsers(searchCriteria) {
        try {
            return await api.post(`${ADMIN_USER_ENDPOINTS.USERS}/search`, searchCriteria);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get users with specific permissions
     * @param {string} permission Permission name
     */
    async getUsersWithPermission(permission) {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.USERS}/permission/${permission}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get inactive users
     * @param {number} daysInactive Number of days of inactivity
     */
    async getInactiveUsers(daysInactive = 30) {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.USERS}/inactive?days=${daysInactive}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get recently registered users
     * @param {number} days Number of days to look back
     */
    async getRecentlyRegisteredUsers(days = 7) {
        try {
            return await api.get(`${ADMIN_USER_ENDPOINTS.USERS}/recent?days=${days}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== User Audit and Logs ==========

    /**
     * Get user audit log
     * @param {string|number} userId User ID
     * @param {Object} params Query parameters
     */
    async getUserAuditLog(userId, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.action) queryParams.append('action', params.action);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);

            const url = queryParams.toString()
                ? `${ADMIN_USER_ENDPOINTS.USERS}/${userId}/audit-log?${queryParams.toString()}`
                : `${ADMIN_USER_ENDPOINTS.USERS}/${userId}/audit-log`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user login history
     * @param {string|number} userId User ID
     * @param {Object} params Query parameters
     */
    async getUserLoginHistory(userId, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);

            const url = queryParams.toString()
                ? `${ADMIN_USER_ENDPOINTS.USERS}/${userId}/login-history?${queryParams.toString()}`
                : `${ADMIN_USER_ENDPOINTS.USERS}/${userId}/login-history`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Notifications ==========

    /**
     * Send notification to user
     * @param {string|number} userId User ID
     * @param {Object} notificationData Notification content
     */
    async sendNotificationToUser(userId, notificationData) {
        try {
            return await api.post(`${ADMIN_USER_ENDPOINTS.USERS}/${userId}/notify`, notificationData);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Send bulk notification to users
     * @param {Array} userIds Array of user IDs
     * @param {Object} notificationData Notification content
     */
    async sendBulkNotification(userIds, notificationData) {
        try {
            return await api.post(`${ADMIN_USER_ENDPOINTS.USERS}/bulk-notify`, {
                userIds,
                ...notificationData
            });
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
        const required = ['firstName', 'lastName', 'email', 'department'];

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

        // Validate roles
        if (userData.roles && (!Array.isArray(userData.roles) || userData.roles.length === 0)) {
            errors.push('At least one role must be assigned');
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

        // Ensure roles is an array
        if (formatted.roles && !Array.isArray(formatted.roles)) {
            formatted.roles = [formatted.roles];
        }

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
     * @param {string} status User status
     * @returns {Object} Status display info
     */
    getUserStatusInfo(status) {
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
            'PENDING': {
                label: 'Pending',
                color: 'warning',
                description: 'User registration pending approval'
            },
            'SUSPENDED': {
                label: 'Suspended',
                color: 'error',
                description: 'User temporarily suspended'
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