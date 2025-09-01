import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance for admin operations
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include admin access token
adminApiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('token'); // Admin access token
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API functions
export const adminService = {
  // Banner operations
  banners: {
    upload: async (metadata) => {
      const response = await adminApiClient.post('/banners/upload', metadata);
      return response.data;
    },
    getAll: async () => {
      const response = await adminApiClient.get('/banners');
      return response.data;
    },
    updateOrder: async (bannerOrder) => {
      const response = await adminApiClient.put('/banners/order', { order: bannerOrder });
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/banners/${id}`);
      return response.data;
    },
  },

  // Logo operations
  logos: {
    upload: async (metadata) => {
      const response = await adminApiClient.post('/logos/upload', metadata);
      return response.data;
    },
    getAll: async () => {
      const response = await adminApiClient.get('/logos');
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/logos/${id}`);
      return response.data;
    },
  },

  // Brand operations
  brands: {
    getAll: async () => {
      const response = await adminApiClient.get('/brands');
      return response.data;
    },
    getById: async (id) => {
      const response = await adminApiClient.get(`/brands/${id}`);
      return response.data;
    },
    create: async (brandData) => {
      const response = await adminApiClient.post('/brands', brandData);
      return response.data;
    },
    update: async (id, brandData) => {
      const response = await adminApiClient.put(`/brands/${id}`, brandData);
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/brands/${id}`);
      return response.data;
    },
    import: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApiClient.post('/brands/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },

  // Category operations
  categories: {
    getAll: async () => {
      const response = await adminApiClient.get('/categories');
      return response.data;
    },
    getRoot: async () => {
      const response = await adminApiClient.get('/categories/root');
      return response.data;
    },
    getById: async (id) => {
      const response = await adminApiClient.get(`/categories/${id}`);
      return response.data;
    },
    getChildren: async (parentId) => {
      const response = await adminApiClient.get(`/categories/${parentId}/children`);
      return response.data;
    },
    create: async (categoryData) => {
      const response = await adminApiClient.post('/categories', categoryData);
      return response.data;
    },
    update: async (id, categoryData) => {
      const response = await adminApiClient.put(`/categories/${id}`, categoryData);
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/categories/${id}`);
      return response.data;
    },
    import: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApiClient.post('/categories/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },

  // Product operations
  products: {
    getAll: async () => {
      const response = await adminApiClient.get('/products');
      return response.data;
    },
    getById: async (id) => {
      const response = await adminApiClient.get(`/products/${id}`);
      return response.data;
    },
    create: async (productData) => {
      const response = await adminApiClient.post('/products', productData);
      return response.data;
    },
    update: async (id, productData) => {
      const response = await adminApiClient.put(`/products/${id}`, productData);
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/products/${id}`);
      return response.data;
    },
    deleteImage: async (imageId) => {
      const response = await adminApiClient.delete(`/products/image/${imageId}`);
      return response.data;
    },
    import: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApiClient.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },

  // SMS operations
  sms: {
    // Get all SMS configurations
    getConfigurations: async () => {
      const response = await adminApiClient.get('/sms/sms-configs');
      return response.data;
    },
    // Create new SMS configuration
    createConfiguration: async (configData) => {
      const response = await adminApiClient.post('/sms/sms-configs', configData);
      return response.data;
    },
    // Update SMS configuration
    updateConfiguration: async (id, configData) => {
      const response = await adminApiClient.put(`/sms/sms-configs/${id}`, configData);
      return response.data;
    },
    // Delete SMS configuration
    deleteConfiguration: async (id) => {
      const response = await adminApiClient.delete(`/sms/sms-configs/${id}`);
      return response.data;
    },
    // Send OTP
    sendOtp: async (data) => {
      const response = await adminApiClient.post('/sms/send-otp', data);
      return response.data;
    },
    // Verify OTP
    verifyOtp: async (data) => {
      const response = await adminApiClient.post('/sms/verify-otp', data);
      return response.data;
    },
    // Cleanup expired OTPs
    cleanupExpiredOtps: async () => {
      const response = await adminApiClient.post('/sms/cleanup-otps');
      return response.data;
    },
  },

  // Dashboard operations
  dashboard: {
    // Get dashboard summary
    getSummary: async () => {
      const response = await adminApiClient.get('/dashboard/summary');
      return response.data;
    },
    // Get orders awaiting confirmation count
    getOrdersAwaitingConfirmation: async () => {
      const response = await adminApiClient.get('/dashboard/orders-awaiting-confirmation');
      return response.data;
    },
    // Get low stock products
    getLowStockProducts: async (limit = 10) => {
      const response = await adminApiClient.get(`/dashboard/low-stock-products?limit=${limit}`);
      return response.data;
    },
    // Get recent sales
    getRecentSales: async (days = 30) => {
      const response = await adminApiClient.get(`/dashboard/recent-sales?days=${days}`);
      return response.data;
    },
    // Get popular products
    getPopularProducts: async (limit = 10) => {
      const response = await adminApiClient.get(`/dashboard/popular-products?limit=${limit}`);
      return response.data;
    },
    // Get most used delivery vehicles
    getMostUsedDeliveryVehicles: async () => {
      const response = await adminApiClient.get('/dashboard/delivery-vehicles');
      return response.data;
    },
    // Get total products count
    getTotalProductsCount: async () => {
      const response = await adminApiClient.get('/dashboard/total-products');
      return response.data;
    },
    // Get total orders count
    getTotalOrdersCount: async () => {
      const response = await adminApiClient.get('/dashboard/total-orders');
      return response.data;
    },
    // Get total users count
    getTotalUsersCount: async () => {
      const response = await adminApiClient.get('/dashboard/total-users');
      return response.data;
    },
    // Get total revenue
    getTotalRevenue: async () => {
      const response = await adminApiClient.get('/dashboard/total-revenue');
      return response.data;
    },
    // Get monthly revenue
    getMonthlyRevenue: async () => {
      const response = await adminApiClient.get('/dashboard/monthly-revenue');
      return response.data;
    },
    // Get order statistics
    getOrderStatistics: async () => {
      const response = await adminApiClient.get('/dashboard/order-statistics');
      return response.data;
    },
  },

  // Auth operations
  auth: {
    // Admin login
    login: async (identity, password, apiToken) => {
      const response = await adminApiClient.post(
        '/auth/admin/login',
        { identity, password },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      return response.data;
    },
    // Logout
    logout: async (token) => {
      const response = await adminApiClient.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  },
};

export default adminService;
