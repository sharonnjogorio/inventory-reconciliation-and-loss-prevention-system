import { useNavigate } from 'react-router-dom'
import styles from './StaffLanding.module.css'



function StaffLanding() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      {/* Header with Back Button and Get Started */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/')}
          >
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Staff</h1>
          <p className={styles.subtitle}>Control who has access to your shop system</p>
        </div>

        <button 
          className={styles.getStartedButton}
          onClick={() => navigate('/staff/scan')}
        >
          Get Started
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        
        {/* Branding Section */}
        <div className={styles.brandingSection}>
          <h2 className={styles.brandName}>Smart Loss Control</h2>
          <p className={styles.tagline}>Staff Access Control</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => navigate('/staff/scan')}
          >
            SCAN QR CODE
          </button>

          <button 
            className={styles.actionButtonSecondary}
            onClick={() => navigate('/staff/pin')}
          >
            ENTER PIN
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffLanding