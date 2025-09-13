import { adminApiClient } from './adminService.js';

// Category API functions
export const categoryService = {
  // Get all enabled categories with images
  getAllEnabledCategoriesWithImages: async () => {
    try {
      const response = await adminApiClient.get('/categories?limit=100');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },
};

export default categoryService;
