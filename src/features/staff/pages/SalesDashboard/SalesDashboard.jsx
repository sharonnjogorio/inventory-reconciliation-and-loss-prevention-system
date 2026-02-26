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
import heroOil1 from '../../../../assets/hero-oil-1.png'
import heroOil2 from '../../../../assets/hero-oil-2.png'
import heroOil3 from '../../../../assets/hero-oil-3.png'
import styles from './SalesDashboard.module.css'
import { 
  shouldTriggerQuickCount, 
  incrementSaleCounter
} from '../../../../services/quickCountTrigger'

function SalesDashboard() {
  const navigate = useNavigate()
  const { getCurrentStaff, isOnline, logout } = useAuthStore()
  const [selectedItems, setSelectedItems] = useState({})
  const [sessionRevenue, setSessionRevenue] = useState(0)
  const [sessionStart] = useState(new Date())
  const [transactionCount, setTransactionCount] = useState(0)
  const [lastSaleTime, setLastSaleTime] = useState('--')
  const [showQuickCount, setShowQuickCount] = useState(false)
  const [quickCountProduct, setQuickCountProduct] = useState(null)
  const [quickCountExpected, setQuickCountExpected] = useState(50)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingSalesCount, setPendingSalesCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const staff = getCurrentStaff()

  // Load pending sales count on mount
  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await getPendingSalesCount()
      setPendingSalesCount(count)
    }
    loadPendingCount()
  }, [])

  // Setup auto-sync
  useEffect(() => {
    const handleSyncComplete = async (result) => {
      if (result.success) {
        const count = await getPendingSalesCount()
        setPendingSalesCount(count)
        setLastSync(new Date())
        setIsSyncing(false)
      }
    }
    
    setupAutoSync(handleSyncComplete)
  }, [])

  // Fetch products from inventory
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await inventoryAPI.getInventorySummary()
        const inventory = response.inventory || response.data || response
        
        // Map inventory to product format
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
        console.error('Failed to load products:', err)
        setLoading(false)
      }
    }

    if (staff) {
      fetchProducts()
    }
  }, [staff])
  
  // Function to refresh inventory after sale
  const refreshInventory = async () => {
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
      console.log('✅ Inventory refreshed')
    } catch (err) {
      console.error('Failed to refresh inventory:', err)
    }
  }

  const getBrandColor = (brand) => {
    const colors = {
      'kings': '#FFD700',
      'mamador': '#8B008B',
      'terra': '#FF6347',
      'devon': '#4169E1',
      'goldenpenny': '#DAA520',
      'power': '#DC143C',
      'gino': '#228B22',
      'soyagold': '#FF8C00',
      'tropical': '#00CED1',
      'grandpure': '#9370DB'
    }
    return colors[brand.toLowerCase()] || '#e29a5c'
  }

  const getBrandImage = (brand) => {
    // Use different images based on brand
    const images = {
      'mamador': heroOil1,
      'kings': heroOil2,
      'terra': heroOil3
    }
    return images[brand.toLowerCase()] || heroOil1
  }

  // Sync pending sales manually
  const handleManualSync = async () => {
    if (isSyncing || pendingSalesCount === 0) return
    
    setIsSyncing(true)
    try {
      const result = await syncPendingSales()
      if (result.success) {
        const count = await getPendingSalesCount()
        setPendingSalesCount(count)
        setLastSync(new Date())
        alert(`✅ Synced ${result.synced} sales successfully!`)
      } else {
        alert('❌ Sync failed. Will retry automatically.')
      }
    } catch (error) {
      console.error('Manual sync error:', error)
      alert('❌ Sync failed. Check your connection.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Online/offline listener removed - handled by setupAutoSync

 useEffect(() => {
  if (!staff && !isLoggingOut) {
    navigate('/staff/pin')
    return
  }

  if (!staff) return

  const loadSessionRevenue = async () => {
    try {
      // Load today's sales from backend API
      const today = new Date().toISOString().split('T')[0]
      const response = await salesAPI.getSalesHistory(today, today)
      
      if (response.success && response.sales) {
        // Calculate total revenue and count for this staff member
        const staffSales = response.sales.filter(sale => sale.staff_id === staff.id)
        const total = staffSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
        setSessionRevenue(total)
        setTransactionCount(staffSales.length)
        console.log(`📊 Loaded ${staffSales.length} sales, total: $${total.toFixed(2)}`)
      } else {
        // Fallback to IndexedDB if API fails
        const todaySales = await db.sales
          .where('timestamp')
          .between(
            new Date().setHours(0, 0, 0, 0),
            new Date().setHours(23, 59, 59, 999)
          )
          .toArray()
        
        const total = todaySales.reduce((sum, sale) => sum + sale.total, 0)
        setSessionRevenue(total)
        setTransactionCount(todaySales.length)
      }
    } catch (err) {
      console.error('Error loading revenue from API, trying IndexedDB:', err)
      
      // Fallback to IndexedDB
      try {
        const todaySales = await db.sales
          .where('timestamp')
          .between(
            new Date().setHours(0, 0, 0, 0),
            new Date().setHours(23, 59, 59, 999)
          )
          .toArray()
        
        const total = todaySales.reduce((sum, sale) => sum + sale.total, 0)
        setSessionRevenue(total)
        setTransactionCount(todaySales.length)
      } catch (dbErr) {
        console.error('Error loading revenue from IndexedDB:', dbErr)
      }
    }
  }

  loadSessionRevenue()
}, [staff, navigate])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  

  const handleProductTap = (productId) => {
    // Prevent interaction during quick count
    if (showQuickCount) {
      return
    }
    
    const product = products.find(p => p.id === productId)
    
    // Check if product has stock
    if (!product || product.quantity <= 0) {
      alert('⚠️ This product is out of stock!')
      return
    }
    
    // Check if adding would exceed available stock
    const currentInCart = selectedItems[productId] || 0
    if (currentInCart >= product.quantity) {
      alert(`⚠️ Only ${product.quantity} units available in stock!`)
      return
    }
    
    // Check for low stock warning (10 or less)
    if (product.quantity <= 10 && currentInCart === 0) {
      console.warn(`⚠️ Low stock alert: ${product.name} has only ${product.quantity} units left`)
    }
    
    setSelectedItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const handleRemoveProduct = (productId) => {
    // Prevent interaction during quick count
    if (showQuickCount) {
      return
    }
    
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

  const handleRecordSale = async () => {
    // Prevent recording sale during quick count
    if (showQuickCount) {
      alert('⚠️ Please complete the quick count before recording sales')
      return
    }
    
    if (Object.keys(selectedItems).length === 0) {
      alert('Please select at least one product')
      return
    }

    try {
      const saleTotal = calculateTotal()
      
      // Prepare sales data
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

      // Try to sync with backend if online
      let syncSuccess = false
      const isActuallyOnline = navigator.onLine && isOnline
      
      console.log('🔍 Sync attempt:', { 
        navigatorOnline: navigator.onLine, 
        isOnline, 
        isActuallyOnline,
        salesCount: salesData.length 
      })
      
      if (isActuallyOnline) {
        try {
          // Try to log each sale
          for (const saleData of salesData) {
            console.log('📤 Sending sale to backend:', saleData)
            const result = await salesAPI.logSale(saleData)
            console.log('✅ Backend response:', result)
          }
          syncSuccess = true
          setLastSync(new Date())
          console.log('✅ All sales synced to backend successfully - syncSuccess =', syncSuccess)
        } catch (err) {
          console.error('❌ Failed to sync sale:', err)
          console.error('Error details:', err.response?.data || err.message)
          // Even if online, API might fail - treat as offline
          syncSuccess = false
        }
      } else {
        console.log('📴 Device is offline, skipping backend sync')
      }
      
      // If offline or sync failed, save to IndexedDB
      if (!syncSuccess) {
        for (const saleData of salesData) {
          await saveSaleOffline(saleData)
        }
        const count = await getPendingSalesCount()
        setPendingSalesCount(count)
        console.log('💾 Sales saved offline')
      }

      // Save to local sales history
      await db.sales.add({
        id: 'sale_' + Date.now(),
        staff_id: staff.id,
        staff_name: staff.name,
        items: selectedItems,
        total: saleTotal,
        timestamp: new Date().toISOString(),
        synced: syncSuccess
      })

      // Update session stats
      setSessionRevenue(prev => prev + saleTotal)
      setTransactionCount(prev => prev + 1)
      setLastSaleTime('Now')

      // Clear cart
      setSelectedItems({})
      
      // Refresh inventory to show updated stock
      await refreshInventory()
      
      // Check if AI spot check should trigger
      incrementSaleCounter()
      const triggerResult = await shouldTriggerQuickCount()
      
      if (triggerResult.shouldTrigger && triggerResult.sku) {
        // Find the product from the SKU returned by backend
        const productToCheck = products.find(p => p.id === triggerResult.sku.sku_id)
        
        if (productToCheck) {
          setQuickCountProduct(productToCheck)
          setQuickCountExpected(triggerResult.sku.current_stock)
          setShowQuickCount(true)
          console.log(`🔔 Spot check triggered: ${triggerResult.reason}`)
        } else {
          // Show success message based on actual sync status
          const statusMsg = syncSuccess 
            ? '✅ Sale recorded and synced!' 
            : '💾 Sale recorded offline (will sync when online)'
          alert(statusMsg)
        }
      } else {
        // Show success message based on actual sync status
        const statusMsg = syncSuccess 
          ? '✅ Sale recorded and synced!' 
          : '💾 Sale recorded offline (will sync when online)'
        alert(statusMsg)
      }
    } catch (err) {
      console.error('Error recording sale:', err)
      alert('Failed to record sale. Please try again.')
    }
  }

  const handleLogout = () => {
  // Set logging out flag to prevent redirect
  setIsLoggingOut(true)
  
  // Clear device linking flags
  localStorage.removeItem('deviceLinked')
  localStorage.removeItem('staffData')
  localStorage.removeItem('authToken')
  
  // Clear auth store
  logout()
  
  console.log('✅ Staff logged out - device unlinked')
  
  // Redirect to landing page
  navigate('/')
}

  if (!staff) return null

  // Format sync time
  const getSyncTime = () => {
    if (!lastSync) return 'Never'
    const seconds = Math.floor((new Date() - lastSync) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  // Get sync status icon
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
          <span className={styles.statSub}>Now</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>SHIFT TIME</span>
          <span className={styles.statValue}>{getShiftDuration()}</span>
          <span className={styles.statSub}>Since Login</span>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Quick Sale</h2>
        
        {/* Cart Display */}
        {Object.keys(selectedItems).length > 0 && (
          <div className={styles.cartSection}>
            <div className={styles.cartHeader}>
              <h3 className={styles.cartTitle}>🛒 Current Cart ({Object.keys(selectedItems).length} items)</h3>
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
              <span className={styles.cartTotalLabel}>Subtotal:</span>
              <span className={styles.cartTotalAmount}>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        )}
        
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
          <button 
            className={styles.actionBtn}
            onClick={() => navigate('/staff/bulk-decant')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Bulk Convert
          </button>

          <button 
            className={styles.actionBtn}
            onClick={() => {
              // Show today's sales history
              const todaySales = Object.entries(selectedItems).map(([id, qty]) => {
                const product = products.find(p => p.id === id)
                return product ? `${product.name}: ${qty} units` : ''
              }).filter(Boolean).join('\n')
              
              if (todaySales) {
                alert(`Today's Sales:\n\n${todaySales}\n\nTotal: ${formatCurrency(calculateTotal())}\nTransactions: ${transactionCount}`)
              } else {
                alert(`Today's Summary:\n\nRevenue: ${formatCurrency(sessionRevenue)}\nTransactions: ${transactionCount}\nShift Time: ${getShiftDuration()}`)
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            View History
          </button>

          <button 
            className={`${styles.actionBtn} ${styles.endShift}`}
            onClick={handleLogout}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            End Shift
          </button>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalAmount}>{formatCurrency(calculateTotal())}</span>
        </div>
        <div className={styles.buttonGroup}>
          <button 
            className={styles.clearButton}
            onClick={() => setSelectedItems({})}
            disabled={Object.keys(selectedItems).length === 0}
          >
            Clear
          </button>
          <button 
            className={styles.recordButton}
            onClick={handleRecordSale}
            disabled={Object.keys(selectedItems).length === 0}
          >
            Record Sale
          </button>
        </div>
      </div>

      {showQuickCount && quickCountProduct && (
        <QuickCountOverlay
          product={quickCountProduct}
          expectedCount={quickCountExpected}
          onComplete={(result) => {
            console.log('Count result:', result)
            setSelectedItems({})
            if (result.isMatch) {
              alert('✅ Sale recorded! Count verified.')
            } else {
              alert(`⚠️ Sale recorded! Variance detected: ${result.gap} units (${result.variance}%)`)
            }
          }}
          onClose={() => {
            setShowQuickCount(false)
            setQuickCountProduct(null)
            setSelectedItems({})
          }}
        />
      )}
    </div>
  )
}

export default SalesDashboard