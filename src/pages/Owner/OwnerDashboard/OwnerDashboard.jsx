import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerDashboard.module.css'

import mamadorImg from '../../../assets/image/mamador.svg'
import kingsoilImg from '../../../assets/image/kingsoil.png'

function OwnerDashboard() {
  const navigate = useNavigate()
  const [shopData] = useState({
    name: "Amina's Store",
    owner: "Amina Yusuf",
    healthScore: 92,
    totalSales: 1867.83,
    revenue: 1867.83,
    lowStockCount: 14,
    lastSynced: '1 minutes ago'
  })

  const recentAlerts = [
    {
      id: 1,
      type: 'success',
      title: 'Inventory Synced',
      message: 'Successfully synced inventory at 2:45 PM'
    }
  ]

  const topSelling = [
    {
      id: 1,
      name: 'Mamador 2L',
      image: mamadorImg,
      sales: 45
    },
    {
      id: 2,
      name: "King's Oil 1L",
      image: kingsoilImg,
      sales: 38
    }
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Select Your Product Catalog</h1>
        <button 
          className={styles.welcomeBtn}
          onClick={() => navigate('/owner/catalog')}
        >
          Welcome Amina!
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
              <p className={styles.statAmount}>${shopData.totalSales.toLocaleString()}</p>
            </div>
            <div className={styles.statCard}>
              <h3>REVENUE</h3>
              <p className={styles.statAmount}>${shopData.revenue.toLocaleString()}</p>
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
              >View all</button>
            </div>
            <div className={styles.alertsList}>
              {recentAlerts.map(alert => (
                <div key={alert.id} className={styles.alertItem}>
                  <div className={styles.alertIcon}>✓</div>
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
              {topSelling.map(product => (
                <div key={product.id} className={styles.productItem}>
                  <img src={product.image} alt={product.name} className={styles.productImage} />
                  <div className={styles.productInfo}>
                    <h4>{product.name}</h4>
                    <p>{product.sales} units sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2>Start Preventing Losses Today</h2>
          <p>Join retail SMEs protecting their profits with data-driven loss prevention</p>
          <button className={styles.ctaBtn}>LEARN MORE</button>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>📦</div>
              <span>Add Stock</span>
            </button>
            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <span>View Inventory/Report</span>
            </button>
            <button className={styles.actionCard}>
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