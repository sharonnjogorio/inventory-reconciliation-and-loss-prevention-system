import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import styles from './OwnerNavbar.module.css'

function OwnerNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoSection} onClick={() => navigate('/owner/dashboard')}>
          <img src={logo} alt="Smart Loss Control" className={styles.logo} />
          <span className={styles.shopName}>Amina's Store</span>
        </div>

        {/* Nav Links */}
        <div className={styles.navLinks}>
          <button 
            className={`${styles.link} ${isActive('/owner/dashboard') ? styles.active : ''}`}
            onClick={() => navigate('/owner/dashboard')}
          >
            Dashboard
          </button>
          
          <button 
            className={`${styles.link} ${isActive('/owner/staff') ? styles.active : ''}`}
            onClick={() => navigate('/owner/staff')}
          >
            Staff
          </button>
          
          <button 
            className={`${styles.link} ${isActive('/owner/inventory') ? styles.active : ''}`}
            onClick={() => navigate('/owner/inventory')}
          >
            Inventory
          </button>
          
          <button 
            className={`${styles.link} ${isActive('/owner/reports') ? styles.active : ''}`}
            onClick={() => navigate('/owner/reports')}
          >
            Reports
          </button>
          
          <button 
            className={`${styles.link} ${isActive('/owner/analytics') ? styles.active : ''}`}
            onClick={() => navigate('/owner/analytics')}
          >
            Analytics
          </button>
          
          <button 
            className={`${styles.link} ${isActive('/owner/settings') ? styles.active : ''}`}
            onClick={() => navigate('/owner/settings')}
          >
            Settings
          </button>
        </div>

        {/* Right Side - User Menu */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>A</div>
            <span className={styles.userName}>Amina</span>
          </div>
          <button 
            className={styles.logoutBtn}
            onClick={() => navigate('/')}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default OwnerNavbar