import api from './api';

export const functionHallService = {
  getFunctionHalls: async (params = {}) => {
    const response = await api.get('/halls', { params });
    return response.data;
  },

  getFunctionHallById: async (id) => {
    const response = await api.get(`/halls/${id}`);
    return response.data;
  },

  checkSlotAvailability: async (id, date, timeSlot) => {
    const response = await api.get(`/halls/${id}/check-slot`, {
      params: { date, timeSlot },
    });
    return response.data;
  },

  createFunctionHall: async (data) => {
    const response = await api.post('/halls', data);
    return response.data;
  },

  updateFunctionHall: async (id, data) => {
    const response = await api.put(`/halls/${id}`, data);
    return response.data;
  },

  deleteFunctionHall: async (id) => {
    const response = await api.delete(`/halls/${id}`);
    return response.data;
  },

  addReview: async (id, data) => {
    const response = await api.post(`/halls/${id}/reviews`, data);
    return response.data;
  },
};
