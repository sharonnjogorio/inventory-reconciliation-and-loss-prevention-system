import api from '../api'

export const reportsAPI = {
  /**
   * Get Deviation Report
   * GET /reports/deviation
   */
  getDeviationReport: async (params = {}) => {
    const response = await api.get('/reports/deviation', {
      params
    })
    return response.data
  },

  /**
   * Get Staff Performance Report
   * GET /reports/staff-performance
   */
  getStaffPerformanceReport: async (params = {}) => {
    const response = await api.get('/reports/staff-performance', {
      params
    })
    return response.data
  },

  /**
   * Get Inventory Turnover Report
   * GET /reports/inventory-turnover
   */
  getInventoryTurnoverReport: async (params = {}) => {
    const response = await api.get('/reports/inventory-turnover', {
      params
    })
    return response.data
  },

  /**
   * Get Sales Trend Report
   * GET /reports/sales-trend
   */
  getSalesTrendReport: async (params = {}) => {
    const response = await api.get('/reports/sales-trend', {
      params
    })
    return response.data
  },
}
