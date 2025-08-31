import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

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

// SMS Configuration APIs
export const smsService = {
  // Get all SMS configurations
  getSmsConfigurations: async () => {
    try {
      const response = await apiClient.get('/sms/sms-configs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch SMS configurations');
    }
  },

  // Create new SMS configuration
  createSmsConfiguration: async (configData) => {
    try {
      const response = await apiClient.post('/sms/sms-configs', configData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create SMS configuration');
    }
  },

  // Update SMS configuration
  updateSmsConfiguration: async (id, configData) => {
    try {
      const response = await apiClient.put(`/sms/sms-configs/${id}`, configData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update SMS configuration');
    }
  },

  // Delete SMS configuration
  deleteSmsConfiguration: async (id) => {
    try {
      const response = await apiClient.delete(`/sms/sms-configs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete SMS configuration');
    }
  },

  // Send OTP
  sendOtp: async (data) => {
    try {
      const response = await apiClient.post('/sms/send-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send OTP');
    }
  },

  // Verify OTP
  verifyOtp: async (data) => {
    try {
      const response = await apiClient.post('/sms/verify-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to verify OTP');
    }
  },

  // Cleanup expired OTPs
  cleanupExpiredOtps: async () => {
    try {
      const response = await apiClient.post('/sms/cleanup-otps');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to cleanup OTPs');
    }
  }
};

export default smsService;
