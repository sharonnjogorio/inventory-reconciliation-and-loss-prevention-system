import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import styles from './navbar.module.css'

function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logoSection} onClick={() => navigate('/')}>
        <img src={logo} alt="Smart Loss Control" className={styles.logo} />
      </div>

      {/* Nav Links - Right aligned */}
      <div className={styles.navLinks}>
        <a href="#" className={styles.link}>Home</a>
        <a href="#" className={styles.link}>Pricing</a>
        <a href="#" className={styles.link}>Services</a>
        <a href="#" className={styles.link}>Contact</a>
      </div>
      
      {/* NO Get Started button here */}
    </nav>
  )
}

export default Navbar