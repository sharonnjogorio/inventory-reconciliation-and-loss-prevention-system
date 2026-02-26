import api from '../api';

/**
 * Dashboard API endpoints
 */
const dashboardAPI = {
  /**
   * Get dashboard overview
   * Returns key metrics for owner dashboard
   */
  async getDashboardOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  /**
   * Get top selling products
   * Returns top selling products for specified period
   */
  async getTopSelling(period = 'today', limit = 5) {
    const response = await api.get('/dashboard/top-selling', {
      params: { period, limit }
    });
    return response.data;
  }
};

export default dashboardAPI;
