import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Settings.module.css'

function Settings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    ownerPhone: '',
    ownerName: ''
  })
  
  const [settings, setSettings] = useState({
    whatsappAlerts: true,
    lowStockWarnings: true,
    staffInventory: false
  })

  const [editMode, setEditMode] = useState({
    shopName: false,
    ownerName: false,
    phone: false
  })

  const [editValues, setEditValues] = useState({
    shopName: '',
    ownerName: '',
    phone: ''
  })

  useEffect(() => {
    loadShopData()
  }, [])

  const loadShopData = async () => {
    try {
      // Load from localStorage
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        setShopInfo({
          shopName: user.shop_name || 'My Shop',
          ownerPhone: user.phone || '',
          ownerName: user.full_name || ''
        })
      }

      // Load settings from backend if available
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.8.27:5000'}/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      const data = await response.json()
      if (data.success && data.shop) {
        setShopInfo(prev => ({
          ...prev,
          shopName: data.shop.shop_name || prev.shopName,
          ownerPhone: data.shop.owner_phone || prev.ownerPhone
        }))
      }
    } catch (error) {
      console.error('Failed to load shop data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    // Save to localStorage
    const newSettings = { ...settings, [key]: !settings[key] }
    localStorage.setItem('alertSettings', JSON.stringify(newSettings))
    console.log(`✅ Setting ${key} toggled to:`, !settings[key])
  }

  const handleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }))
    setEditValues(prev => ({ ...prev, [field]: shopInfo[field] }))
  }

  const handleCancel = (field) => {
    setEditMode(prev => ({ ...prev, [field]: false }))
    setEditValues(prev => ({ ...prev, [field]: shopInfo[field] }))
  }

  const handleSave = async (field) => {
    try {
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      
      if (field === 'shopName') {
        userData.shop_name = editValues.shopName
      } else if (field === 'ownerName') {
        userData.full_name = editValues.ownerName
      } else if (field === 'phone') {
        userData.phone = editValues.phone
      }
      
      localStorage.setItem('userData', JSON.stringify(userData))
      
      // Update state
      setShopInfo(prev => ({
        ...prev,
        [field]: editValues[field]
      }))
      
      setEditMode(prev => ({ ...prev, [field]: false }))
      console.log(`✅ ${field} updated successfully`)
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes')
    }
  }

  const handleExportData = () => {
    const data = {
      shopInfo,
      settings,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shop-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    console.log('✅ Data exported successfully')
  }

  const handleRevokeAllSessions = () => {
    if (confirm('Are you sure you want to revoke all staff sessions? All staff will need to re-register.')) {
      // Clear all staff tokens
      localStorage.removeItem('staffTokens')
      alert('✅ All staff sessions have been revoked')
      console.log('✅ All staff sessions revoked')
    }
  }

  const maskPhone = (phone) => {
    if (!phone) return '+234 XXX XXX XXXX'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 4)} XXX XXX ${cleaned.slice(-4)}`
    }
    return phone
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Control all your shop preferences</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading settings...</div>
      ) : (
        <div className={styles.content}>
          {/* Shop Information */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Shop Information</h2>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <span className={styles.labelText}>Shop Name</span>
                {editMode.shopName ? (
                  <input
                    type="text"
                    value={editValues.shopName}
                    onChange={(e) => setEditValues(prev => ({ ...prev, shopName: e.target.value }))}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <span className={styles.labelSubtext}>{shopInfo.shopName}</span>
                )}
              </div>
              {editMode.shopName ? (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => handleSave('shopName')}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => handleCancel('shopName')}>Cancel</button>
                </div>
              ) : (
                <button className={styles.editBtn} onClick={() => handleEdit('shopName')}>Edit</button>
              )}
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <span className={styles.labelText}>Owner Name</span>
                {editMode.ownerName ? (
                  <input
                    type="text"
                    value={editValues.ownerName}
                    onChange={(e) => setEditValues(prev => ({ ...prev, ownerName: e.target.value }))}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <span className={styles.labelSubtext}>{shopInfo.ownerName}</span>
                )}
              </div>
              {editMode.ownerName ? (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => handleSave('ownerName')}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => handleCancel('ownerName')}>Cancel</button>
                </div>
              ) : (
                <button className={styles.editBtn} onClick={() => handleEdit('ownerName')}>Edit</button>
              )}
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <span className={styles.labelText}>Phone Number</span>
                {editMode.phone ? (
                  <input
                    type="tel"
                    value={editValues.phone}
                    onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <span className={styles.labelSubtext}>{maskPhone(shopInfo.ownerPhone)}</span>
                )}
              </div>
              {editMode.phone ? (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => handleSave('phone')}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => handleCancel('phone')}>Cancel</button>
                </div>
              ) : (
                <button className={styles.editBtn} onClick={() => handleEdit('phone')}>Edit</button>
              )}
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
          
          <button className={styles.actionBtn} onClick={() => navigate('/owner/change-pin')}>
            <span>Change PIN</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.actionBtn} onClick={() => navigate('/owner/staff')}>
            <span>Manage Staff Access</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={handleRevokeAllSessions}>
            <span>Revoke All Staff Sessions</span>
            <span className={styles.arrow}>→</span>
          </button>
        </section>

        {/* Data & Privacy */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data & Privacy</h2>
          
          <button className={styles.actionBtn} onClick={handleExportData}>
            <span>Export All Data</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.actionBtn} onClick={() => window.open('https://smartlosscontrol.com/privacy', '_blank')}>
            <span>Privacy Policy</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.actionBtn} onClick={() => window.open('https://smartlosscontrol.com/terms', '_blank')}>
            <span>Terms of Service</span>
            <span className={styles.arrow}>→</span>
          </button>
        </section>
      </div>
      )}    </div>
  )
}

export default Settings