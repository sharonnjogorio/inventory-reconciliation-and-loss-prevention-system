import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Settings.module.css'

function Settings() {
  const navigate = useNavigate()
  
  const [settings, setSettings] = useState({
    whatsappAlerts: true,
    lowStockWarnings: true,
    staffInventory: false
  })

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Control all your shop preferences</p>
      </div>

      <div className={styles.content}>
        {/* Shop Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shop Information</h2>
          
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>
              <span className={styles.labelText}>Shop Name</span>
              <span className={styles.labelSubtext}>Amina's Store</span>
            </div>
            <button className={styles.editBtn}>Edit</button>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>
              <span className={styles.labelText}>Phone Number</span>
              <span className={styles.labelSubtext}>+234 803 XXX 4567</span>
            </div>
            <button className={styles.editBtn}>Edit</button>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>
              <span className={styles.labelText}>Shop Market, Lagos</span>
              <span className={styles.labelSubtext}></span>
            </div>
            <button className={styles.editBtn}>Edit</button>
          </div>
        </section>

        {/* Alert Preferences */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alert Preferences</h2>
          
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>WhatsApp Alerts</span>
              <span className={styles.toggleSubtext}>Receive critical stock variance notifications</span>
            </div>
            <button 
              className={`${styles.toggle} ${settings.whatsappAlerts ? styles.toggleOn : ''}`}
              onClick={() => toggleSetting('whatsappAlerts')}
            >
              <div className={styles.toggleSwitch}></div>
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Low Stock Warnings</span>
              <span className={styles.toggleSubtext}>Get alerts when products fall below threshold</span>
            </div>
            <button 
              className={`${styles.toggle} ${settings.lowStockWarnings ? styles.toggleOn : ''}`}
              onClick={() => toggleSetting('lowStockWarnings')}
            >
              <div className={styles.toggleSwitch}></div>
            </button>
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Staff Inventory</span>
              <span className={styles.toggleSubtext}>Receive daily alerts from Sign in/14 AM</span>
            </div>
            <button 
              className={`${styles.toggle} ${settings.staffInventory ? styles.toggleOn : ''}`}
              onClick={() => toggleSetting('staffInventory')}
            >
              <div className={styles.toggleSwitch}></div>
            </button>
          </div>
        </section>

        {/* Security */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Security</h2>
          
          <button className={styles.actionBtn}>
            <span>Change Password</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.actionBtn}>
            <span>Manage Staff Access</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>
            <span>Revoke All Staff Sessions</span>
            <span className={styles.arrow}>→</span>
          </button>
        </section>

        {/* Data & Privacy */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data & Privacy</h2>
          
          <button className={styles.actionBtn}>
            <span>Export All Data</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.actionBtn}>
            <span>Privacy Policy</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.actionBtn}>
            <span>Terms of Service</span>
            <span className={styles.arrow}>→</span>
          </button>
        </section>
      </div>
    </div>
  )
}

export default Settings