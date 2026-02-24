import api from '../api'

export const salesAPI = {
  /**
   * Sync Offline Sales Logs (Bulk Upload)
   * POST /sales/sync
   */
  syncOfflineSales: async (salesArray) => {
    const response = await api.post('/sales/sync', {
      sales: salesArray.map(sale => ({
        sku_id: sale.skuId,
        quantity: sale.quantity,
        sale_price: sale.salePrice,
        timestamp: sale.timestamp
      }))
    })
    return response.data
  },
}