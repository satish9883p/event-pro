import api from './api';

export const registrationService = {
  registerForEvent: async (eventId) => {
    const response = await api.post(`/registrations/${eventId}/register`);
    return response.data;
  },

  cancelRegistration: async (eventId) => {
    const response = await api.delete(`/registrations/${eventId}/register`);
    return response.data;
  },

  getMyRegistrations: async (params = {}) => {
    const response = await api.get('/registrations/my', { params });
    return response.data;
  },

  getEventRegistrations: async (eventId, params = {}) => {
    const response = await api.get(`/registrations/${eventId}/registrations`, { params });
    return response.data;
  },
};
