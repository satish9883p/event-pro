import api from './api';

export const venueService = {
  getVenues: async (params = {}) => {
    const response = await api.get('/venues', { params });
    return response.data;
  },

  getMyVenues: async () => {
    const response = await api.get('/venues/my');
    return response.data;
  },

  getOwnerBookingRequests: async () => {
    const response = await api.get('/venues/owner-bookings');
    return response.data;
  },

  getMyBookingRequests: async () => {
    const response = await api.get('/venues/my-bookings');
    return response.data;
  },

  createVenue: async (data) => {
    const response = await api.post('/venues', data);
    return response.data;
  },

  updateVenue: async (id, data) => {
    const response = await api.put(`/venues/${id}`, data);
    return response.data;
  },

  updateVenueStatus: async (id, approvalStatus) => {
    const response = await api.patch(`/venues/${id}/status`, { approvalStatus });
    return response.data;
  },

  addBookingRequest: async (venueId, data) => {
    const response = await api.post(`/venues/${venueId}/booking-requests`, data);
    return response.data;
  },

  updateBookingRequestStatus: async (id, status) => {
    const response = await api.patch(`/venues/booking-requests/${id}/status`, { status });
    return response.data;
  },
};
