import api from './api';

const EVENT_ENDPOINTS = {
    EVENTS: 'tukio-events-service/api/events',
    CATEGORIES: 'tukio-events-service/api/event-categories',
    REGISTRATIONS: 'tukio-events-service/api/event-registrations',
};

class EventService {
    async getAllEvents() {
        return await api.get(EVENT_ENDPOINTS.EVENTS);
    }

    async getEventById(id) {
        return await api.get(`${EVENT_ENDPOINTS.EVENTS}/${id}`);
    }

    async createEvent(eventData) {
        console.log('Creating event with data:', eventData);
        try {
            const response = await api.post(EVENT_ENDPOINTS.EVENTS, eventData);
            console.log('Event created successfully:', response.data);
            return response;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }
    async updateEvent(id, eventData) {
        return await api.put(`${EVENT_ENDPOINTS.EVENTS}/${id}`, eventData);
    }

    async deleteEvent(id) {
        return await api.delete(`${EVENT_ENDPOINTS.EVENTS}/${id}`);
    }

    async searchEvents(criteria) {
        return await api.get(`${EVENT_ENDPOINTS.EVENTS}/search`, { params: criteria });
    }

    async getUpcomingEvents() {
        return await api.get(`${EVENT_ENDPOINTS.EVENTS}/upcoming`);
    }

    async getEventsByOrganizer(organizerId) {
        return await api.get(`${EVENT_ENDPOINTS.EVENTS}/organizer/${organizerId}`);
    }

    async getEventsByCategory(categoryId) {
        return await api.get(`${EVENT_ENDPOINTS.EVENTS}/category/${categoryId}`);
    }

    async getAllCategories() {
        return await api.get(EVENT_ENDPOINTS.CATEGORIES);
    }

    async getCategoryById(id) {
        return await api.get(`${EVENT_ENDPOINTS.CATEGORIES}/${id}`);
    }

    // Registration methods
    async registerForEvent(registrationData) {
        return await api.post(`${EVENT_ENDPOINTS.REGISTRATIONS}/register`, registrationData);
    }

    async cancelRegistration(id) {
        return await api.put(`${EVENT_ENDPOINTS.REGISTRATIONS}/${id}/cancel`);
    }

    async getRegistrationsByUser(userId) {
        return await api.get(`${EVENT_ENDPOINTS.REGISTRATIONS}/user/${userId}`);
    }

    async getRegistrationsByEvent(eventId) {
        return await api.get(`${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}`);
    }

    async submitFeedback(eventId, userId, feedback, rating) {
        return await api.post(
            `${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}/user/${userId}/feedback`,
            { feedback, rating }
        );
    }

    async checkInAttendee(eventId, userId) {
        return await api.post(
            `${EVENT_ENDPOINTS.REGISTRATIONS}/event/${eventId}/user/${userId}/check-in`
        );
    }
}

export default new EventService();