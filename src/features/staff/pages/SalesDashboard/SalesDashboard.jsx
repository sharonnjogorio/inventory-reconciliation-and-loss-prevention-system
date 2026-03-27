import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../../store/useAuthStore'
import db from '../../../../services/db'
import { salesAPI, inventoryAPI } from '../../../../services'
import {
  saveSaleOffline,
  syncPendingSales,
  getPendingSalesCount,
  setupAutoSync
} from '../../../../services/offlineSync'
import ProductTile from '../../components/ProductTile/ProductTile'
import QuickCountOverlay from '../../components/QuickCountOverlay/QuickCountOverlay'
import Toast from '../../../../components/Toast/Toast'
import mamadorImg from '../../../../assets/image/mamador.svg'
import devonkingImg from '../../../../assets/image/devonking.svg'
import goldenpennySvg from '../../../../assets/image/goldenpenny.svg'
import poweroilImg from '../../../../assets/image/poweroil.svg'
import kingsoilImg from '../../../../assets/image/kingsoil.png'
import heroOil1 from '../../../../assets/image/hero-oil-1.png'
import heroOil2 from '../../../../assets/image/hero-oil-2.png'
import heroOil3 from '../../../../assets/image/hero-oil-3.png'
import styles from './SalesDashboard.module.css'
import {
  shouldTriggerQuickCount,
  incrementSaleCounter
} from '../../../../services/quickCountTrigger'

const getStatsKey = (staffId) => {
  const today = new Date().toISOString().split('T')[0]
  return `session_stats_${staffId || 'unknown'}_${today}`
}

const loadStats = (staffId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(getStatsKey(staffId)) || '{}')
    return {
      revenue: parseFloat(saved.revenue || 0),
      count: parseInt(saved.count || 0),
      lastSale: saved.lastSale || '--'
    }
  } catch { return { revenue: 0, count: 0, lastSale: '--' } }
}

const saveStats = (staffId, revenue, count, lastSale) => {
  localStorage.setItem(getStatsKey(staffId), JSON.stringify({ revenue, count, lastSale }))
}

