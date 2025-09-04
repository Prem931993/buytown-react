import { adminApiClient } from './adminService.js';

// Logo API functions
export const logoService = {
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

export default logoService;
