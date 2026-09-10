import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteReview: async (hallId, reviewId) => {
    const response = await api.delete(`/admin/reviews/${hallId}/${reviewId}`);
    return response.data;
  },
};
