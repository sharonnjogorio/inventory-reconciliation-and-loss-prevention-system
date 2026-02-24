import api from '../api'

export const notificationsAPI = {
  /**
   * Send WhatsApp/SMS Notification for an Alert (Owner Only)
   * POST /notifications/send
   */
  sendNotification: async (alertId) => {
    const response = await api.post('/notifications/send', {
      alert_id: alertId
    })
    return response.data
  },

  /**
   * Get Notification Delivery Logs
   * GET /notifications/logs
   */
  getNotificationLogs: async (params = {}) => {
    const response = await api.get('/notifications/logs', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20
      }
    })
    return response.data
  },
}