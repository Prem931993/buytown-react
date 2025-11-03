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
    getForDropdown: async () => {
      const response = await adminApiClient.get('/brands/dropdown');
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
    getAll: async (params = {}) => {
      const response = await adminApiClient.get('/categories', { params });
      return response.data;
    },
    getForDropdown: async () => {
      const response = await adminApiClient.get('/categories/dropdown');
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
    getAll: async (params = {}) => {
      const response = await adminApiClient.get('/products', { params });
      return response.data;
    },
    searchForOrder: async (params = {}) => {
      const response = await adminApiClient.get('/products/search-for-order', { params });
      return response.data;
    },
    getAvailableForOrder: async (orderId, params = {}) => {
      const response = await adminApiClient.get(`/products/available-for-order/${orderId}`, { params });
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
      let data = productData;
      let headers = {};

      // If productData contains images or is FormData, use FormData
      if (productData instanceof FormData || (productData.images && productData.images.length > 0) || productData.images_to_remove || productData.image_updates) {
        const formData = productData instanceof FormData ? productData : new FormData();

        if (!(productData instanceof FormData)) {
          // Append new images if provided
          if (productData.images && productData.images.length > 0) {
            productData.images.forEach((image, index) => {
              formData.append('images', image);
            });
          }

          // Append images to remove if provided
          if (productData.images_to_remove && productData.images_to_remove.length > 0) {
            formData.append('images_to_remove', JSON.stringify(productData.images_to_remove));
          }

          // Append image updates (for reordering/setting primary) if provided
          if (productData.image_updates) {
            formData.append('image_updates', JSON.stringify(productData.image_updates));
          }

          // Append other product data
          Object.keys(productData).forEach(key => {
            if (key !== 'images' && key !== 'images_to_remove' && key !== 'image_updates' && productData[key] !== null && productData[key] !== undefined) {
              formData.append(key, productData[key]);
            }
          });
        }

        data = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await adminApiClient.put(`/products/${id}`, data, { headers });
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
    updateImages: async (id, imageData) => {
      const formData = new FormData();

      // Append new images if provided
      if (imageData.images && imageData.images.length > 0) {
        imageData.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      // Append images to remove if provided
      if (imageData.images_to_remove && imageData.images_to_remove.length > 0) {
        formData.append('images_to_remove', JSON.stringify(imageData.images_to_remove));
      }

      // Append image updates (for reordering/setting primary) if provided
      if (imageData.image_updates) {
        formData.append('image_updates', JSON.stringify(imageData.image_updates));
      }

      const response = await adminApiClient.put(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
    getForDropdown: async () => {
      const response = await adminApiClient.get('/variations/dropdown');
      return response.data;
    },
    autocompleteVariations: async (query) => {
      const response = await adminApiClient.get('/variations/autocomplete', {
        params: { q: query }
      });
      return response.data;
    },
    create: async (variationData) => {
      const response = await adminApiClient.post('/variations', variationData);
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
    getSummary: async () => {
      const response = await adminApiClient.get('/dashboard/summary');
      return response.data;
    },
    getOrdersAwaitingConfirmation: async () => {
      const response = await adminApiClient.get('/dashboard/orders-awaiting-confirmation/list');
      return response.data;
    },
    getLowStockProducts: async (limit) => {
      const response = await adminApiClient.get(`/dashboard/low-stock-products?limit=${limit}`);
      return response.data;
    },
    getRecentSales: async (days) => {
      const response = await adminApiClient.get(`/dashboard/recent-sales?days=${days}`);
      return response.data;
    },
    getPopularProducts: async (limit) => {
      const response = await adminApiClient.get(`/dashboard/popular-products?limit=${limit}`);
      return response.data;
    },
    getMostUsedDeliveryVehicles: async () => {
      const response = await adminApiClient.get('/dashboard/delivery-vehicles');
      return response.data;
    },
    getTopCustomers: async (limit) => {
      const response = await adminApiClient.get(`/dashboard/top-customers?limit=${limit}`);
      return response.data;
    },
    getAllCustomersWithOrders: async () => {
      const response = await adminApiClient.get('/dashboard/all-customers-with-orders');
      return response.data;
    }
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
    getVehiclesWithDeliveryPersons: async () => {
      const response = await adminApiClient.get('/vehicles/with-delivery-persons');
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
    calculateDeliveryCharge: async (vehicleId, distanceKm) => {
      const response = await adminApiClient.post('/vehicles/calculate-charge', {
        vehicleId,
        distanceKm
      });
      return response.data;
    },
  },

  // Delivery operations
  delivery: {
    getAllSettings: async () => {
      const response = await adminApiClient.get('/delivery');
      return response.data;
    },
    getSettings: async () => {
      const response = await adminApiClient.get('/delivery/single');
      return response.data;
    },
    createSetting: async (settingData) => {
      const response = await adminApiClient.post('/delivery', settingData);
      return response.data;
    },
    updateSetting: async (id, settingData) => {
      const response = await adminApiClient.put(`/delivery/${id}`, settingData);
      return response.data;
    },
    deleteSetting: async (id) => {
      const response = await adminApiClient.delete(`/delivery/${id}`);
      return response.data;
    },
    updateSettings: async (settingsData) => {
      const response = await adminApiClient.put('/delivery', settingsData);
      return response.data;
    },
  },

  // Pages operations
  pages: {
    getAll: async () => {
      const response = await adminApiClient.get('/pages');
      return response.data;
    },
    getById: async (id) => {
      const response = await adminApiClient.get(`/pages/${id}`);
      return response.data;
    },
    create: async (pageData) => {
      const response = await adminApiClient.post('/pages', pageData);
      return response.data;
    },
    update: async (id, pageData) => {
      const response = await adminApiClient.put(`/pages/${id}`, pageData);
      return response.data;
    },
    delete: async (id) => {
      const response = await adminApiClient.delete(`/pages/${id}`);
      return response.data;
    },
    getPublished: async () => {
      const response = await adminApiClient.get('/pages/published');
      return response.data;
    },
    getDrafts: async () => {
      const response = await adminApiClient.get('/pages/drafts');
      return response.data;
    },
  },

  // Notification operations
  notifications: {
    // Get notifications
    getNotifications: async (params = {}) => {
      const response = await adminApiClient.get('/notifications', { params });
      return response.data;
    },
    // Mark notification as read
    markAsRead: async (notificationId) => {
      const response = await adminApiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    },
    // Get unread notification count
    getUnreadCount: async () => {
      const response = await adminApiClient.get('/notifications/unread-count');
      return response.data;
    },
  },

  // General Settings operations
  generalSettings: {
    // Get general settings
    getSettings: async () => {
      const response = await adminApiClient.get('/general-settings');
      return response.data;
    },
    // Update general settings
    updateSettings: async (settingsData) => {
      const response = await adminApiClient.put('/general-settings', settingsData);
      return response.data;
    },
  },

  // Order operations
  orders: {
    // Get all orders
    getAll: async (params = {}) => {
      const response = await adminApiClient.get('/orders', { params });
      return response.data;
    },
    // Get order by ID
    getById: async (orderId) => {
      const response = await adminApiClient.get(`/orders/${orderId}`);
      return response.data;
    },
    // Update order status
    updateStatus: async (orderId, status) => {
      const response = await adminApiClient.put(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    // Get orders by status
    getByStatus: async (status) => {
      const response = await adminApiClient.get(`/orders/status/${status}`);
      return response.data;
    },
    // Get order statistics
    getStatistics: async () => {
      const response = await adminApiClient.get('/orders/statistics');
      return response.data;
    },
    // Approve order
    approve: async (orderId, vehicleId, deliveryDistance, deliveryPersonId = null) => {
      const response = await adminApiClient.put(`/orders/${orderId}/approve`, {
        vehicle_id: vehicleId,
        delivery_distance: deliveryDistance,
        delivery_person_id: deliveryPersonId
      });
      return response.data;
    },
    // Reject order
    reject: async (orderId, rejectionReason) => {
      const response = await adminApiClient.put(`/orders/${orderId}/reject`, {
        rejection_reason: rejectionReason
      });
      return response.data;
    },
    // Assign delivery person
    assignDeliveryPerson: async (orderId, deliveryPersonId, deliveryDistance) => {
      const response = await adminApiClient.put(`/orders/${orderId}/assign-delivery`, {
        delivery_person_id: deliveryPersonId,
        delivery_distance: deliveryDistance
      });
      return response.data;
    },
    // Mark order as completed
    markOrderCompleted: async (orderId) => {
      const response = await adminApiClient.put(`/orders/${orderId}/complete`);
      return response.data;
    },
    // PDF operations
    generateInvoicePDF: async (orderId) => {
      const response = await adminApiClient.post(`/orders/${orderId}/generate-invoice-pdf`, {}, {
        responseType: 'blob'
      });
      return response.data;
    },
    generateConfirmationPDF: async (orderId) => {
      const response = await adminApiClient.post(`/orders/${orderId}/generate-confirmation-pdf`, {}, {
        responseType: 'blob'
      });
      return response.data;
    },
    getInvoicesByOrder: async (orderId) => {
      const response = await adminApiClient.get(`/orders/${orderId}/invoices`);
      return response.data;
    },
    getAllInvoices: async (params = {}) => {
      const response = await adminApiClient.get('/orders/invoices', { params });
      return response.data;
    },
    getInvoices: async (params = {}) => {
      const response = await adminApiClient.get('/invoices', { params });
      return response.data;
    },
    getInvoiceById: async (invoiceId) => {
      const response = await adminApiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    },
    // Calculate delivery charges
    calculateDeliveryCharge: async (orderId, vehicleId, deliveryDistance) => {
      const response = await adminApiClient.post(`/orders/${orderId}/calculate-delivery-charge`, {
        vehicle_id: vehicleId,
        delivery_distance: deliveryDistance
      });
      return response.data;
    },
    // Order Item Management
    addOrderItem: async (orderId, itemData) => {
      const response = await adminApiClient.post(`/orders/${orderId}/items`, itemData);
      return response.data;
    },
    updateOrderItem: async (orderId, itemId, updateData) => {
      const response = await adminApiClient.put(`/orders/${orderId}/items/${itemId}`, updateData);
      return response.data;
    },
    removeOrderItem: async (orderId, itemId) => {
      const response = await adminApiClient.delete(`/orders/${orderId}/items/${itemId}`);
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
