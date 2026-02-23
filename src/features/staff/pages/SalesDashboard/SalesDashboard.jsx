import { useState, useEffect, use } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../../store/useAuthStore'
import db from '../../../../services/db'
import ProductTile from '../../components/ProductTile/ProductTile'
import QuickCountOverlay from '../../components/QuickCountOverlay/QuickCountOverlay'
import heroOil1 from '../../../../assets/hero-oil-1.png'
import heroOil2 from '../../../../assets/hero-oil-2.png'
import heroOil3 from '../../../../assets/hero-oil-3.png'
import styles from './SalesDashboard.module.css'
import { 
  shouldTriggerQuickCount, 
  incrementSaleCounter, 
  selectRandomProduct,
  getExpectedCount
} from '../../../../services/quickCountTrigger'

const PRODUCTS = [
  { id: 'kings_1l', brand: 'kings', name: "King's Oil", size: '1 Litre', price: 16.73, color: '#FFDA29', textColor: '#000000', image: heroOil2 },
  { id: 'kings_5l', brand: 'kings', name: "King's Oil", size: '5 Litres', price: 16.73, color: '#FFDA29', textColor: '#000000', image: heroOil2 },
  { id: 'kings_2l', brand: 'kings', name: "King's Oil", size: '2 Litres', price: 2.38, color: '#FFDA29', textColor: '#000000', image: heroOil2 },
  { id: 'mamador_1l', brand: 'mamador', name: 'Mamador', size: '1 Litre', price: 1.49, color: '#36013F', textColor: '#FFFFFF', image: heroOil1 },
  { id: 'mamador_5l', brand: 'mamador', name: 'Mamador', size: '5 Litres', price: 15.61, color: '#36013F', textColor: '#FFFFFF', image: heroOil1 },
  { id: 'mamador_3l', brand: 'mamador', name: 'Mamador', size: '3 Litres', price: 2.23, color: '#36013F', textColor: '#FFFFFF', image: heroOil1 },
  { id: 'terra_1l', brand: 'terra', name: 'Golden Terra', size: '1 Litre', price: 30.0, color: '#EE4B2B', textColor: '#FFFFFF', image: heroOil3 },
  { id: 'terra_2l', brand: 'terra', name: 'Golden Terra', size: '2 Litres', price: 2.38, color: '#EE4B2B', textColor: '#FFFFFF', image: heroOil3 },
]

function SalesDashboard() {
  const navigate = useNavigate()
  const { getCurrentStaff, isOnline, logout } = useAuthStore()
  const [selectedItems, setSelectedItems] = useState({})
  const [sessionRevenue, setSessionRevenue] = useState(138.63)
  const [sessionStart] = useState(new Date())
  const [transactionCount, setTransactionCount] = useState(30)
  const [lastSaleTime, setLastSaleTime] = useState('15m')
  const [showQuickCount, setShowQuickCount] = useState(false)
  const [quickCountProduct, setQuickCountProduct] = useState(null)
  const [quickCountExpected, setQuickCountExpected] = useState(50)

  const staff = getCurrentStaff()

  useEffect(() => {
    if (!staff) {
      navigate('/staff/pin')
      return
    }
    loadSessionRevenue()
  }, [staff, navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
      setTransactionCount(todaySales.length)
    } catch (err) {
      console.error('Error loading revenue:', err)
    }
  }

  const handleProductTap = (productId) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const handleRemoveProduct = (productId) => {
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
      const product = PRODUCTS.find(p => p.id === productId)
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
    if (Object.keys(selectedItems).length === 0) {
      alert('Please select at least one product')
      return
    }

    try {
      const sale = {
        id: 'sale_' + Date.now(),
        staff_id: staff.id,
        staff_name: staff.name,
        items: selectedItems,
        total: calculateTotal(),
        timestamp: new Date().toISOString(),
        synced: false
      }

      await db.sales.add(sale)
      setSessionRevenue(prev => prev + calculateTotal())
      setTransactionCount(prev => prev + 1)
      setLastSaleTime('Now')

      incrementSaleCounter()

      const shouldTrigger = await shouldTriggerQuickCount()
      
      if (shouldTrigger) {
        const randomProduct = selectRandomProduct(PRODUCTS)
        const expectedCount = await getExpectedCount(randomProduct.id)
        
        setQuickCountProduct(randomProduct)
        setQuickCountExpected(expectedCount)
        setShowQuickCount(true)
      } else {
        setSelectedItems({})
        alert('Sale recorded successfully!')
      }
    } catch (err) {
      console.error('Error recording sale:', err)
      alert('Failed to record sale. Please try again.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/staff/pin')
  }

  if (!staff) return null

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
          <button className={styles.syncBtn}>Synced: 3m ago</button>
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
        <div className={styles.productGrid}>
          {PRODUCTS.map(product => (
            <ProductTile
              key={product.id}
              product={product}
              quantity={selectedItems[product.id] || 0}
              onTap={() => handleProductTap(product.id)}
              onRemove={() => handleRemoveProduct(product.id)}
            />
          ))}
        </div>

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
            onClick={() => alert('View History - Coming soon')}
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
            onClick={() =>setSelectedItems({})}
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