function SalesDashboard() {
  const navigate = useNavigate()
  const storeUser = useAuthStore(state => state.user)
  const { isOnline, logout } = useAuthStore()

  // staffData in localStorage is written by the staff login flow and never
  // overwritten by the owner login, so it's the reliable source of staff identity.
  const staff = (() => {
    try {
      const saved = localStorage.getItem('staffData')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only use it if it belongs to a staff role (not the owner)
        if (parsed.id && parsed.name) return parsed
      }
    } catch (_) { /* localStorage unavailable */ }
    return storeUser
  })()
  const [selectedItems, setSelectedItems] = useState({})
  const [sessionStart] = useState(new Date())

  const initial = loadStats(staff?.id)
  const [sessionRevenue, setSessionRevenue] = useState(initial.revenue)
  const [transactionCount, setTransactionCount] = useState(initial.count)
  const [lastSaleTime, setLastSaleTime] = useState(initial.lastSale)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showQuickCount, setShowQuickCount] = useState(false)
  const [quickCountProduct, setQuickCountProduct] = useState(null)
  const [quickCountExpected, setQuickCountExpected] = useState(50)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingSalesCount, setPendingSalesCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [toast, setToast] = useState(null)
  const [, setTick] = useState(0)

  const showToast = (message, type = 'info') => setToast({ message, type })
  const closeToast = () => setToast(null)

  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await getPendingSalesCount()
      setPendingSalesCount(count)
    }
    loadPendingCount()
  }, [])

  useEffect(() => {
    const handleSyncComplete = async (result) => {
      const count = await getPendingSalesCount()
      setPendingSalesCount(count)
      if (result.success) {
        setLastSync(new Date())
        // Refresh inventory after a delay so the backend has time to commit
        // the synced sales. The merge in refreshInventory ensures optimistic
        // decrements are never overwritten by stale server quantities.
        setTimeout(refreshInventory, 2000)
      }
      setIsSyncing(false)
    }

    const cleanup = setupAutoSync(handleSyncComplete, () => setIsSyncing(true))
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await inventoryAPI.getInventorySummary()
        const inventory = response.inventory || response.data || response

        const productList = inventory.map(item => ({
          id: item.sku_id,
          brand: item.brand,
          name: `${item.brand} ${item.size}`,
          size: item.size,
          price: parseFloat(item.selling_price),
          quantity: item.quantity,
          color: getBrandColor(item.brand),
          textColor: '#FFFFFF',
          image: getBrandImage(item.brand)
        }))

        setProducts(productList)
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }

    if (staff) {
      fetchProducts()
    }
  }, [staff])

  const refreshInventory = useCallback(async () => {
    try {
      const response = await inventoryAPI.getInventorySummary()
      const inventory = response.inventory || response.data || response

      // Merge API quantities with current optimistic state:
      // never let the server push a quantity HIGHER than what we currently
      // show — that would undo optimistic decrements from offline sales.
      setProducts(prev => {
        const currentQty = {}
        prev.forEach(p => { currentQty[p.id] = p.quantity })

        return inventory.map(item => ({
          id: item.sku_id,
          brand: item.brand,
          name: `${item.brand} ${item.size}`,
          size: item.size,
          price: parseFloat(item.selling_price),
          quantity: item.sku_id in currentQty
            ? Math.min(item.quantity, currentQty[item.sku_id])
            : item.quantity,
          color: getBrandColor(item.brand),
          textColor: '#FFFFFF',
          image: getBrandImage(item.brand)
        }))
      })
    } catch {
      // silently fail — products remain from last fetch
    }
  }, [])

  // Tick every minute so shift time and last-sale age stay current
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const getBrandColor = (brand) => {
    const b = brand.toLowerCase()
    if (b.includes('mamador'))    return '#8B008B'
    if (b.includes('king'))       return '#DAA520'
    if (b.includes('terra'))      return '#FF6347'
    if (b.includes('devon'))      return '#1A56DB'
    if (b.includes('golden') || b.includes('penny')) return '#B8860B'
    if (b.includes('power'))      return '#DC143C'
    if (b.includes('gino'))       return '#228B22'
    if (b.includes('soya'))       return '#FF8C00'
    if (b.includes('tropical'))   return '#00879E'
    if (b.includes('grand'))      return '#7C3AED'
    return '#E29A5C'
  }

  const getBrandImage = (brand) => {
    const b = brand.toLowerCase()
    if (b.includes('mamador'))                       return mamadorImg
    if (b.includes('king'))                          return kingsoilImg
    if (b.includes('devon'))                         return devonkingImg
    if (b.includes('golden') || b.includes('penny')) return goldenpennySvg
    if (b.includes('power'))                         return poweroilImg
    if (b.includes('terra'))                         return heroOil3
    if (b.includes('gino'))                          return heroOil2
    return heroOil1
  }

  const handleManualSync = async () => {
    if (isSyncing || pendingSalesCount === 0) return

    setIsSyncing(true)
    try {
      const result = await syncPendingSales()
      if (result.success) {
        const count = await getPendingSalesCount()
        setPendingSalesCount(count)
        setLastSync(new Date())
        showToast(`Synced ${result.synced} sale${result.synced !== 1 ? 's' : ''} successfully!`, 'success')
        setTimeout(refreshInventory, 2000)
      } else {
        showToast('Sync failed. Will retry automatically.', 'error')
      }
    } catch (error) {
      showToast('Sync failed. Check your connection.', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (!staff && !isLoggingOut) {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/staff/pin')
      }
      return
    }

    if (!staff) return

    const loadSessionRevenue = async () => {
      // localStorage is the authoritative record for this session —
      // only update from the API if it returns a higher value (e.g. another device)
      const stored = loadStats(staff.id)

      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await salesAPI.getSalesHistory(today, today)

        if (response.success && response.sales) {
          const staffSales = response.sales.filter(sale => sale.staff_id === staff.id)
          const apiTotal = staffSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
          const apiCount = staffSales.length

          // Only overwrite if API has more data than what's stored locally
          if (apiTotal > stored.revenue) {
            setSessionRevenue(apiTotal)
            setTransactionCount(apiCount)
            saveStats(staff.id, apiTotal, apiCount, stored.lastSale)
          }
        }
      } catch {
        // Network or API error — keep localStorage values, no update needed
      }
    }

    loadSessionRevenue()
  }, [staff, navigate, isLoggingOut])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleProductTap = (productId) => {
    if (showQuickCount) return

    const product = products.find(p => p.id === productId)

    if (!product || product.quantity <= 0) {
      showToast('This product is out of stock!', 'warning')
      return
    }

    const currentInCart = selectedItems[productId] || 0
    if (currentInCart >= product.quantity) {
      showToast(`Only ${product.quantity} unit${product.quantity !== 1 ? 's' : ''} available in stock!`, 'warning')
      return
    }

    setSelectedItems(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }

  const handleRemoveProduct = (productId) => {
    if (showQuickCount) return

    setSelectedItems(prev => {
      const newItems = { ...prev }
      if (newItems[productId] > 1) {
        newItems[productId] -= 1
      } else {
        delete newItems[productId]
      }
      return newItems
    })
  }

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      if (!product) return total
      return total + product.price * quantity
    }, 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getShiftDuration = () => {
    const now = new Date()
    const diffMs = now - sessionStart
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getLastSaleRelative = () => {
    if (!lastSaleTime || lastSaleTime === '--') return null
    // lastSaleTime is stored as a locale time string (e.g. "10:30 AM")
    // parse it back against today's date
    const today = new Date().toDateString()
    const saleDate = new Date(`${today} ${lastSaleTime}`)
    if (isNaN(saleDate)) return null
    const diffMin = Math.floor((Date.now() - saleDate) / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin === 1) return '1 min ago'
    if (diffMin < 60) return `${diffMin} min ago`
    const hrs = Math.floor(diffMin / 60)
    return `${hrs}h ago`
  }

  const handleRecordSale = async () => {
    if (showQuickCount) {
      showToast('Please complete the quick count before recording sales', 'warning')
      return
    }

    if (Object.keys(selectedItems).length === 0) {
      showToast('Please select at least one product', 'warning')
      return
    }

    try {
      const saleTotal = calculateTotal()
      const deviceId = localStorage.getItem('deviceId') || 'web-' + Date.now()
      const salesData = Object.entries(selectedItems).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)
        return {
          sku_id: productId,
          quantity,
          unit_price: product.price,
          sold_at: new Date().toISOString(),
          device_id: deviceId
        }
      })

      let syncSuccess = false
      const isActuallyOnline = navigator.onLine && isOnline

      if (isActuallyOnline) {
        try {
          for (const saleData of salesData) {
            await salesAPI.logSale(saleData)
          }
          syncSuccess = true
          setLastSync(new Date())
        } catch (err) {
          syncSuccess = false
        }
      }

      if (!syncSuccess) {
        for (const saleData of salesData) {
          await saveSaleOffline(saleData)
        }
        const count = await getPendingSalesCount()
        setPendingSalesCount(count)
      }

      await db.sales.add({
        sale_id: 'sale_' + Date.now(),
        staff_id: staff.id,
        staff_name: staff.name,
        items: selectedItems,
        total: saleTotal,
        timestamp: new Date().toISOString(),
        synced: syncSuccess
      })

      const newRevenue = sessionRevenue + saleTotal
      const newCount = transactionCount + 1
      const newLastSale = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setSessionRevenue(newRevenue)
      setTransactionCount(newCount)
      setLastSaleTime(newLastSale)
      saveStats(staff.id, newRevenue, newCount, newLastSale)

      setSelectedItems({})
      setIsCartOpen(false)

      // Optimistically decrement stock so tiles update immediately
      setProducts(prev => prev.map(p => {
        const sold = selectedItems[p.id]
        if (!sold) return p
        return { ...p, quantity: Math.max(0, p.quantity - sold) }
      }))

      // Only reconcile with server for online sales, and only after a short
      // delay so the backend has time to commit before we re-fetch
      if (syncSuccess) {
        setTimeout(refreshInventory, 1500)
      }

      incrementSaleCounter()
      const stockedProducts = products.filter(p => p.quantity > 0)
      const triggerResult = await shouldTriggerQuickCount(stockedProducts)

      if (triggerResult.shouldTrigger && triggerResult.sku) {
        const productToCheck = products.find(p => p.id === triggerResult.sku.sku_id)

        if (productToCheck) {
          setQuickCountProduct(productToCheck)
          // Use the live frontend quantity — already reflects all optimistic
          // decrements from this session, so it matches what's actually on the shelf
          setQuickCountExpected(productToCheck.quantity)
          setShowQuickCount(true)
        } else {
          const statusMsg = syncSuccess ? 'Sale recorded and synced!' : 'Sale recorded offline — will sync when online'
          showToast(statusMsg, syncSuccess ? 'success' : 'info')
        }
      } else {
        const statusMsg = syncSuccess ? 'Sale recorded and synced!' : 'Sale recorded offline — will sync when online'
        showToast(statusMsg, syncSuccess ? 'success' : 'info')
      }
    } catch (err) {
      showToast('Failed to record sale. Please try again.', 'error')
    }
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    localStorage.removeItem('deviceLinked')
    localStorage.removeItem('staffData')
    localStorage.removeItem('authToken')
    localStorage.removeItem(getStatsKey())
    logout()
    navigate('/')
  }

  if (!staff) return null

  const getSyncTime = () => {
    if (!lastSync) return 'Never'
    const seconds = Math.floor((new Date() - lastSync) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getSyncStatus = () => {
    if (isSyncing) return '🔄'
    if (pendingSalesCount > 0) return '🟡'
    return '🟢'
  }

  return (
    <div className={`${styles.container} ${showQuickCount ? styles.locked : ''}`}>
      <div className={styles.staffBar}>
        <div className={styles.staffInfo}>
          <span className={styles.loggedInText}>Logged in as</span>
          <span className={styles.staffName}>{staff?.name || 'Chinedu Okafor'}</span>
        </div>
        <div className={styles.staffActions}>
          <button className={`${styles.statusBtn} ${isOnline ? styles.online : styles.offline}`}>
            <span className={styles.statusDot}></span>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
          <button
            className={`${styles.syncBtn} ${pendingSalesCount > 0 ? styles.pending : ''}`}
            onClick={handleManualSync}
            disabled={isSyncing || pendingSalesCount === 0}
          >
            {getSyncStatus()} {isSyncing ? 'Syncing...' : pendingSalesCount > 0 ? `${pendingSalesCount} Pending` : `Synced ${getSyncTime()}`}
          </button>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="End Shift & Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>YOUR SALES TODAY</span>
          <span className={styles.statValue}>{formatCurrency(sessionRevenue)}</span>
          <span className={styles.statSub}>{transactionCount} Transactions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>LAST SALE</span>
          <span className={styles.statValue}>{lastSaleTime}</span>
          <span className={styles.statSub}>{getLastSaleRelative() || 'No sales yet'}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>SHIFT TIME</span>
          <span className={styles.statValue}>{getShiftDuration()}</span>
          <span className={styles.statSub}>Since Login</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.productsPane}>
          <div className={styles.productsPaneHeader}>
            <h2 className={styles.sectionTitle}>Quick Sale</h2>
            <button
              className={styles.cartToggleBtn}
              onClick={() => setIsCartOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {Object.keys(selectedItems).length > 0 && (
                <span className={styles.cartBadge}>{Object.values(selectedItems).reduce((a, b) => a + b, 0)}</span>
              )}
            </button>
          </div>
          {loading ? (
            <div className={styles.loading}>Loading products...</div>
          ) : products.length === 0 ? (
            <div className={styles.emptyProducts}>
              <p>No products available</p>
              <p className={styles.emptyHint}>Ask your manager to add products to inventory</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map(product => (
                <ProductTile
                  key={product.id}
                  product={product}
                  quantity={selectedItems[product.id] || 0}
                  onTap={() => handleProductTap(product.id)}
                  onRemove={() => handleRemoveProduct(product.id)}
                />
              ))}
            </div>
          )}

          <div className={styles.actionButtons}>
            <button className={styles.actionBtn} onClick={() => navigate('/staff/bulk-decant')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              Bulk Convert
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => {
                const summary = Object.keys(selectedItems).length > 0
                  ? Object.entries(selectedItems).map(([id, qty]) => {
                      const product = products.find(p => p.id === id)
                      return product ? `${product.name}: ${qty} units` : ''
                    }).filter(Boolean).join('\n') + `\n\nTotal: ${formatCurrency(calculateTotal())}`
                  : `Revenue: ${formatCurrency(sessionRevenue)}\nTransactions: ${transactionCount}\nShift Time: ${getShiftDuration()}`
                showToast(summary, 'info')
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              View History
            </button>
            <button className={`${styles.actionBtn} ${styles.endShift}`} onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              End Shift
            </button>
          </div>
        </div>
      </div>

      {isCartOpen && (
        <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)} />
      )}
      <div className={`${styles.cartDrawer} ${isCartOpen ? styles.cartDrawerOpen : ''}`}>
        <div className={styles.cartDrawerHeader}>
          <h3 className={styles.cartTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart ({Object.values(selectedItems).reduce((a, b) => a + b, 0)} items)
          </h3>
          <button className={styles.cartCloseBtn} onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className={styles.cartBody}>
          {Object.keys(selectedItems).length === 0 ? (
            <div className={styles.cartEmpty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Tap products to add them here</p>
            </div>
          ) : (
            <>
              <div className={styles.cartItemsHeader}>
                <span className={styles.cartItemsCount}>{Object.keys(selectedItems).length} product{Object.keys(selectedItems).length > 1 ? 's' : ''}</span>
                <button
                  className={styles.cartClearBtn}
                  onClick={() => setSelectedItems({})}
                >
                  Clear All
                </button>
              </div>
              <div className={styles.cartItems}>
                {Object.entries(selectedItems).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId)
                  if (!product) return null
                  return (
                    <div key={productId} className={styles.cartItem}>
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>{product.name}</span>
                        <span className={styles.cartItemQty}>× {quantity}</span>
                      </div>
                      <div className={styles.cartItemRight}>
                        <span className={styles.cartItemPrice}>{formatCurrency(product.price * quantity)}</span>
                        <button
                          className={styles.cartItemRemove}
                          onClick={() => handleRemoveProduct(productId)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className={styles.cartTotal}>
                <span className={styles.cartTotalLabel}>Subtotal</span>
                <span className={styles.cartTotalAmount}>{formatCurrency(calculateTotal())}</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.cartDrawerFooter}>
          <button
            className={styles.recordButton}
            onClick={() => { handleRecordSale(); setIsCartOpen(false) }}
            disabled={Object.keys(selectedItems).length === 0}
          >
            Record Sale
          </button>
        </div>
      </div>

      {Object.keys(selectedItems).length > 0 && (
        <div className={styles.bottomBar}>
          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalAmount}>{formatCurrency(calculateTotal())}</span>
          </div>
          <button
            className={styles.viewCartBtn}
            onClick={() => setIsCartOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            View Cart ({Object.values(selectedItems).reduce((a, b) => a + b, 0)})
          </button>
        </div>
      )}

      {showQuickCount && quickCountProduct && (
        <QuickCountOverlay
          product={quickCountProduct}
          expectedCount={quickCountExpected}
          onComplete={(result) => {
            setSelectedItems({})
            if (result.isMatch) {
              showToast('Sale recorded! Count verified.', 'success')
            } else {
              showToast(`Sale recorded! Variance detected: ${result.gap} units (${result.variance}%)`, 'warning')
            }
          }}
          onClose={() => {
            setShowQuickCount(false)
            setQuickCountProduct(null)
            setSelectedItems({})
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  )
}

export default SalesDashboard
