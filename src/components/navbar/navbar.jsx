import { Link } from 'react-router-dom'
import Button from '../ui/button/button'
import styles from './navbar.module.css'

function Navbar() {
  return (
    <nav className={styles.navbar}>

      {/* ── Logo ── */}
      <div className={styles.logo}>
        <div className={styles.logoCircle}></div>
      </div>

      {/* ── Nav Links ── */}
      <ul className={styles.navLinks}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/pricing">Pricing</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      {/* ── Staff Login Button ── */}
      <Link to="/staff">
        <Button variant="dark">Staff Login</Button>
      </Link>

    </nav>
  )
}

export default Navbar
