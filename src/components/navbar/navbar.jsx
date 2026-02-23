import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import styles from './navbar.module.css'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  // Show Login button on landing page only
  const showLoginButton = location.pathname === '/'

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoSection} onClick={() => navigate('/')}>
          <img src={logo} alt="Smart Loss Control" className={styles.logo} />
        </div>

        {/* Nav Links + Button */}
        <div className={styles.navRight}>
          <div className={styles.navLinks}>
            <a href="/" className={styles.link}>Home</a>
            <a href="#pricing" className={styles.link}>Pricing</a>
            <a href="#services" className={styles.link}>Services</a>
            <a href="#contact" className={styles.link}>Contact</a>
          </div>

          {/* Login Button - ONLY on landing page */}
          {showLoginButton && (
            <button 
              className={styles.loginBtn}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar