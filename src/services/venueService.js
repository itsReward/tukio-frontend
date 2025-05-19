import api from './api';

const VENUE_ENDPOINTS = {
    VENUES: 'tukio-venue-service/api/venues',
};

class VenueService {
    async getAllVenues() {
        return await api.get(VENUE_ENDPOINTS.VENUES);
    }

    async getVenueById(id) {
        return await api.get(`${VENUE_ENDPOINTS.VENUES}/${id}`);
    }

    async createVenue(venueData) {
        return await api.post(VENUE_ENDPOINTS.VENUES, venueData);
    }

    async updateVenue(id, venueData) {
        return await api.put(`${VENUE_ENDPOINTS.VENUES}/${id}`, venueData);
    }

    async deleteVenue(id) {
        return await api.delete(`${VENUE_ENDPOINTS.VENUES}/${id}`);
    }

    async findAvailableVenues(request) {
        return await api.post(`${VENUE_ENDPOINTS.VENUES}/available`, request);
    }

    async getVenueSchedule(venueId, startDate, endDate) {
        let url = `${VENUE_ENDPOINTS.VENUES}/${venueId}/schedule`;
        if (startDate && endDate) {
            url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }
        return await api.get(url);
    }

    async allocateVenue(allocationRequest) {
        return await api.post(`${VENUE_ENDPOINTS.VENUES}/allocate`, allocationRequest);
    }

    async checkVenueAvailability(venueId, startTime, endTime) {
        return await api.get(
            `${VENUE_ENDPOINTS.VENUES}/${venueId}/availability?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
        );
    }

    async cancelVenueBooking(eventId) {
        return await api.delete(`${VENUE_ENDPOINTS.VENUES}/bookings/event/${eventId}`);
    }
}

export default new VenueService();