import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerDashboard.module.css'
import dashboardAPI from '../../../../services/endpoints/dashboard'
import { inventoryAPI } from '../../../../services/endpoints/inventory'
import mamadorImg from '../../../../assets/image/mamador.svg'
import devonkingImg from '../../../../assets/image/devonking.svg'
import goldenpennySvg from '../../../../assets/image/goldenpenny.svg'
import poweroilImg from '../../../../assets/image/poweroil.svg'
import kingsoilImg from '../../../../assets/image/kingsoil.png'

const getBrandImage = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('mamador'))                    return mamadorImg
  if (n.includes('king'))                       return kingsoilImg
  if (n.includes('devon'))                      return devonkingImg
  if (n.includes('golden') || n.includes('penny')) return goldenpennySvg
  if (n.includes('power'))                      return poweroilImg
  return mamadorImg
}

const AddStockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
    <line x1="12" y1="7" x2="12" y2="3" stroke="#E29A5C"/>
    <line x1="10" y1="5" x2="14" y2="5" stroke="#E29A5C"/>
  </svg>
)

const ReportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const ManageStaffIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

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
      healthScore: null,
      totalSales: null,
      revenue: null,
      lowStockCount: null,
      lastSynced: null,
    }
  })

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [data, inventoryData] = await Promise.all([
        dashboardAPI.getDashboardOverview(),
        inventoryAPI.getInventorySummary()
      ])

      if (data.success) {
        console.log('📊 Dashboard response:', JSON.stringify(data, null, 2))

        const inventory = inventoryData.inventory || inventoryData.data || []
        const lowStockCount = Array.isArray(inventory)
          ? inventory.filter(item => item.quantity > 0 && item.quantity <= (item.reorder_level || 10)).length
          : data.low_stock_items?.length ?? 0

        // Try all common field name patterns the backend might use
        const rawScore =
          data.health?.score ??
          data.health?.health_score ??
          data.health_score ??
          data.shop?.health_score ??
          data.score ??
          null
        const healthScore = rawScore !== null ? parseFloat(rawScore) || null : null

        setShopData(prev => ({
          ...prev,
          name: data.shop.shop_name || prev.name,
          healthScore,
          totalSales: parseFloat(data.stats.today_units_sold),
          revenue: parseFloat(data.stats.today_revenue),
          lowStockCount,
          lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))

        const alerts = []

        if (data.low_stock_items?.length > 0) {
          data.low_stock_items.forEach(item => {
            if (item.quantity === 0) {
              alerts.push({ id: `out-of-stock-${item.product}`, type: 'error', severity: 'critical', title: `OUT OF STOCK: ${item.product}`, message: `Product is completely out of stock. Urgent restock needed!`, product: item })
            } else {
              alerts.push({ id: `low-stock-${item.product}`, type: 'warning', severity: 'medium', title: `Low Stock: ${item.product}`, message: `Only ${item.quantity} units remaining. Restock recommended.`, product: item })
            }
          })
        }

        if (data.recent_alerts?.length > 0) {
          data.recent_alerts.forEach(alert => {
            const dev = Math.abs(alert.deviation || 0)
            const type = dev > 20 ? 'error' : dev > 5 ? 'warning' : 'info'
            const severity = dev > 20 ? 'critical' : dev > 5 ? 'medium' : 'low'
            alerts.push({ id: alert.id, type, severity, title: `${alert.product} Deviation`, message: `Deviation: ${alert.deviation} units, Loss: $${alert.estimated_loss}` })
          })
        }

        if (alerts.length === 0) {
          alerts.push({ id: 1, type: 'success', severity: 'low', title: 'Inventory Synced', message: 'Successfully synced inventory' })
        }

        setRecentAlerts(alerts.slice(0, 5))

        const topSellingData = await dashboardAPI.getTopSelling('today', 5)
        if (topSellingData.success && topSellingData.products.length > 0) {
          setTopSelling(topSellingData.products.map(product => ({ id: product.sku_id, name: product.product_name, image: getBrandImage(product.product_name), sales: product.units_sold })))
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
        <h1 className={styles.pageTitle}>Owner Dashboard</h1>
        <button className={styles.welcomeBtn} onClick={() => navigate('/owner/inventory')}>
          {shopData.owner ? `Welcome ${shopData.owner.split(' ')[0]}!` : 'Welcome Owner!'}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.healthCard}>
            <div className={styles.circleWrapper}>
              <svg className={styles.circle} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E5E5" strokeWidth="12" />
                <circle cx="100" cy="100" r="90" fill="none" stroke={shopData.healthScore >= 75 ? '#00A63E' : shopData.healthScore >= 50 ? '#F59E0B' : '#DC2626'} strokeWidth="12" strokeDasharray={`${(shopData.healthScore ?? 0) * 5.65} 565`} strokeLinecap="round" transform="rotate(-90 100 100)" />
              </svg>
              <div className={styles.scoreValue} style={{ color: shopData.healthScore >= 75 ? '#00A63E' : shopData.healthScore >= 50 ? '#F59E0B' : '#DC2626' }}>{shopData.healthScore ?? '—'}</div>
            </div>
            <p className={styles.healthLabel}>HEALTH SCORE</p>
          </div>

          <div className={styles.statsColumn}>
            <div className={styles.statCard}><h3>TOTAL SALES</h3><p className={styles.statAmount}>{shopData.totalSales != null ? shopData.totalSales.toLocaleString() : '—'}</p></div>
            <div className={styles.statCard}><h3>REVENUE</h3><p className={styles.statAmount}>{shopData.revenue != null ? `$${shopData.revenue.toLocaleString()}` : '—'}</p></div>
          </div>

          <div className={styles.statsColumn}>
            <div className={styles.alertCard}><h3>LOW STOCK ALERT</h3><p className={styles.alertValue}>{shopData.lowStockCount ?? '—'}</p></div>
            <div className={styles.syncCard}><h3>LAST SYNCED</h3><p className={styles.syncValue}>{shopData.lastSynced ?? '—'}</p></div>
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
                  <div className={styles.alertIcon}>
                    {alert.type === 'error' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    ) : alert.type === 'warning' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    ) : alert.type === 'info' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
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
            <button className={styles.actionCard} onClick={() => navigate('/owner/inventory/add')}><div className={styles.actionIcon}><AddStockIcon /></div><span>Add Stock</span></button>
            <button className={styles.actionCard} onClick={() => navigate('/owner/inventory')}><div className={styles.actionIcon}><ReportIcon /></div><span>View Inventory/Report</span></button>
            <button className={styles.actionCard} onClick={() => navigate('/owner/staff')}><div className={styles.actionIcon}><ManageStaffIcon /></div><span>Manage Staff</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard