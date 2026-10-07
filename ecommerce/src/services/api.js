import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true
});

export const productService = {
  getProductsByStore: async (storeSlug) => {
    const response = await api.get(`/products/store/${storeSlug}`);
    return response.data.data;
  },
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data.data;
  }
};

export default api;
