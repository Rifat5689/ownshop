import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
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
