import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerDashboard.module.css'
import dashboardAPI from '../../../services/endpoints/dashboard'
import mamadorImg from '../../../assets/image/mamador.svg'
import kingsoilImg from '../../../assets/image/kingsoil.png'

function OwnerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentAlerts, setRecentAlerts] = useState([])   // ✅ was missing
  const [topSelling, setTopSelling] = useState([])        // ✅ was missing

  const [shopData, setShopData] = useState(() => {
    const storedShopName = localStorage.getItem('shopName')
    const storedOwnerName = localStorage.getItem('fullName')
    return {
      name: storedShopName || "Amina's Store",
      owner: storedOwnerName || 'Amina Yusuf',
      healthScore: 92,
      totalSales: 1867.83,
      revenue: 1867.83,
      lowStockCount: 14,
      lastSynced: '1 minutes ago',
    }
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dashboardAPI.getDashboardOverview()

      if (data.success) {
        const actualLowStockCount = data.low_stock_items.filter(item => item.quantity <= 10).length

        setShopData(prev => ({
          ...prev,
          name: data.shop.shop_name || prev.name,
          healthScore: data.health.score,
          totalSales: parseFloat(data.stats.today_units_sold),
          revenue: parseFloat(data.stats.today_revenue),
          lowStockCount: actualLowStockCount,
          lastSynced: '1 minute ago',
        }))

        const alerts = []

        if (data.low_stock_items?.length > 0) {
          data.low_stock_items.forEach(item => {
            if (item.quantity === 0) {
              alerts.push({ id: `out-of-stock-${item.product}`, type: 'error', severity: 'critical', title: `OUT OF STOCK: ${item.product}`, message: `Product is completely out of stock. Urgent restock needed!`, product: item })
            }
          })
          data.low_stock_items.forEach(item => {
            if (item.quantity > 0 && item.quantity <= 10) {
              alerts.push({ id: `low-stock-${item.product}`, type: 'warning', severity: 'medium', title: `Low Stock: ${item.product}`, message: `Only ${item.quantity} units remaining. Restock recommended.`, product: item })
            }
          })
        }

        if (data.recent_alerts?.length > 0) {
          data.recent_alerts.forEach(alert => {
            alerts.push({ id: alert.id, type: alert.status === 'CRITICAL' ? 'error' : 'warning', severity: alert.status === 'CRITICAL' ? 'critical' : 'medium', title: `${alert.product} Deviation`, message: `Deviation: ${alert.deviation} units, Loss: $${alert.estimated_loss}` })
          })
        }

        if (alerts.length === 0) {
          alerts.push({ id: 1, type: 'success', severity: 'low', title: 'Inventory Synced', message: 'Successfully synced inventory' })
        }

        setRecentAlerts(alerts.slice(0, 5))

        const topSellingData = await dashboardAPI.getTopSelling('today', 5)
        if (topSellingData.success && topSellingData.products.length > 0) {
          setTopSelling(topSellingData.products.map(product => ({ id: product.sku_id, name: product.product_name, image: mamadorImg, sales: product.units_sold })))
        } else {
          setTopSelling([])
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Select Your Product Catalog</h1>
        <button className={styles.welcomeBtn} onClick={() => navigate('/owner/catalog')}>
          {shopData.owner ? `Welcome ${shopData.owner.split(' ')[0]}!` : 'Welcome Owner!'}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.healthCard}>
            <div className={styles.circleWrapper}>
              <svg className={styles.circle} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E5E5" strokeWidth="12" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="#00A63E" strokeWidth="12" strokeDasharray={`${shopData.healthScore * 5.65} 565`} strokeLinecap="round" transform="rotate(-90 100 100)" />
              </svg>
              <div className={styles.scoreValue}>{shopData.healthScore}</div>
            </div>
            <p className={styles.healthLabel}>HEALTH SCORE</p>
          </div>

          <div className={styles.statsColumn}>
            <div className={styles.statCard}><h3>TOTAL SALES</h3><p className={styles.statAmount}>{shopData.totalSales.toLocaleString()}</p></div>
            <div className={styles.statCard}><h3>REVENUE</h3><p className={styles.statAmount}>${shopData.revenue.toLocaleString()}</p></div>
          </div>

          <div className={styles.statsColumn}>
            <div className={styles.alertCard}><h3>LOW STOCK ALERT</h3><p className={styles.alertValue}>{shopData.lowStockCount}</p></div>
            <div className={styles.syncCard}><h3>LAST SYNCED</h3><p className={styles.syncValue}>{shopData.lastSynced}</p></div>
          </div>
        </div>

        <div className={styles.middleSection}>
          <div className={styles.alertsSection}>
            <div className={styles.sectionHeader}>
              <h2>Recent Alerts</h2>
              <button className={styles.viewAll} onClick={() => navigate('/owner/alerts')}>View all</button>
            </div>
            <div className={styles.alertsList}>
              {recentAlerts.map(alert => (
                <div key={alert.id} className={`${styles.alertItem} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
                  <div className={styles.alertIcon}>{alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : '✓'}</div>
                  <div className={styles.alertContent}><h4>{alert.title}</h4><p>{alert.message}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.topSellingSection}>
            <h2 className={styles.sectionTitle}>Top Selling Today</h2>
            <div className={styles.productsList}>
              {topSelling.length > 0 ? (
                topSelling.map(product => (
                  <div key={product.id} className={styles.productItem}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                    <div className={styles.productInfo}><h4>{product.name}</h4><p>{product.sales} units sold</p></div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No sales recorded yet today</p>
                  <p className={styles.emptyHint}>Sales will appear here once staff starts logging transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Start Preventing Losses Today</h2>
          <p>Join retail SMEs protecting their profits with data-driven loss prevention</p>
          <button className={styles.ctaBtn}>LEARN MORE</button>
        </div>

        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.actionCard} onClick={() => navigate('/owner/inventory/add')}><div className={styles.actionIcon}>📦</div><span>Add Stock</span></button>
            <button className={styles.actionCard} onClick={() => navigate('/owner/inventory')}><div className={styles.actionIcon}>📊</div><span>View Inventory/Report</span></button>
            <button className={styles.actionCard} onClick={() => navigate('/owner/staff')}><div className={styles.actionIcon}>👥</div><span>Manage Staff</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard