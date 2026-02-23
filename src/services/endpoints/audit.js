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
      staff_id: data.staffId
    })
    return response.data
    // Response:
    // {
    //   variance: 2,              // Difference (expected - actual)
    //   expected: 67,             // System expected count
    //   actual: 65,               // Physical count submitted
    //   alert_created: true,      // Whether alert was created (variance > 10%)
    //   estimated_loss: 31.22     // Financial loss in USD
    // }
  },
}