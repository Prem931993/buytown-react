import { adminApiClient } from './adminService.js';

// SMS Configuration APIs
export const smsService = {
  // Get all SMS configurations
  getSmsConfigurations: async () => {
    try {
      const response = await adminApiClient.get('/sms/sms-configs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch SMS configurations');
    }
  },

  // Create new SMS configuration
  createSmsConfiguration: async (configData) => {
    try {
      const response = await adminApiClient.post('/sms/sms-configs', configData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create SMS configuration');
    }
  },

  // Update SMS configuration
  updateSmsConfiguration: async (id, configData) => {
    try {
      const response = await adminApiClient.put(`/sms/sms-configs/${id}`, configData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update SMS configuration');
    }
  },

  // Delete SMS configuration
  deleteSmsConfiguration: async (id) => {
    try {
      const response = await adminApiClient.delete(`/sms/sms-configs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete SMS configuration');
    }
  },

  // Send OTP
  sendOtp: async (data) => {
    try {
      const response = await adminApiClient.post('/sms/send-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send OTP');
    }
  },

  // Verify OTP
  verifyOtp: async (data) => {
    try {
      const response = await adminApiClient.post('/sms/verify-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to verify OTP');
    }
  },

  // Cleanup expired OTPs
  cleanupExpiredOtps: async () => {
    try {
      const response = await adminApiClient.post('/sms/cleanup-otps');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to cleanup OTPs');
    }
  }
};

export default smsService;
