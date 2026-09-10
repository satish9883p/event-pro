import api from './api';

export const aiService = {
  sendMessage: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await api.get('/ai/history');
    return response.data;
  },

  clearChatHistory: async () => {
    const response = await api.delete('/ai/history');
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/ai/history/${messageId}`);
    return response.data;
  },
};
