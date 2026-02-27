import api from '../api'

export const auditAPI = {
  /**
   * Check if Staff Should Be Prompted for Quick Count
   * GET /ai/trigger-count
   * 
   * This endpoint checks if the AI system wants to trigger a spot check
   * based on sales velocity, random intervals, or anomaly detection
   */
  checkTriggerCount: async () => {
    const response = await api.get('/ai/trigger-count')
    return response.data
    // Response: 
    // {
    //   trigger: true/false,
    //   sku_id: 123,
    //   reason: "anomaly" | "random" | "velocity"
    // }
  },

  /**
   * Verify Physical Count and Detect Variance
   * POST /audit/verify
   * 
   * This is called when staff completes a Quick Count.
   * Backend compares physical count vs system expected count.
   * If variance > 10%, it creates an alert and sends WhatsApp notification.
   */
  verifyPhysicalCount: async (data) => {
    const response = await api.post('/audit/verify', {
      sku_id: data.skuId,
      physical_count: data.physicalCount,
      counted_at: data.countedAt
    })
    return response.data
    // Response:
    // {
    //   success: true,
    //   verification: {
    //     expected_stock: 97,
    //     physical_count: 95,
    //     variance: -2,
    //     variance_percent: -2.06,
    //     alert_level: "MINOR" | "WARNING" | "CRITICAL" | "NORMAL",
    //     alert_triggered: true,
    //     estimated_loss: 9.00
    //   }
    // }
  },

  /**
   * Get Audit History
   * GET /audit/history
   */
  getAuditHistory: async (filters = {}) => {
    const response = await api.get('/audit/history', {
      params: filters
    })
    return response.data
  },
}