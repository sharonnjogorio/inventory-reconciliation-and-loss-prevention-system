import api from '../api'

export const alertsAPI = {
  /**
   * List Alerts for Current Shop
   * GET /alerts
   */
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts', {
      params: {
        status: params.status, // 'new', 'acknowledged', 'resolved'
        page: params.page || 1,
        limit: params.limit || 20
      }
    })
    return response.data
  },

  /**
   * Resolve an Alert (Owner Only)
   * PATCH /alerts/{id}/resolve
   */
  resolveAlert: async (alertId) => {
    const response = await api.patch(`/alerts/${alertId}/resolve`)
    return response.data
  },
}