import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { alertsAPI, shopsAPI } from '../../services'
import useAuthStore from '../../store/useAuthStore'
import logo from '../../assets/image/logo.png'
import styles from './OwnerNavbar.module.css'

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const StaffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const InventoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const SalesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const AlertsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

function OwnerNavbar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const [newAlertsCount, setNewAlertsCount] = useState(0)
  const [ownerName] = useState(() => {
    return localStorage.getItem('fullName') || 'Owner'
  })
  const [shopName, setShopName] = useState(() => {
    const stored = localStorage.getItem('shopName')
    return stored && stored !== 'undefined' ? stored : ''
  })
  const [ownerInitial] = useState(() => {
    const name = localStorage.getItem('fullName')
    return name ? name.charAt(0).toUpperCase() : 'O'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alertsResponse = await alertsAPI.getAlerts({ severity: 'CRITICAL', status: 'active' })
        if (alertsResponse.alerts) {
          setNewAlertsCount(alertsResponse.alerts.length)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }

      try {
        const shopResponse = await shopsAPI.getShopProfile()
        if (shopResponse.success && shopResponse.shop?.shop_name) {
          setShopName(shopResponse.shop.shop_name)
          localStorage.setItem('shopName', shopResponse.shop.shop_name)
        }
      } catch { /* silently fall back to stored value */ }
    }

    fetchData()

    const refreshCount = async () => {
      try {
        const alertsResponse = await alertsAPI.getAlerts({ severity: 'CRITICAL', status: 'active' })
        if (alertsResponse.alerts) {
          setNewAlertsCount(alertsResponse.alerts.length)
        }
      } catch (err) {
        console.error('Error refreshing alerts:', err)
      }
    }

    const interval = setInterval(refreshCount, 30000)
    window.addEventListener('alert-resolved', refreshCount)

    return () => {
      clearInterval(interval)
      window.removeEventListener('alert-resolved', refreshCount)
    }
  }, [])

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/owner/dashboard',      label: 'Dashboard',      Icon: DashboardIcon },
    { path: '/owner/staff',          label: 'Staff',          Icon: StaffIcon },
    { path: '/owner/inventory',      label: 'Inventory',      Icon: InventoryIcon },
    { path: '/owner/sales-activity', label: 'Sales Activity', Icon: SalesIcon },
    { path: '/owner/analytics',      label: 'Analytics',      Icon: AnalyticsIcon },
    { path: '/owner/alerts',         label: 'Alerts',         Icon: AlertsIcon, badge: newAlertsCount },
    { path: '/owner/settings',       label: 'Settings',       Icon: SettingsIcon },
  ]

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logoSection} onClick={() => navigate('/owner/dashboard')}>
        <img src={logo} alt="Smart Loss Control" className={styles.logo} />
        {!collapsed && <span className={styles.shopName}>{shopName}</span>}
      </div>

      {/* Toggle Button */}
      <button className={styles.toggleBtn} onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {collapsed
            ? <polyline points="9 18 15 12 9 6"/>
            : <polyline points="15 18 9 12 15 6"/>
          }
        </svg>
      </button>

      {/* Nav Links */}
      <nav className={styles.navLinks}>
        {navItems.map(({ path, label, Icon, badge }) => (
          <button
            key={path}
            className={`${styles.link} ${isActive(path) ? styles.active : ''}`}
            onClick={() => navigate(path)}
            title={collapsed ? label : undefined}
          >
            <span className={styles.icon}><Icon /></span>
            {!collapsed && <span className={styles.label}>{label}</span>}
            {!collapsed && badge > 0 && <span className={styles.badge}>{badge}</span>}
            {collapsed && badge > 0 && <span className={styles.badgeDot} />}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className={styles.userSection}>
        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{ownerInitial}</div>
            <span className={styles.userName}>{ownerName}</span>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={() => {
          logout()
          localStorage.removeItem('authToken')
          localStorage.removeItem('ownerToken')
          localStorage.removeItem('userData')
          localStorage.removeItem('staffData')
          navigate('/')
        }} title={collapsed ? 'Logout' : undefined}>
          <LogoutIcon />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default OwnerNavbar
