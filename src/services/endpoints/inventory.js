import api from '../api'

export const inventoryAPI = {
  /**
   * Get Shop Inventory Summary
   * GET /inventory/summary
   */
  getInventorySummary: async () => {
    const response = await api.get('/inventory/summary')
    return response.data
  },

  /**
   * Record Restock (Ordered vs Received)
   * POST /inventory/restock
   */
  recordRestock: async (data) => {
    const response = await api.post('/inventory/restock', {
      sku_id: data.skuId,
      quantity_ordered: data.quantityOrdered,
      quantity_received: data.quantityReceived,
      cost_per_unit: data.costPrice,
      supplier_name: data.supplierName || null,
      notes: data.notes || null
    })
    return response.data
  },

  /**
   * Convert Cartons into Units (Decant)
   * POST /inventory/decant
   * Default: 1 carton = 12 bottles
   */
  decantCartons: async (skuId, cartons) => {
    const response = await api.post('/inventory/decant', {
      sku_id: skuId,
      cartons: cartons
    })
    return response.data
  },
}