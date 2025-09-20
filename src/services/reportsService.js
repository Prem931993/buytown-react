import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ReportsService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get comprehensive reports data
  async getComprehensiveReports({ timeRange = 'last30days', limit = 10 } = {}) {
    try {
      const response = await this.api.get('/reports/comprehensive', {
        params: { timeRange, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive reports:', error);
      throw error;
    }
  }

  // Get top products
  async getTopProducts({ timeRange = 'last30days', limit = 10 } = {}) {
    try {
      const response = await this.api.get('/reports/top-products', {
        params: { timeRange, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  // Get top categories
  async getTopCategories({ timeRange = 'last30days', limit = 10 } = {}) {
    try {
      const response = await this.api.get('/reports/top-categories', {
        params: { timeRange, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top categories:', error);
      throw error;
    }
  }

  // Get sales by region
  async getSalesByRegion({ timeRange = 'last30days', limit = 10 } = {}) {
    try {
      const response = await this.api.get('/reports/sales-by-region', {
        params: { timeRange, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by region:', error);
      throw error;
    }
  }

  // Get dashboard summary
  async getDashboardSummary({ timeRange = 'last30days' } = {}) {
    try {
      const response = await this.api.get('/reports/dashboard-summary', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  // Get payment methods distribution
  async getPaymentMethodsDistribution({ timeRange = 'last30days' } = {}) {
    try {
      const response = await this.api.get('/reports/payment-methods', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods distribution:', error);
      throw error;
    }
  }

  // Get order status distribution
  async getOrderStatusDistribution({ timeRange = 'last30days' } = {}) {
    try {
      const response = await this.api.get('/reports/order-statuses', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order status distribution:', error);
      throw error;
    }
  }
}

const reportsServiceInstance = new ReportsService();
export default reportsServiceInstance;
