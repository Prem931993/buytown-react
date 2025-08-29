import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Banner API functions
export const bannerService = {
  // Upload banner images
  uploadBanners: async (metadata) => {
    try {
      const response = await apiClient.post('/banners/upload', metadata);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload banners');
    }
  },

  // Get all banners
  getBanners: async () => {
    try {
      const response = await apiClient.get('/banners');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch banners');
    }
  },

  // Update banner order
  updateBannerOrder: async (bannerOrder) => {
    try {
      const response = await apiClient.put('/banners/order', { order: bannerOrder });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update banner order');
    }
  },

  // Delete banner
  deleteBanner: async (id) => {
    try {
      const response = await apiClient.delete(`/banners/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete banner');
    }
  },

  // Upload logo images
  uploadLogos: async (metadata) => {
    try {
      const response = await apiClient.post('/logos/upload', metadata);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload logos');
    }
  },

  // Get all logos
  getLogos: async () => {
    try {
      const response = await apiClient.get('/logos');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch logos');
    }
  },

  // Delete logo
  deleteLogo: async (id) => {
    try {
      const response = await apiClient.delete(`/logos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete logo');
    }
  },
};

export default bannerService;