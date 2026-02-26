import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerDashboard.module.css'
import dashboardAPI from '../../../services/endpoints/dashboard'

import mamadorImg from '../../../assets/image/mamador.svg'
import kingsoilImg from '../../../assets/image/kingsoil.png'

function OwnerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [shopData, setShopData] = useState({
    name: "Amina's Store",
    owner: 'Amina Yusuf',
    healthScore: 92,
    totalSales: 0,
    revenue: 0,
    lowStockCount: 0,
    lastSynced: '1 minutes ago',
  })

  const [recentAlerts, setRecentAlerts] = useState([])
  const [topSelling, setTopSelling] = useState([])

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData')
    
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setShopData(prev => ({
          ...prev,
          owner: user.full_name || prev.owner,
        }))
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }

    // Fetch dashboard data
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await dashboardAPI.getDashboardOverview()
      console.log('📊 Dashboard data:', data)

      if (data.success) {
        // Count only items with 10 or fewer units as "low stock"
        const actualLowStockCount = data.low_stock_items.filter(item => item.quantity <= 10).length
        
        // Update shop data with real values
        setShopData(prev => ({
          ...prev,
          name: data.shop.shop_name || prev.name,
          healthScore: data.health.score,
          totalSales: parseFloat(data.stats.today_units_sold),
          revenue: parseFloat(data.stats.today_revenue),
          lowStockCount: actualLowStockCount,
          lastSynced: '1 minute ago',
        }))

        // Build alerts array from multiple sources
        const alerts = []
        
        // 1. Add out of stock alerts (stock = 0) - CRITICAL
        if (data.low_stock_items && data.low_stock_items.length > 0) {
          data.low_stock_items.forEach(item => {
            if (item.quantity === 0) {
              alerts.push({
                id: `out-of-stock-${item.product}`,
                type: 'error',
                severity: 'critical',
                title: `OUT OF STOCK: ${item.product}`,
                message: `Product is completely out of stock. Urgent restock needed!`,
                product: item,
              })
            }
          })
        }
        
        // 2. Add low stock alerts (stock <= 10 but > 0) - WARNING
        if (data.low_stock_items && data.low_stock_items.length > 0) {
          data.low_stock_items.forEach(item => {
            if (item.quantity > 0 && item.quantity <= 10) {
              alerts.push({
                id: `low-stock-${item.product}`,
                type: 'warning',
                severity: 'medium',
                title: `Low Stock: ${item.product}`,
                message: `Only ${item.quantity} units remaining. Restock recommended.`,
                product: item,
              })
            }
          })
        }
        
        // 3. Add deviation alerts from backend
        if (data.recent_alerts && data.recent_alerts.length > 0) {
          data.recent_alerts.forEach(alert => {
            alerts.push({
              id: alert.id,
              type: alert.status === 'CRITICAL' ? 'error' : 'warning',
              severity: alert.status === 'CRITICAL' ? 'critical' : 'medium',
              title: `${alert.product} Deviation`,
              message: `Deviation: ${alert.deviation} units, Loss: $${alert.estimated_loss}`,
            })
          })
        }
        
        // 4. If no alerts, show success message
        if (alerts.length === 0) {
          alerts.push({
            id: 1,
            type: 'success',
            severity: 'low',
            title: 'Inventory Synced',
            message: 'Successfully synced inventory',
          })
        }
        
        setRecentAlerts(alerts.slice(0, 5)) // Show top 5 alerts

        // Get top selling products from API
        const topSellingData = await dashboardAPI.getTopSelling('today', 5)
        if (topSellingData.success && topSellingData.products.length > 0) {
          setTopSelling(topSellingData.products.map(product => ({
            id: product.sku_id,
            name: product.product_name,
            image: mamadorImg,
            sales: product.units_sold
          })))
        } else {
          // No sales yet
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
      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>Loading dashboard...</div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Select Your Product Catalog</h1>
        <button
          className={styles.welcomeBtn}
          onClick={() => navigate('/owner/catalog')}
        >
          {shopData.owner
            ? `Welcome ${shopData.owner.split(' ')[0]}!`
            : 'Welcome Owner!'}
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Top Stats Section */}
        <div className={styles.topSection}>
          {/* Health Score Circle */}
          <div className={styles.healthCard}>
            <div className={styles.circleWrapper}>
              <svg className={styles.circle} viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#E5E5E5"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#00A63E"
                  strokeWidth="12"
                  strokeDasharray={`${shopData.healthScore * 5.65} 565`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className={styles.scoreValue}>{shopData.healthScore}</div>
            </div>
            <p className={styles.healthLabel}>HEALTH SCORE</p>
          </div>

          {/* Revenue Stats */}
          <div className={styles.statsColumn}>
            <div className={styles.statCard}>
              <h3>TOTAL SALES</h3>
              <p className={styles.statAmount}>
                {shopData.totalSales.toLocaleString()}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>REVENUE</h3>
              <p className={styles.statAmount}>
                ${shopData.revenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Alert Stats */}
          <div className={styles.statsColumn}>
            <div className={styles.alertCard}>
              <h3>LOW STOCK ALERT</h3>
              <p className={styles.alertValue}>{shopData.lowStockCount}</p>
            </div>
            <div className={styles.syncCard}>
              <h3>LAST SYNCED</h3>
              <p className={styles.syncValue}>{shopData.lastSynced}</p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className={styles.middleSection}>
          {/* Recent Alerts */}
          <div className={styles.alertsSection}>
            <div className={styles.sectionHeader}>
              <h2>Recent Alerts</h2>
              <button
                className={styles.viewAll}
                onClick={() => navigate('/owner/alerts')}
              >
                View all
              </button>
            </div>
            <div className={styles.alertsList}>
              {recentAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`${styles.alertItem} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}
                >
                  <div className={styles.alertIcon}>
                    {alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : '✓'}
                  </div>
                  <div className={styles.alertContent}>
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Today */}
          <div className={styles.topSellingSection}>
            <h2 className={styles.sectionTitle}>Top Selling Today</h2>
            <div className={styles.productsList}>
              {topSelling.length > 0 ? (
                topSelling.map(product => (
                  <div key={product.id} className={styles.productItem}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                    />
                    <div className={styles.productInfo}>
                      <h4>{product.name}</h4>
                      <p>{product.sales} units sold</p>
                    </div>
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

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2>Start Preventing Losses Today</h2>
          <p>
            Join retail SMEs protecting their profits with data-driven loss prevention
          </p>
          <button className={styles.ctaBtn}>LEARN MORE</button>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button 
              className={styles.actionCard}
              onClick={() => navigate('/owner/inventory/add')}
            >
              <div className={styles.actionIcon}>📦</div>
              <span>Add Stock</span>
            </button>
            <button 
              className={styles.actionCard}
              onClick={() => navigate('/owner/inventory')}
            >
              <div className={styles.actionIcon}>📊</div>
              <span>View Inventory/Report</span>
            </button>
            <button 
              className={styles.actionCard}
              onClick={() => navigate('/owner/staff')}
            >
              <div className={styles.actionIcon}>👥</div>
              <span>Manage Staff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
