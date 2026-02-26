import api from '../api'

export const aiAPI = {
  /**
   * Check if AI Spot Check Should Be Triggered
   * GET /ai/trigger-count
   * 
   * Backend uses data science algorithms to determine if count needed:
   * - Random (20% probability)
   * - Volume-based (sales > 2× average)
   * - Time-based (4+ hours since last count)
   * - Counter-based (10+ sales since last count)
   */
  checkTriggerCount: async () => {
    const deviceId = localStorage.getItem('deviceId') || 'web-' + Date.now()
    const response = await api.get('/ai/trigger-count', {
      params: { device_id: deviceId }
    })
    return response.data
    // Response:
    // {
    //   success: true,
    //   should_trigger: true,
    //   type: "RANDOM" | "VOLUME" | "TIME" | "COUNTER",
    //   priority: 1-4,
    //   reason: "10 sales since last count",
    //   sku_to_check: {
    //     sku_id: "uuid",
    //     brand: "King's Oil",
    //     size: "1L",
    //     current_stock: 95
    //   },
    //   prompt: "Quick Check: How many King's Oil 1L on shelf?"
    // }
  },
}
