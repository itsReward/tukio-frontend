import api from './api';

/**
 * Service for handling user-related API calls
 */
const userService = {
  /**
   * Get all users (admin only)
   * @returns {Promise} API response
   */
  getAllUsers: () => {
    return api.get('/api/users');
  },

  /**
   * Get user by ID
   * @param {string|number} id User ID
   * @returns {Promise} API response
   */
  getUserById: (id) => {
    return api.get(`/api/users/${id}`);
  },

  /**
   * Get current user profile
   * @returns {Promise} API response
   */
  getCurrentUser: () => {
    return api.get('/api/users/me');
  },

  /**
   * Get user public profile
   * @param {string|number} id User ID
   * @returns {Promise} API response
   */
  getUserProfile: (id) => {
    return api.get(`/api/users/profile/${id}`);
  },

  /**
   * Search users by keyword
   * @param {string} keyword Search keyword
   * @returns {Promise} API response
   */
  searchUsers: (keyword) => {
    return api.get(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);
  },

  /**
   * Get users by interests
   * @param {Array<string>} interests Array of interest tags
   * @returns {Promise} API response
   */
  getUsersByInterests: (interests) => {
    const interestsParam = Array.isArray(interests) ? interests.join(',') : interests;
    return api.get(`/api/users/interests?interests=${encodeURIComponent(interestsParam)}`);
  },

  /**
   * Update user information
   * @param {string|number} id User ID
   * @param {Object} userData User data to update
   * @returns {Promise} API response
   */
  updateUser: (id, userData) => {
    return api.put(`/api/users/${id}`, userData);
  },

  /**
   * Change user password
   * @param {string|number} id User ID
   * @param {Object} passwordData Password data (old and new password)
   * @returns {Promise} API response
   */
  changePassword: (id, passwordData) => {
    return api.put(`/api/users/${id}/password`, passwordData);
  },

  /**
   * Update user interests
   * @param {string|number} id User ID
   * @param {Array<string>} interests Array of interest tags
   * @returns {Promise} API response
   */
  updateUserInterests: (id, interests) => {
    return api.put(`/api/users/${id}/interests`, { interests });
  },

  /**
   * Add role to user (admin only)
   * @param {string|number} userId User ID
   * @param {string} roleName Role name to add
   * @returns {Promise} API response
   */
  addUserRole: (userId, roleName) => {
    return api.put(`/api/users/${userId}/roles/add/${roleName}`);
  },

  /**
   * Remove role from user (admin only)
   * @param {string|number} userId User ID
   * @param {string} roleName Role name to remove
   * @returns {Promise} API response
   */
  removeUserRole: (userId, roleName) => {
    return api.put(`/api/users/${userId}/roles/remove/${roleName}`);
  },

  /**
   * Delete user account
   * @param {string|number} id User ID
   * @returns {Promise} API response
   */
  deleteUser: (id) => {
    return api.delete(`/api/users/${id}`);
  },

  /**
   * Upload profile picture
   * @param {string|number} userId User ID
   * @param {File} imageFile Image file to upload
   * @returns {Promise} API response
   */
  uploadProfilePicture: (userId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.post(`/api/users/${userId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Get user's event registrations
   * @param {string|number} userId User ID
   * @returns {Promise} API response
   */
  getUserRegistrations: (userId) => {
    return api.get(`/api/event-registrations/user/${userId}`);
  },

  /**
   * Get user's upcoming events
   * @param {string|number} userId User ID
   * @returns {Promise} API response
   */
  getUserUpcomingEvents: (userId) => {
    return api.get(`/api/event-registrations/user/${userId}/upcoming`);
  },

  /**
   * Get user's past events
   * @param {string|number} userId User ID
   * @returns {Promise} API response
   */
  getUserPastEvents: (userId) => {
    return api.get(`/api/event-registrations/user/${userId}/past`);
  },

  /**
   * Get users with pagination
   * @param {number} page Page number (0-based)
   * @param {number} size Page size
   * @param {string} sort Field to sort by
   * @param {string} direction Sort direction ('ASC' or 'DESC')
   * @returns {Promise} API response
   */
  getPaginatedUsers: (page = 0, size = 10, sort = 'createdAt', direction = 'DESC') => {
    return api.get(`/api/users?page=${page}&size=${size}&sort=${sort}&direction=${direction}`);
  },

  /**
   * Find similar users based on interests and activity
   * @param {string|number} userId User ID
   * @param {number} limit Maximum number of similar users to return
   * @returns {Promise} API response
   */
  findSimilarUsers: (userId, limit = 5) => {
    return api.get(`/api/preferences/user/${userId}/similar-users?limit=${limit}`);
  },

  /**
   * Get user's favorite categories
   * @param {string|number} userId User ID
   * @returns {Promise} API response
   */
  getUserFavoriteCategories: (userId) => {
    return api.get(`/api/preferences/user/${userId}/categories`);
  },

  /**
   * Get user's preferences by tags
   * @param {string|number} userId User ID
   * @returns {Promise} API response
   */
  getUserPreferencesByTags: (userId) => {
    return api.get(`/api/preferences/user/${userId}/tags`);
  }
};

export default userService;