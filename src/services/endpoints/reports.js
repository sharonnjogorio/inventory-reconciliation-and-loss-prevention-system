import api from '../api'

export const reportsAPI = {
  /**
   * Fetch Deviation and Estimated Loss Report
   * GET /reports/deviation
   */
  getDeviationReport: async (params = {}) => {
    const response = await api.get('/reports/deviation', {
      params: {
        start_date: params.startDate,
        end_date: params.endDate
      }
    })
    return response.data
  },

  /**
   * Get Staff Performance Metrics (Owner Only)
   * GET /reports/staff-performance
   */
  getStaffPerformance: async (params = {}) => {
    const response = await api.get('/reports/staff-performance', {
      params: {
        staff_id: params.staffId,
        start_date: params.startDate,
        end_date: params.endDate
      }
    })
    return response.data
  },

  /**
   * Get Sales Velocity Metrics for AI Anomaly Detection
   * GET /reports/sales-velocity
   */
  getSalesVelocity: async (params = {}) => {
    const response = await api.get('/reports/sales-velocity', {
      params: {
        sku_id: params.skuId
      }
    })
    return response.data
  },

  /**
   * Export Deviation Report as CSV
   * GET /reports/export
   */
  exportDeviationReport: async (params = {}) => {
    const response = await api.get('/reports/export', {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
        format: 'csv'
      },
      responseType: 'blob'
    })
    
    // Download CSV file
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `deviation-report-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    return response.data
  },
}