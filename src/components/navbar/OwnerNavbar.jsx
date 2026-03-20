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
    } catch { }
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
    } catch { }
    return 'O'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const navItems = [
    { path: '/owner/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/owner/staff', label: 'Staff', icon: '👥' },
    { path: '/owner/inventory', label: 'Inventory', icon: '📦' },
    { path: '/owner/sales-activity', label: 'Sales Activity', icon: '💰' },
    { path: '/owner/analytics', label: 'Analytics', icon: '📊' },
    { path: '/owner/alerts', label: 'Alerts', icon: '🔔', badge: newAlertsCount },
    { path: '/owner/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoSection} onClick={() => navigate('/owner/dashboard')}>
        <img src={logo} alt="Smart Loss Control" className={styles.logo} />
        <span className={styles.shopName}>{shopName}</span>
      </div>

      {/* Nav Links */}
      <nav className={styles.navLinks}>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`${styles.link} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
            {item.badge > 0 && <span className={styles.badge}>{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* User Section */}
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
    </aside>
  )
}

export default OwnerNavbar