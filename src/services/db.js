import Dexie from 'dexie'

const db = new Dexie('SmartLossControl')

// Version 2: Add synced index to pending_sales
db.version(2).stores({
  // Staff authentication
  staff: 'id, name, pin, device_id, shop_id, session_token',
  sessions: '++id, staff_id, staff_name, login_time, logout_time',
  
  // Inventory (local copy synced from server)
  inventory: 'id, brand, size, qty_cartons, qty_bottles, cost_price, sell_price, last_updated',
  
  // Sales (offline queue) - Enhanced for sync tracking
  sales: '++id, sale_id, staff_id, timestamp, synced, items, total',
  
  // Pending sales (not yet synced to backend) - Added synced to indexes
  pending_sales: '++id, sale_id, sku_id, synced, sold_at',
  
  // Audit logs (Quick Counts, Carton Breaks)
  audit_logs: '++id, type, staff_id, product_id, timestamp, expected, actual, deviation',
  
  // Sync queue (failed API calls to retry)
  sync_queue: '++id, type, data, synced, retries, last_attempt'
})

export default db
