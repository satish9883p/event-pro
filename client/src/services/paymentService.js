import api from './api';

export const paymentService = {
  createOrder: async (bookingId) => {
    const response = await api.post('/payments/create-order', { bookingId });
    return response.data;
  },

  verifyPayment: async (payload) => {
    const response = await api.post('/payments/verify', payload);
    return response.data;
  },
};
