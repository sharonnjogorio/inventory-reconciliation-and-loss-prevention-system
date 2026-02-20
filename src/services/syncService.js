/**
 * Background Sync Service
 * 
 * Handles offline-to-online sync using Service Worker Background Sync API
 */

import db from './db'

export const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-sales')
      console.log('Background sync registered')
    } catch (err) {
      console.error('Background sync registration failed:', err)
    }
  }
}

export const syncPendingSales = async () => {
  try {
    const unsyncedSales = await db.sales.where('synced').equals(false).toArray()
    
    for (const sale of unsyncedSales) {
      try {
        // Send to backend
        const response = await fetch('/api/sales/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale)
        })

        if (response.ok) {
          // Mark as synced
          await db.sales.update(sale.id, { synced: true })
        }
      } catch (error) {
        console.error('Sync failed for sale:', sale.id, error)
        // Leave synced: false, will retry later
      }
    }
  } catch (error) {
    console.error('Error syncing sales:', error)
  }
}

// Listen for online event
window.addEventListener('online', () => {
  console.log('Back online - syncing...')
  registerBackgroundSync()
  syncPendingSales()
})