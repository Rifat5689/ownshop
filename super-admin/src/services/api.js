import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://myshop-bhh4bggcgkd9e6hq.centralindia-01.azurewebsites.net/api/v1',
  withCredentials: true
});

export const storeService = {
  getStores: async () => {
    const response = await api.get('/stores');
    return response.data.data;
  },
  createStore: async (storeData) => {
    const response = await api.post('/stores', storeData);
    return response.data.data;
  }
};

export default api;
