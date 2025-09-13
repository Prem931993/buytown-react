import { adminApiClient } from './adminService';

const generalSettingsService = {
  getSettings: async () => {
    const response = await adminApiClient.get('/general-settings');
    return response.data;
  },
  updateSettings: async (settingsData) => {
    const response = await adminApiClient.put('/general-settings', settingsData);
    return response.data;
  }
};

export default generalSettingsService;
