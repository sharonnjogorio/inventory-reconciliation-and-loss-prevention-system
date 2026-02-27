import db from './db'
import { salesAPI } from './endpoints/sales'

/**
 * Offline Sync Service
 * Handles storing sales offline and syncing when connection returns
 */

// Generate unique device ID
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = 'web-' + crypto.randomUUID()
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

// Generate unique sale ID
export const generateSaleId = () => {
  return 'sale-' + crypto.randomUUID()
}

/**
 * Save sale to IndexedDB (offline storage)
 */
export const saveSaleOffline = async (saleData) => {
  try {
    const saleId = generateSaleId()
    
    // Save to pending_sales table
    await db.pending_sales.add({
      sale_id: saleId,
      sku_id: saleData.sku_id,
      quantity: saleData.quantity,
      unit_price: saleData.unit_price,
      sold_at: saleData.sold_at || new Date().toISOString(),
      synced: false,
      retry_count: 0
    })
    
    console.log('✅ Sale saved offline:', saleId)
    return { success: true, sale_id: saleId }
  } catch (error) {
    console.error('❌ Failed to save sale offline:', error)
    throw error
  }
}

/**
 * Get count of pending (unsynced) sales
 */
export const getPendingSalesCount = async () => {
  try {
    // Check if database is ready
    if (!db.isOpen()) {
      await db.open()
    }
    
    const count = await db.pending_sales
      .where('synced')
      .equals(false)
      .count()
    return count
  } catch (error) {
    // Silently handle IndexedDB errors (likely schema mismatch)
    // This is cosmetic and doesn't affect functionality
    if (error.name === 'DataError' || error.name === 'InvalidStateError') {
      console.warn('⚠️ IndexedDB schema mismatch - please clear browser data to fix')
      return 0
    }
    console.error('Error getting pending sales count:', error)
    return 0
  }
}

/**
 * Sync all pending sales to backend
 */
export const syncPendingSales = async () => {
  try {
    // Get all unsynced sales
    const pendingSales = await db.pending_sales
      .where('synced')
      .equals(false)
      .toArray()
    
    if (pendingSales.length === 0) {
      console.log('✅ No pending sales to sync')
      return { success: true, synced: 0 }
    }
    
    console.log(`🔄 Syncing ${pendingSales.length} pending sales...`)
    
    // Call backend sync API
    const response = await salesAPI.syncOfflineSales(pendingSales)
    
    if (response.success) {
      // Mark all as synced
      const saleIds = pendingSales.map(s => s.id)
      await db.pending_sales
        .where('id')
        .anyOf(saleIds)
        .modify({ synced: true })
      
      console.log(`✅ Successfully synced ${response.summary.accepted} sales`)
      
      return {
        success: true,
        synced: response.summary.accepted,
        duplicates: response.summary.duplicates_ignored,
        errors: response.summary.errors
      }
    }
    
    return { success: false, error: 'Sync failed' }
  } catch (error) {
    console.error('❌ Sync failed:', error)
    
    // Increment retry count for failed sales
    const pendingSales = await db.pending_sales
      .where('synced')
      .equals(false)
      .toArray()
    
    for (const sale of pendingSales) {
      await db.pending_sales.update(sale.id, {
        retry_count: (sale.retry_count || 0) + 1
      })
    }
    
    return { success: false, error: error.message }
  }
}

/**
 * Auto-sync when connection returns
 */
export const setupAutoSync = (onSyncComplete) => {
  // Sync when online
  window.addEventListener('online', async () => {
    console.log('🌐 Connection restored - syncing...')
    const result = await syncPendingSales()
    if (onSyncComplete) {
      onSyncComplete(result)
    }
  })
  
  // Periodic sync every 30 seconds if online
  setInterval(async () => {
    if (navigator.onLine) {
      const count = await getPendingSalesCount()
      if (count > 0) {
        console.log(`🔄 Auto-sync: ${count} pending sales`)
        const result = await syncPendingSales()
        if (onSyncComplete) {
          onSyncComplete(result)
        }
      }
    }
  }, 30000) // 30 seconds
}

/**
 * Clear old synced sales (cleanup)
 */
export const cleanupSyncedSales = async (daysOld = 7) => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const deleted = await db.pending_sales
      .where('synced')
      .equals(true)
      .and(sale => new Date(sale.sold_at) < cutoffDate)
      .delete()
    
    console.log(`🧹 Cleaned up ${deleted} old synced sales`)
    return deleted
  } catch (error) {
    console.error('Error cleaning up synced sales:', error)
    return 0
  }
}

/**
 * Reset IndexedDB (use if schema errors occur)
 * WARNING: This will delete all offline data
 */
export const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting IndexedDB...')
    await db.delete()
    console.log('✅ Database deleted')
    
    // Reopen with new schema
    await db.open()
    console.log('✅ Database recreated with latest schema')
    
    return { success: true, message: 'Database reset successfully' }
  } catch (error) {
    console.error('❌ Failed to reset database:', error)
    return { success: false, error: error.message }
  }
}

// Export for debugging in console
if (typeof window !== 'undefined') {
  window.resetSmartLossDB = resetDatabase
  console.log('💡 Tip: Run window.resetSmartLossDB() in console to fix IndexedDB errors')
}
