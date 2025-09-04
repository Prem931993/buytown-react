import { adminApiClient } from './adminService.js';

// Banner API functions
export const bannerService = {
  // Upload banner images
  uploadBanners: async (metadata) => {
    try {
      const response = await adminApiClient.post('/banners/upload', metadata);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload banners');
    }
  },

  // Get all banners
  getBanners: async () => {
    try {
      const response = await adminApiClient.get('/banners');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch banners');
    }
  },

  // Update banner order
  updateBannerOrder: async (bannerOrder) => {
    try {
      const response = await adminApiClient.put('/banners/order', { order: bannerOrder });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update banner order');
    }
  },

  // Delete banner
  deleteBanner: async (id) => {
    try {
      const response = await adminApiClient.delete(`/banners/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete banner');
    }
  },

  // Upload logo images
  uploadLogos: async (metadata) => {
    try {
      const response = await adminApiClient.post('/logos/upload', metadata);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload logos');
    }
  },

  // Get all logos
  getLogos: async () => {
    try {
      const response = await adminApiClient.get('/logos');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch logos');
    }
  },

  // Delete logo
  deleteLogo: async (id) => {
    try {
      const response = await adminApiClient.delete(`/logos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete logo');
    }
  },
};

export default bannerService;
