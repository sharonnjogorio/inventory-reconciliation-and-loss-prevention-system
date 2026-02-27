import api from '../api'

export const salesAPI = {
  /**
   * Log Single Sale (Online)
   * POST /sales/record
   */
  logSale: async (saleData) => {
    const response = await api.post('/sales/record', {
      sku_id: saleData.sku_id,
      quantity: saleData.quantity,
      unit_price: saleData.unit_price,
      sold_at: saleData.sold_at || new Date().toISOString(),
      device_id: saleData.device_id
    })
    return response.data
  },

  /**
   * Sync Offline Sales Logs (Bulk Upload)
   * POST /sales/sync
   */
  syncOfflineSales: async (salesArray) => {
    const deviceId = localStorage.getItem('deviceId') || 'web-' + Date.now()
    const response = await api.post('/sales/sync', {
      device_id: deviceId,
      sales: salesArray.map(sale => ({
        sale_id: sale.sale_id || sale.id,
        sku_id: sale.sku_id,
        quantity: sale.quantity,
        unit_price: sale.unit_price,
        sold_at: sale.sold_at
      }))
    })
    return response.data
  },

  /**
   * Get Sales History
   * GET /sales/history
   */
  getSalesHistory: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    
    const response = await api.get('/sales/history', { params })
    return response.data
  },

  /**
   * Get Profit Summary
   * GET /sales/profit-summary
   */
  getProfitSummary: async (period = 'today') => {
    const response = await api.get('/sales/profit-summary', {
      params: { period }
    })
    return response.data
  },
}