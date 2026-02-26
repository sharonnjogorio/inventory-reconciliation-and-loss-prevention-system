import api from '../api'

export const alertsAPI = {
  /**
   * Get Alerts with Filters
   * GET /alerts
   */
  getAlerts: async (filters = {}) => {
    const response = await api.get('/alerts', {
      params: filters
    })
    return response.data
  },

  /**
   * Get Alerts Summary (for dashboard)
   * GET /alerts/summary
   */
  getAlertsSummary: async (days = 7) => {
    const response = await api.get('/alerts/summary', {
      params: { days }
    })
    return response.data
  },

  /**
   * Get Single Alert Details
   * GET /alerts/:id
   */
  getAlertDetails: async (alertId) => {
    const response = await api.get(`/alerts/${alertId}`)
    return response.data
  },

  /**
   * Resolve Alert
   * PATCH /alerts/:id/resolve
   */
  resolveAlert: async (alertId, notes = '') => {
    const response = await api.patch(`/alerts/${alertId}/resolve`, {
      notes
    })
    return response.data
  },
}
