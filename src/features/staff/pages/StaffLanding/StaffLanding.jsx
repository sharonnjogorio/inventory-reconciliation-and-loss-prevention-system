import { useNavigate } from 'react-router-dom'
// import Button from '../ui/button/button'
import styles from './StaffLanding.module.css'

/**
 * Staff Landing Page
 * 
 * Entry point for staff - choose between:
 * - First time: Scan QR Code (device linking)
 * - Returning: Enter PIN (daily login)
 */

function StaffLanding() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>Staff</h1>
        <p className={styles.subtitle}>Control who has access to your shop system</p>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <h2 className={styles.brandName}>Smart Loss Control</h2>
          <p className={styles.tagline}>Track your stock in real-time</p>
        </div>

        <div className={styles.actions}>
          {/* Scan QR Code - First Time */}
          <button 
            className={styles.actionButton}
            onClick={() => navigate('/staff/scan')}
          >
            <div className={styles.iconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01"/>
              </svg>
            </div>
            <span>Scan QR Code</span>
            <p className={styles.actionDesc}>First time? Link your device</p>
          </button>

          {/* Enter PIN - Daily Login */}
          <button 
            className={styles.actionButton}
            onClick={() => navigate('/staff/pin')}
          >
            <div className={styles.iconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span>Enter PIN</span>
            <p className={styles.actionDesc}>Already linked? Quick login</p>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Supporting SME & Decent Work and Economic Growth</p>
        <p className={styles.copyright}>© 2025 Smart Loss Control. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default StaffLanding