import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { alertsAPI } from '../../services'
import logo from '../../assets/logo.png'
import styles from './OwnerNavbar.module.css'

function OwnerNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [newAlertsCount, setNewAlertsCount] = useState(0)
  const [ownerName, setOwnerName] = useState(() => {
    try {
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        return user.full_name || 'Owner'
      }
    } catch {
      // ignore parse errors
    }
    return 'Owner'
  })
  const [shopName, setShopName] = useState('My Shop')
  const [ownerInitial, setOwnerInitial] = useState(() => {
    try {
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        return user.full_name ? user.full_name.charAt(0).toUpperCase() : 'O'
      }
    } catch {
      // ignore parse errors
    }
    return 'O'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashResponse = await fetch('http://192.168.8.27:5000/dashboard/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        const dashData = await dashResponse.json()
        if (dashData.success && dashData.shop) {
          setShopName(dashData.shop.shop_name)
        }

        const alertsResponse = await alertsAPI.getAlertsSummary()
        if (alertsResponse.success) {
          setNewAlertsCount(alertsResponse.summary.total_active || 0)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }

    fetchData()

    const interval = setInterval(async () => {
      try {
        const alertsResponse = await alertsAPI.getAlertsSummary()
        if (alertsResponse.success) {
          setNewAlertsCount(alertsResponse.summary.total_active || 0)
        }
      } catch (err) {
        console.error('Error refreshing alerts:', err)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logoSection} onClick={() => navigate('/owner/dashboard')}>
          <img src={logo} alt="Smart Loss Control" className={styles.logo} />
          <span className={styles.shopName}>{shopName}</span>
        </div>

        <div className={styles.navLinks}>
          <button className={`${styles.link} ${isActive('/owner/dashboard') ? styles.active : ''}`} onClick={() => navigate('/owner/dashboard')}>Dashboard</button>
          <button className={`${styles.link} ${isActive('/owner/staff') ? styles.active : ''}`} onClick={() => navigate('/owner/staff')}>Staff</button>
          <button className={`${styles.link} ${isActive('/owner/inventory') ? styles.active : ''}`} onClick={() => navigate('/owner/inventory')}>Inventory</button>
          <button className={`${styles.link} ${isActive('/owner/sales-activity') ? styles.active : ''}`} onClick={() => navigate('/owner/sales-activity')}>Sales Activity</button>
          <button className={`${styles.link} ${isActive('/owner/analytics') ? styles.active : ''}`} onClick={() => navigate('/owner/analytics')}>Analytics</button>
          <button className={`${styles.link} ${isActive('/owner/alerts') ? styles.active : ''}`} onClick={() => navigate('/owner/alerts')}>
            Alerts
            {newAlertsCount > 0 && <span className={styles.badge}>{newAlertsCount}</span>}
          </button>
          <button className={`${styles.link} ${isActive('/owner/settings') ? styles.active : ''}`} onClick={() => navigate('/owner/settings')}>Settings</button>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{ownerInitial}</div>
            <span className={styles.userName}>{ownerName}</span>
          </div>
          <button className={styles.logoutBtn} onClick={() => {
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
            navigate('/')
          }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default OwnerNavbar