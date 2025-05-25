// src/services/eventService.js - Complete Enhanced Event Service with Admin Functionality
import api from './api';

const EVENT_ENDPOINTS = {
    EVENTS: 'tukio-events-service/api/events',
    CATEGORIES: 'tukio-events-service/api/event-categories',
    REGISTRATIONS: 'tukio-events-service/api/event-registrations',
    ADMIN: 'tukio-events-service/api/admin/events'
};

class EventService {
    // ========== Public Event Methods ==========

    /**
     * Get all public events
     */
    async getAllEvents() {
        try {
            return await api.get(EVENT_ENDPOINTS.EVENTS);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event by ID
     * @param {string|number} id Event ID
     */
    async getEventById(id) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${id}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Create a new event
     * @param {Object} eventData Event data
     */
    async createEvent(eventData) {
        console.log('Creating event with data:', eventData);
        try {
            const response = await api.post(EVENT_ENDPOINTS.EVENTS, eventData);
            console.log('Event created successfully:', response.data);
            this.clearEventsCache();
            return response;
        } catch (error) {
            console.error('Error creating event:', error);
            this.handleError(error);
        }
    }

    /**
     * Update an existing event
     * @param {string|number} id Event ID
     * @param {Object} eventData Updated event data
     */
    async updateEvent(id, eventData) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.EVENTS}/${id}`, eventData);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Delete an event
     * @param {string|number} id Event ID
     */
    async deleteEvent(id) {
        try {
            const response = await api.delete(`${EVENT_ENDPOINTS.EVENTS}/${id}`);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Search events with criteria
     * @param {Object} criteria Search criteria
     */
    async searchEvents(criteria) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/search`, { params: criteria });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get upcoming events
     * @param {number} limit Number of events to return
     */
    async getUpcomingEvents(limit = 10) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/upcoming?limit=${limit}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get upcoming events for a specific user
     * @param {string|number} userId User ID
     */
    async getUserUpcomingEvents(userId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/user/${userId}/upcoming`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get events by organizer
     * @param {string|number} organizerId Organizer ID
     */
    async getEventsByOrganizer(organizerId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/organizer/${organizerId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get events by category
     * @param {string|number} categoryId Category ID
     */
    async getEventsByCategory(categoryId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/category/${categoryId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get featured events
     * @param {number} limit Number of events to return
     */
    async getFeaturedEvents(limit = 5) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/featured?limit=${limit}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get popular events
     * @param {number} limit Number of events to return
     * @param {string} timeframe Time period (7d, 30d, 90d)
     */
    async getPopularEvents(limit = 10, timeframe = '30d') {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/popular?limit=${limit}&timeframe=${timeframe}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Category Methods ==========

    /**
     * Get all event categories
     */
    async getAllCategories() {
        try {
            const cached = this.getCachedEvents('categories');
            if (cached) return { data: cached };

            const response = await api.get(EVENT_ENDPOINTS.CATEGORIES);
            this.setCachedEvents('categories', response.data);
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get category by ID
     * @param {string|number} id Category ID
     */
    async getCategoryById(id) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.CATEGORIES}/${id}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Create a new category (admin only)
     * @param {Object} categoryData Category data
     */
    async createCategory(categoryData) {
        try {
            const response = await api.post(EVENT_ENDPOINTS.CATEGORIES, categoryData);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Update category (admin only)
     * @param {string|number} id Category ID
     * @param {Object} categoryData Updated category data
     */
    async updateCategory(id, categoryData) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.CATEGORIES}/${id}`, categoryData);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Delete category (admin only)
     * @param {string|number} id Category ID
     */
    async deleteCategory(id) {
        try {
            const response = await api.delete(`${EVENT_ENDPOINTS.CATEGORIES}/${id}`);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Registration Methods ==========

    /**
     * Register for an event
     * @param {Object} registrationData Registration data
     */
    async registerForEvent(registrationData) {
        try {
            const response = await api.post(`${EVENT_ENDPOINTS.REGISTRATIONS}/register`, registrationData);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Cancel event registration
     * @param {string|number} id Registration ID
     */
    async cancelRegistration(id) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.REGISTRATIONS}/${id}/cancel`);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get registrations by user
     * @param {string|number} userId User ID
     */
    async getRegistrationsByUser(userId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.REGISTRATIONS}/user/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get registrations by event
     * @param {string|number} eventId Event ID
     */
    async getRegistrationsByEvent(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Submit event feedback
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     * @param {string} feedback Feedback text
     * @param {number} rating Rating (1-5)
     */
    async submitFeedback(eventId, userId, feedback, rating) {
        try {
            return await api.post(
                `${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}/user/${userId}/feedback`,
                { feedback, rating }
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Check in attendee
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     */
    async checkInAttendee(eventId, userId) {
        try {
            return await api.post(
                `${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}/user/${userId}/check-in`
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk check-in attendees
     * @param {string|number} eventId Event ID
     * @param {Array} userIds Array of user IDs
     */
    async bulkCheckInAttendees(eventId, userIds) {
        try {
            return await api.post(
                `${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}/bulk-check-in`,
                { userIds }
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Admin-Only Methods ==========

    /**
     * Get all events with admin privileges (includes draft/pending events)
     * @param {Object} params Query parameters
     */
    async getAdminEvents(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.status) queryParams.append('status', params.status);
            if (params.categoryId) queryParams.append('categoryId', params.categoryId);
            if (params.organizerId) queryParams.append('organizerId', params.organizerId);
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.direction) queryParams.append('direction', params.direction);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);

            const url = queryParams.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}?${queryParams.toString()}`
                : EVENT_ENDPOINTS.ADMIN;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get events pending approval
     */
    async getPendingEvents() {
        try {
            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/pending`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Approve an event (change status from DRAFT to SCHEDULED)
     * @param {string|number} eventId Event ID
     * @param {Object} approvalData Approval data
     */
    async approveEvent(eventId, approvalData = {}) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/approve`, {
                status: 'SCHEDULED',
                approvedAt: new Date().toISOString(),
                ...approvalData
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Reject an event (change status from DRAFT to CANCELLED)
     * @param {string|number} eventId Event ID
     * @param {Object} rejectionData Rejection data
     */
    async rejectEvent(eventId, rejectionData = {}) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/reject`, {
                status: 'CANCELLED',
                rejectedAt: new Date().toISOString(),
                rejectionReason: rejectionData.reason || 'Event rejected by administrator',
                ...rejectionData
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk approve multiple events
     * @param {Array} eventIds Array of event IDs
     */
    async bulkApproveEvents(eventIds) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/bulk-approve`, {
                eventIds,
                status: 'SCHEDULED',
                approvedAt: new Date().toISOString()
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk reject multiple events
     * @param {Array} eventIds Array of event IDs
     * @param {string} rejectionReason Reason for rejection
     */
    async bulkRejectEvents(eventIds, rejectionReason = 'Bulk rejection by administrator') {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/bulk-reject`, {
                eventIds,
                status: 'CANCELLED',
                rejectedAt: new Date().toISOString(),
                rejectionReason
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Force delete an event (admin override)
     * @param {string|number} eventId Event ID
     * @param {string} reason Deletion reason
     */
    async forceDeleteEvent(eventId, reason = '') {
        try {
            const response = await api.delete(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/force-delete`, {
                data: { reason }
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event statistics for admin dashboard
     * @param {Object} dateRange Date range filter
     */
    async getEventStatistics(dateRange = {}) {
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const url = params.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}/statistics?${params.toString()}`
                : `${EVENT_ENDPOINTS.ADMIN}/statistics`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event analytics data
     * @param {string|number} eventId Event ID
     */
    async getEventAnalytics(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/analytics`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get all event registrations for admin review
     * @param {Object} params Query parameters
     */
    async getAdminRegistrations(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.eventId) queryParams.append('eventId', params.eventId);
            if (params.userId) queryParams.append('userId', params.userId);
            if (params.status) queryParams.append('status', params.status);
            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);

            const url = queryParams.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}/registrations?${queryParams.toString()}`
                : `${EVENT_ENDPOINTS.ADMIN}/registrations`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Export event data (CSV, Excel, etc.)
     * @param {string} format Export format ('csv', 'xlsx', 'json')
     * @param {Object} filters Export filters
     */
    async exportEvents(format = 'csv', filters = {}) {
        try {
            const params = new URLSearchParams();
            params.append('format', format);

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key]);
                }
            });

            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/export?${params.toString()}`, {
                responseType: 'blob' // Important for file downloads
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Export event registrations
     * @param {string|number} eventId Event ID
     * @param {string} format Export format
     */
    async exportRegistrations(eventId, format = 'csv') {
        try {
            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/registrations/export?format=${format}`, {
                responseType: 'blob'
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Send notification to all event registrants
     * @param {string|number} eventId Event ID
     * @param {Object} notificationData Notification content
     */
    async notifyEventRegistrants(eventId, notificationData) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/notify`, notificationData);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Update event status with admin privileges
     * @param {string|number} eventId Event ID
     * @param {string} status New status
     * @param {string} reason Status change reason
     */
    async updateEventStatus(eventId, status, reason = '') {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/status`, {
                status,
                reason,
                updatedAt: new Date().toISOString()
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Reschedule an event with admin privileges
     * @param {string|number} eventId Event ID
     * @param {string} newStartTime New start time
     * @param {string} newEndTime New end time
     * @param {string} reason Reschedule reason
     */
    async rescheduleEvent(eventId, newStartTime, newEndTime, reason = '') {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/reschedule`, {
                startTime: newStartTime,
                endTime: newEndTime,
                status: 'RESCHEDULED',
                rescheduleReason: reason,
                rescheduledAt: new Date().toISOString()
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event audit log (admin only)
     * @param {string|number} eventId Event ID
     */
    async getEventAuditLog(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/audit-log`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Clone/duplicate an event
     * @param {string|number} eventId Event ID to clone
     * @param {Object} modifications Modifications to apply to cloned event
     */
    async cloneEvent(eventId, modifications = {}) {
        try {
            const response = await api.post(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/clone`, modifications);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get events by multiple criteria (advanced admin search)
     * @param {Object} searchCriteria Advanced search criteria
     */
    async advancedEventSearch(searchCriteria) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.ADMIN}/search`, searchCriteria);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get popular events analytics
     * @param {string} timeframe Timeframe ('7d', '30d', '90d', '1y')
     */
    async getPopularEventsAnalytics(timeframe = '30d') {
        try {
            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/analytics/popular?timeframe=${timeframe}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event performance metrics
     * @param {Object} dateRange Date range for metrics
     */
    async getEventPerformanceMetrics(dateRange = {}) {
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const url = params.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}/metrics?${params.toString()}`
                : `${EVENT_ENDPOINTS.ADMIN}/metrics`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Generate event report
     * @param {string} reportType Type of report
     * @param {Object} parameters Report parameters
     */
    async generateEventReport(reportType, parameters = {}) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.ADMIN}/reports/${reportType}`, parameters);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get venue utilization report
     * @param {string|number} venueId Venue ID
     * @param {Object} dateRange Date range for report
     */
    async getVenueUtilizationReport(venueId, dateRange = {}) {
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const url = params.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}/venues/${venueId}/utilization?${params.toString()}`
                : `${EVENT_ENDPOINTS.ADMIN}/venues/${venueId}/utilization`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Flag event for review
     * @param {string|number} eventId Event ID
     * @param {string} flagReason Reason for flagging
     * @param {string} priority Priority level ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
     */
    async flagEventForReview(eventId, flagReason, priority = 'MEDIUM') {
        try {
            return await api.post(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/flag`, {
                reason: flagReason,
                priority,
                flaggedAt: new Date().toISOString()
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Unflag event (remove review flag)
     * @param {string|number} eventId Event ID
     * @param {string} resolution Resolution details
     */
    async unflagEvent(eventId, resolution = '') {
        try {
            return await api.delete(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/flag`, {
                data: { resolution }
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get flagged events
     */
    async getFlaggedEvents() {
        try {
            return await api.get(`${EVENT_ENDPOINTS.ADMIN}/flagged`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Archive old events
     * @param {Date} cutoffDate Events before this date will be archived
     */
    async archiveOldEvents(cutoffDate) {
        try {
            const response = await api.post(`${EVENT_ENDPOINTS.ADMIN}/archive`, {
                cutoffDate: cutoffDate.toISOString()
            });
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get archived events
     * @param {Object} params Query parameters
     */
    async getArchivedEvents(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.page !== undefined) queryParams.append('page', params.page);
            if (params.size !== undefined) queryParams.append('size', params.size);
            if (params.sort) queryParams.append('sort', params.sort);

            const url = queryParams.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}/archived?${queryParams.toString()}`
                : `${EVENT_ENDPOINTS.ADMIN}/archived`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Restore archived event
     * @param {string|number} eventId Event ID
     */
    async restoreArchivedEvent(eventId) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.ADMIN}/${eventId}/restore`);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Utility Methods ==========

    /**
     * Check if user has permission to edit event
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     */
    async checkEditPermission(eventId, userId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/edit-permission?userId=${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event capacity status
     * @param {string|number} eventId Event ID
     */
    async getEventCapacityStatus(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/capacity`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get similar events (for recommendations)
     * @param {string|number} eventId Event ID
     * @param {number} limit Number of similar events to return
     */
    async getSimilarEvents(eventId, limit = 5) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/similar?limit=${limit}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event QR code for check-ins
     * @param {string|number} eventId Event ID
     */
    async getEventQRCode(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/qr-code`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Bulk update event registrations
     * @param {Array} updates Array of registration updates
     */
    async bulkUpdateRegistrations(updates) {
        try {
            const response = await api.put(`${EVENT_ENDPOINTS.REGISTRATIONS}/bulk-update`, updates);
            this.clearEventsCache();
            return response;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get registration analytics for an event
     * @param {string|number} eventId Event ID
     */
    async getRegistrationAnalytics(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/registration-analytics`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Send custom email to event registrants
     * @param {string|number} eventId Event ID
     * @param {Object} emailData Email content and configuration
     */
    async sendCustomEmail(eventId, emailData) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/send-email`, emailData);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event feedback summary
     * @param {string|number} eventId Event ID
     */
    async getEventFeedbackSummary(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/feedback-summary`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Download event attendee list
     * @param {string|number} eventId Event ID
     * @param {string} format Download format ('csv', 'xlsx', 'pdf')
     */
    async downloadAttendeeList(eventId, format = 'csv') {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/attendees/download?format=${format}`, {
                responseType: 'blob'
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event waiting list
     * @param {string|number} eventId Event ID
     */
    async getEventWaitingList(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/waiting-list`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Add user to event waiting list
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     */
    async addToWaitingList(eventId, userId) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/waiting-list`, { userId });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Remove user from event waiting list
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     */
    async removeFromWaitingList(eventId, userId) {
        try {
            return await api.delete(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/waiting-list/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Process waiting list when spots become available
     * @param {string|number} eventId Event ID
     * @param {number} spotsAvailable Number of spots to fill from waiting list
     */
    async processWaitingList(eventId, spotsAvailable) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/waiting-list/process`, {
                spotsAvailable
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event tags for autocomplete
     * @param {string} query Search query for tags
     */
    async getEventTags(query = '') {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/tags?q=${encodeURIComponent(query)}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get events by date range
     * @param {string} startDate Start date (ISO string)
     * @param {string} endDate End date (ISO string)
     * @param {Object} filters Additional filters
     */
    async getEventsByDateRange(startDate, endDate, filters = {}) {
        try {
            const params = new URLSearchParams();
            params.append('startDate', startDate);
            params.append('endDate', endDate);

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key]);
                }
            });

            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/date-range?${params.toString()}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event calendar data for a month
     * @param {number} year Year
     * @param {number} month Month (1-12)
     */
    async getEventCalendar(year, month) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/calendar?year=${year}&month=${month}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Mark event as favorite
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     */
    async favoriteEvent(eventId, userId) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/favorite`, { userId });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Remove event from favorites
     * @param {string|number} eventId Event ID
     * @param {string|number} userId User ID
     */
    async unfavoriteEvent(eventId, userId) {
        try {
            return await api.delete(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/favorite/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get user's favorite events
     * @param {string|number} userId User ID
     */
    async getUserFavoriteEvents(userId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/favorites/user/${userId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Share event via social media or email
     * @param {string|number} eventId Event ID
     * @param {string} platform Platform ('email', 'facebook', 'twitter', 'linkedin')
     * @param {Object} shareData Additional share data
     */
    async shareEvent(eventId, platform, shareData = {}) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/share`, {
                platform,
                ...shareData
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event share statistics
     * @param {string|number} eventId Event ID
     */
    async getEventShareStats(eventId) {
        try {
            return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/share-stats`);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Report inappropriate event content
     * @param {string|number} eventId Event ID
     * @param {string} reason Report reason
     * @param {string} description Detailed description
     * @param {string|number} reporterId Reporter user ID
     */
    async reportEvent(eventId, reason, description, reporterId) {
        try {
            return await api.post(`${EVENT_ENDPOINTS.EVENTS}/${eventId}/report`, {
                reason,
                description,
                reporterId,
                reportedAt: new Date().toISOString()
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get event reports (admin only)
     * @param {Object} filters Report filters
     */
    async getEventReports(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key]);
                }
            });

            const url = params.toString()
                ? `${EVENT_ENDPOINTS.ADMIN}/reports?${params.toString()}`
                : `${EVENT_ENDPOINTS.ADMIN}/reports`;

            return await api.get(url);
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Resolve event report (admin only)
     * @param {string|number} reportId Report ID
     * @param {string} resolution Resolution details
     * @param {string} action Action taken
     */
    async resolveEventReport(reportId, resolution, action) {
        try {
            return await api.put(`${EVENT_ENDPOINTS.ADMIN}/reports/${reportId}/resolve`, {
                resolution,
                action,
                resolvedAt: new Date().toISOString()
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // ========== Error Handling Helpers ==========

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
                    // Clear auth token and redirect to login
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    throw new Error('Your session has expired. Please log in again.');
                case 403:
                    throw new Error('You do not have permission to perform this action.');
                case 404:
                    throw new Error('The requested event or resource was not found.');
                case 409:
                    throw new Error(data.message || 'Conflict: This action cannot be completed due to a conflict.');
                case 422:
                    // Validation errors
                    if (data.errors && Array.isArray(data.errors)) {
                        const errorMessages = data.errors.map(err => err.message).join(', ');
                        throw new Error(`Validation error: ${errorMessages}`);
                    }
                    throw new Error(data.message || 'Validation error: Please check your input data.');
                case 429:
                    throw new Error('Too many requests. Please try again in a few minutes.');
                case 500:
                    throw new Error('Server error. Please try again later or contact support.');
                case 503:
                    throw new Error('Service temporarily unavailable. Please try again later.');
                default:
                    throw new Error(data.message || `An error occurred (${status}). Please try again.`);
            }
        } else if (error.request) {
            throw new Error('Network error. Please check your internet connection and try again.');
        } else {
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }

    // ========== Cache Management ==========

    /**
     * Clear events cache (for real-time updates)
     */
    clearEventsCache() {
        if (typeof window !== 'undefined') {
            // Clear any cached event data
            const cacheKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('events_cache_') ||
                key.startsWith('categories_cache_') ||
                key.startsWith('venues_cache_')
            );
            cacheKeys.forEach(key => localStorage.removeItem(key));
        }
    }

    /**
     * Get cached events if available
     * @param {string} cacheKey Cache key identifier
     * @returns {any|null} Cached data or null if not found/expired
     */
    getCachedEvents(cacheKey) {
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(`events_cache_${cacheKey}`);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const now = Date.now();
                    const cacheAge = now - timestamp;
                    const maxAge = 5 * 60 * 1000; // 5 minutes

                    if (cacheAge < maxAge) {
                        return data;
                    } else {
                        // Remove expired cache
                        localStorage.removeItem(`events_cache_${cacheKey}`);
                    }
                }
            } catch (error) {
                console.warn('Error reading cache:', error);
                localStorage.removeItem(`events_cache_${cacheKey}`);
            }
        }
        return null;
    }

    /**
     * Cache events data
     * @param {string} cacheKey Cache key identifier
     * @param {any} data Data to cache
     */
    setCachedEvents(cacheKey, data) {
        if (typeof window !== 'undefined') {
            try {
                const cacheData = {
                    data,
                    timestamp: Date.now()
                };
                localStorage.setItem(`events_cache_${cacheKey}`, JSON.stringify(cacheData));
            } catch (error) {
                console.warn('Error setting cache:', error);
                // If quota exceeded, clear old cache entries
                this.clearEventsCache();
            }
        }
    }

    // ========== Utility Functions ==========

    /**
     * Validate event data before submission
     * @param {Object} eventData Event data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validateEventData(eventData) {
        const errors = [];
        const required = ['title', 'description', 'startTime', 'endTime', 'categoryId', 'maxParticipants'];

        // Check required fields
        required.forEach(field => {
            if (!eventData[field] || (typeof eventData[field] === 'string' && !eventData[field].trim())) {
                errors.push(`${field} is required`);
            }
        });

        // Validate dates
        if (eventData.startTime && eventData.endTime) {
            const startDate = new Date(eventData.startTime);
            const endDate = new Date(eventData.endTime);
            const now = new Date();

            if (startDate <= now) {
                errors.push('Start time must be in the future');
            }

            if (endDate <= startDate) {
                errors.push('End time must be after start time');
            }
        }

        // Validate max participants
        if (eventData.maxParticipants && eventData.maxParticipants < 1) {
            errors.push('Maximum participants must be at least 1');
        }

        // Validate either location or venue is provided
        if (!eventData.location && !eventData.venueId) {
            errors.push('Either location or venue must be specified');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Format event data for API submission
     * @param {Object} eventData Raw event data
     * @returns {Object} Formatted event data
     */
    formatEventData(eventData) {
        const formatted = { ...eventData };

        // Ensure numeric fields are numbers
        if (formatted.categoryId) {
            formatted.categoryId = parseInt(formatted.categoryId);
        }
        if (formatted.venueId) {
            formatted.venueId = parseInt(formatted.venueId);
        }
        if (formatted.maxParticipants) {
            formatted.maxParticipants = parseInt(formatted.maxParticipants);
        }

        // Format dates to ISO strings
        if (formatted.startTime && typeof formatted.startTime === 'string') {
            formatted.startTime = new Date(formatted.startTime).toISOString();
        }
        if (formatted.endTime && typeof formatted.endTime === 'string') {
            formatted.endTime = new Date(formatted.endTime).toISOString();
        }

        // Ensure tags is an array
        if (formatted.tags && !Array.isArray(formatted.tags)) {
            formatted.tags = [];
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
     * Get event status display information
     * @param {string} status Event status
     * @returns {Object} Status display info with color, label, and icon
     */
    getEventStatusInfo(status) {
        const statusMap = {
            'DRAFT': {
                label: 'Draft',
                color: 'warning',
                icon: '✏️',
                description: 'Event is being prepared'
            },
            'SCHEDULED': {
                label: 'Scheduled',
                color: 'success',
                icon: '✅',
                description: 'Event is confirmed and scheduled'
            },
            'CANCELLED': {
                label: 'Cancelled',
                color: 'error',
                icon: '❌',
                description: 'Event has been cancelled'
            },
            'COMPLETED': {
                label: 'Completed',
                color: 'neutral',
                icon: '🏁',
                description: 'Event has finished'
            },
            'RESCHEDULED': {
                label: 'Rescheduled',
                color: 'warning',
                icon: '📅',
                description: 'Event date/time has been changed'
            },
            'POSTPONED': {
                label: 'Postponed',
                color: 'warning',
                icon: '⏸️',
                description: 'Event has been postponed'
            }
        };

        return statusMap[status] || {
            label: status,
            color: 'neutral',
            icon: '❓',
            description: 'Unknown status'
        };
    }

    /**
     * Calculate event capacity percentage
     * @param {number} currentRegistrations Current number of registrations
     * @param {number} maxParticipants Maximum allowed participants
     * @returns {number} Capacity percentage (0-100)
     */
    calculateCapacityPercentage(currentRegistrations, maxParticipants) {
        if (!maxParticipants || maxParticipants <= 0) return 0;
        return Math.min(Math.round((currentRegistrations / maxParticipants) * 100), 100);
    }

    /**
     * Check if event registration is full
     * @param {Object} event Event object
     * @returns {boolean} True if event is full
     */
    isEventFull(event) {
        return event.currentRegistrations >= event.maxParticipants;
    }

    /**
     * Check if event registration is open
     * @param {Object} event Event object
     * @returns {boolean} True if registration is open
     */
    isRegistrationOpen(event) {
        const now = new Date();
        const eventStart = new Date(event.startTime);

        return event.status === 'SCHEDULED' &&
            eventStart > now &&
            !this.isEventFull(event);
    }

    /**
     * Get time until event starts
     * @param {string} startTime Event start time
     * @returns {Object} Time difference object
     */
    getTimeUntilEvent(startTime) {
        const now = new Date();
        const start = new Date(startTime);
        const diff = start - now;

        if (diff <= 0) {
            return { isPast: true, text: 'Event has started' };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return { isPast: false, text: `${days} day${days > 1 ? 's' : ''} remaining` };
        } else if (hours > 0) {
            return { isPast: false, text: `${hours} hour${hours > 1 ? 's' : ''} remaining` };
        } else {
            return { isPast: false, text: `${minutes} minute${minutes > 1 ? 's' : ''} remaining` };
        }
    }
}

export default new EventService();