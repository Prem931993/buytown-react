import axios from 'axios';
import { tokenManager, refreshAccessToken } from './authService.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance for admin operations
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor to include both api token and access token
adminApiClient.interceptors.request.use(
  (config) => {
    const apiToken = localStorage.getItem('apiToken'); // Store api token separately
    const accessToken = tokenManager.getAccessToken();

    if (apiToken) {
      config.headers.Authorization = `Bearer ${apiToken}`;
    }
    if (accessToken) {
      config.headers['X-Admin-Token'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['X-Admin-Token'] = `Bearer ${token}`;
          return adminApiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAccessToken();

        // Update the original request with new token (update X-Admin-Token, keep Authorization as apiToken)
        originalRequest.headers['X-Admin-Token'] = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

  // Variation operations
  variations: {
    getAll: async () => {
      const response = await adminApiClient.get('/variations');
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

  // Configuration operations
  config: {
    // Email configurations
    getEmailConfigs: async () => {
      const response = await adminApiClient.get('/config/email-configs');
      return response.data;
    },
    createEmailConfig: async (configData) => {
      const response = await adminApiClient.post('/config/email-configs', configData);
      return response.data;
    },
    updateEmailConfig: async (id, configData) => {
      const response = await adminApiClient.put(`/config/email-configs/${id}`, configData);
      return response.data;
    },
    deleteEmailConfig: async (id) => {
      const response = await adminApiClient.delete(`/config/email-configs/${id}`);
      return response.data;
    },

    // Tax configurations
    getTaxConfigs: async () => {
      const response = await adminApiClient.get('/config/tax-configs');
      return response.data;
    },
    createTaxConfig: async (configData) => {
      const response = await adminApiClient.post('/config/tax-configs', configData);
      return response.data;
    },
    updateTaxConfig: async (id, configData) => {
      const response = await adminApiClient.put(`/config/tax-configs/${id}`, configData);
      return response.data;
    },
    deleteTaxConfig: async (id) => {
      const response = await adminApiClient.delete(`/config/tax-configs/${id}`);
      return response.data;
    },

    // Payment configurations
    getPaymentConfigs: async () => {
      const response = await adminApiClient.get('/config/payment-configs');
      return response.data;
    },
    createPaymentConfig: async (configData) => {
      const response = await adminApiClient.post('/config/payment-configs', configData);
      return response.data;
    },
    updatePaymentConfig: async (id, configData) => {
      const response = await adminApiClient.put(`/config/payment-configs/${id}`, configData);
      return response.data;
    },
    deletePaymentConfig: async (id) => {
      const response = await adminApiClient.delete(`/config/payment-configs/${id}`);
      return response.data;
    },
  },

  // User operations
  users: {
    getAll: async () => {
      const response = await adminApiClient.get('/users');
      return response.data;
    },
    getById: async (id) => {
      const response = await adminApiClient.get(`/users/${id}`);
      return response.data;
    },
    create: async (userData) => {
      const response = await adminApiClient.post('/users', userData);
      return response.data;
    },
    update: async (id, userData) => {
      const response = await adminApiClient.put(`/users/${id}`, userData);
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/users/${id}`);
      return response.data;
    },
    import: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApiClient.post('/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },

  // Vehicle operations
  vehicles: {
    getAll: async () => {
      const response = await adminApiClient.get('/vehicles');
      return response.data;
    },
    getById: async (id) => {
      const response = await adminApiClient.get(`/vehicles/${id}`);
      return response.data;
    },
    create: async (vehicleData) => {
      const response = await adminApiClient.post('/vehicles', vehicleData);
      return response.data;
    },
    update: async (id, vehicleData) => {
      const response = await adminApiClient.put(`/vehicles/${id}`, vehicleData);
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/vehicles/${id}`);
      return response.data;
    },
  },

  // Delivery operations
  delivery: {
    getSettings: async () => {
      const response = await adminApiClient.get('/delivery/settings');
      return response.data;
    },
    updateSettings: async (settingsData) => {
      const response = await adminApiClient.put('/delivery/settings', settingsData);
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

      // Store both access and refresh tokens, and also store the admin token and api token
      if (response.data.accessToken && response.data.refreshToken) {
        tokenManager.setTokens(response.data.accessToken, response.data.refreshToken, response.data.adminToken);
        localStorage.setItem('apiToken', apiToken); // Store api token for subsequent requests
      }

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
    // Forgot password
    forgotPassword: async (email) => {
      const response = await adminApiClient.post('/auth/forgot-password', { email });
      return response.data;
    },
    // Reset password
    resetPassword: async (token, newPassword) => {
      const response = await adminApiClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    },
  },
};

export { adminApiClient };
export default adminService;
