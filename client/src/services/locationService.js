import api from './api';

export const locationService = {
  getHierarchy: async () => {
    const response = await api.get('/locations/hierarchy');
    return response.data;
  },

  getStates: async () => {
    const response = await api.get('/locations/states');
    return response.data;
  },

  getDistricts: async (state) => {
    const response = await api.get('/locations/districts', { params: { state } });
    return response.data;
  },

  getAreas: async (state, district) => {
    const response = await api.get('/locations/areas', { params: { state, district } });
    return response.data;
  },

  createLocation: async (data) => {
    const response = await api.post('/locations', data);
    return response.data;
  },

  deleteLocation: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};
