import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerBackgroundSync } from '../../../services/syncServise'
import useAuthStore from '../../../store/useAuthStore'
import db from '../../../services/db'
import ProductTile from '../components/ProductTile/ProductTile'
import QuickCountOverlay from '../components/QuickCountOverlay/QuickCountOverlay'
import heroOil1 from '../../../assets/hero-oil-1.png'  // Mamador
import heroOil2 from '../../../assets/hero-oil-2.png'  // King's
import heroOil3 from '../../../assets/hero-oil-3.png'  // Golden Terra
import styles from './SalesDashboard.module.css'


// Product catalog from PRD Section 5.5
const PRODUCTS = [
  // King's Oil - Yellow (#FFDA29)
  { 
    id: 'kings_1l', 
    brand: 'kings', 
    name: "King's Oil", 
    size: '1L', 
    price: 3200, 
    color: '#FFDA29', 
    textColor: '#000000',
    image: heroOil2
  },
  { 
    id: 'kings_5l', 
    brand: 'kings', 
    name: "King's Oil", 
    size: '5L', 
    price: 21000, 
    color: '#FFDA29', 
    textColor: '#000000',
    image: heroOil2
  },
  { 
    id: 'kings_25l', 
    brand: 'kings', 
    name: "King's Oil", 
    size: '25L', 
    price: 95000, 
    color: '#FFDA29', 
    textColor: '#000000',
    image: heroOil2
  },
  
  // Mamador - Purple (#36013F)
  { 
    id: 'mamador_1l', 
    brand: 'mamador', 
    name: 'Mamador', 
    size: '1L', 
    price: 3500, 
    color: '#36013F', 
    textColor: '#FFFFFF',
    image: heroOil1
  },
  { 
    id: 'mamador_2l', 
    brand: 'mamador', 
    name: 'Mamador', 
    size: '2L', 
    price: 8500, 
    color: '#36013F', 
    textColor: '#FFFFFF',
    image: heroOil1
  },
  { 
    id: 'mamador_5l', 
    brand: 'mamador', 
    name: 'Mamador', 
    size: '5L', 
    price: 22000, 
    color: '#36013F', 
    textColor: '#FFFFFF',
    image: heroOil1
  },
  
  // Golden Terra - Red (#EE4B2B)
  { 
    id: 'terra_1l', 
    brand: 'terra', 
    name: 'Golden Terra', 
    size: '1L', 
    price: 3000, 
    color: '#EE4B2B', 
    textColor: '#FFFFFF',
    image: heroOil3
  },
  { 
    id: 'terra_5l', 
    brand: 'terra', 
    name: 'Golden Terra', 
    size: '5L', 
    price: 19500, 
    color: '#EE4B2B', 
    textColor: '#FFFFFF',
    image: heroOil3
  },
]

