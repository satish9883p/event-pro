import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await api.patch(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  getAllBookings: async (params = {}) => {
    const response = await api.get('/bookings/all', { params });
    return response.data;
  },

  updateBookingStatus: async (id, statusData) => {
    const response = await api.patch(`/bookings/${id}/status`, statusData);
    return response.data;
  },
};
