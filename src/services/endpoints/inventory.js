// src/services/endpoints/inventory.js
import api from '../api'

export const inventoryAPI = {
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
      ordered_qty: data.orderedQty,      // match Swagger
      received_qty: data.receivedQty,    // match Swagger
      cost_price: data.costPrice,
      selling_price: data.sellPrice,     // Fixed: backend expects selling_price
      supplier_name: data.supplierName || null,
      reference_note: data.referenceNote || null,
    })
    return response.data
  },

  /**
   * Convert Cartons into Units (Decant)
   * POST /inventory/decant
   * Default: 1 carton = 12 bottles
   */
  decantCartons: async (fromSkuId, toSkuId, cartons, unitsPerCarton = 12) => {
    const response = await api.post('/inventory/decant', {
      from_sku_id: fromSkuId,
      to_sku_id: toSkuId,
      cartons,
      units_per_carton: unitsPerCarton,
    })
    return response.data
  },

  /**
   * Update SKU Inventory Details (prices, reorder level)
   * PATCH /inventory/skus/:sku_id
   */
  updateSKUInventory: async (skuId, data) => {
    const response = await api.patch(`/inventory/skus/${skuId}`, {
      cost_price: data.costPrice,
      selling_price: data.sellingPrice,
      reorder_level: data.reorderLevel,
    })
    return response.data
  },
}