function SalesDashboard() {
  const navigate = useNavigate()
  const { getCurrentStaff, isOnline, logout } = useAuthStore()
  const [selectedItems, setSelectedItems] = useState({}) // { product_id: quantity }
  const [sessionRevenue, setSessionRevenue] = useState(0)
  const [sessionStart] = useState(new Date())
  const [unsyncedCount, setUnsyncedCount] = useState(0)
  const [showQuickCount, setShowQuickCount] = useState(false)

  const staff = getCurrentStaff()

  useEffect(() => {
    if (!staff) {
      navigate('/staff/pin')
      return
    }
    
    // Load session revenue from IndexedDB
    loadSessionRevenue()
    
    // Check unsynced sales count
    checkUnsyncedSales()
  }, [staff, navigate])

  const loadSessionRevenue = async () => {
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
    } catch (err) {
      console.error('Error loading revenue:', err)
    }
  }

  const checkUnsyncedSales = async () => {
    try {
      const count = await db.sales.where('synced').equals(false).count()
      setUnsyncedCount(count)
    } catch (err) {
      console.error('Error checking unsynced sales:', err)
    }
  }

  const handleProductTap = (productId) => {
    // PRD NFR-01: Tap response < 200ms
    setSelectedItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
      const product = PRODUCTS.find(p => p.id === productId)
      return total + (product.price * quantity)
    }, 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getSessionDuration = () => {
    const now = new Date()
    const diffMs = now - sessionStart
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const handleRecordSale = async () => {
    if (Object.keys(selectedItems).length === 0) {
      alert('Please select at least one product')
      return
    }

    try {
      // PRD FR-03: Offline sales logging
      const sale = {
        id: 'sale_' + Date.now(),
        staff_id: staff.id,
        staff_name: staff.name,
        items: selectedItems,
        total: calculateTotal(),
        timestamp: new Date().toISOString(),
        synced: false
      }

      // Save to IndexedDB (offline-first)
      await db.sales.add(sale)

      // Update session revenue
      setSessionRevenue(prev => prev + calculateTotal())

      // Clear selection
      setSelectedItems({})

      // Update unsynced count
      checkUnsyncedSales()

      // Try to sync if online
      if (isOnline) {
        await registerBackgroundSync()}
        else{
          console.log('Currently offline, sale will sync when back online')
        }

      // Show success feedback
      alert('Sale recorded successfully!')
    } catch (err) {
      console.error('Error recording sale:', err)
      alert('Failed to record sale. Please try again.')
    }
  }

  const syncSales = async () => {
    try {
      const unsyncedSales = await db.sales.where('synced').equals(false).toArray()
      
      for (const sale of unsyncedSales) {
        // TODO: Send to backend API
        // await fetch('/api/sales/sync', { method: 'POST', body: JSON.stringify(sale) })
        
        // Mark as synced (for now, mock success)
        await db.sales.update(sale.id, { synced: true })
      }
      
      checkUnsyncedSales()
      alert('Sales synced successfully!')
    } catch (err) {
      console.error('Sync failed:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/staff/pin')
  }

  if (!staff) {
    return null
  }

  return (
    <div className={styles.container}>
      {/* Top Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatCurrency(sessionRevenue)}</span>
          <span className={styles.statLabel}>Today's Revenue</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{getSessionDuration()}</span>
          <span className={styles.statLabel}>Session</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{Object.values(selectedItems).reduce((a, b) => a + b, 0)}</span>
          <span className={styles.statLabel}>Items Selected</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn} 
            onClick={() => navigate('/staff/bulk-decant')}
          >
            Break Carton
          </button>
          <button 
            className={styles.actionBtn} 
            onClick={() => setShowQuickCount(true)}
          >
            Test Quick Count
          </button>
          <button className={styles.actionBtn} onClick={handleLogout}>
            Logout
          </button>
          {unsyncedCount > 0 && (
            <button className={styles.syncBtn} onClick={syncSales}>
              Sync ({unsyncedCount})
            </button>
          )}
        </div>
      </div>

      {/* Staff Info */}
      <div className={styles.staffInfo}>
        <p>Logged in as: <strong>{staff?.name}</strong></p>
        <span className={`${styles.statusBadge} ${isOnline ? styles.online : styles.offline}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      {/* Product Grid - "Quick Sale" */}
      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Quick Sale</h2>
        
        <div className={styles.productGrid}>
          {PRODUCTS.map(product => (
            <ProductTile
              key={product.id}
              product={product}
              quantity={selectedItems[product.id] || 0}
              onTap={() => handleProductTap(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalAmount}>{formatCurrency(calculateTotal())}</span>
        </div>
        <button 
          className={styles.recordButton}
          onClick={handleRecordSale}
          disabled={Object.keys(selectedItems).length === 0}
        >
          Record Sale
        </button>
      </div>

      {/* Quick Count Overlay */}
      {showQuickCount && (
        <QuickCountOverlay
          product={PRODUCTS[0]}
          expectedCount={50}
          onComplete={(result) => {
            console.log('Count result:', result)
          }}
          onClose={() => setShowQuickCount(false)}
        />
      )}
    </div>
  )
}

export default SalesDashboard