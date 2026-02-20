import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import db from '../../../../services/db'
import styles from './DeviceLinked.module.css'

/**
 * Device Linked Successfully Screen
 * 
 * Shows after successful QR scan
 * Staff enters their name and creates their 4-digit PIN
 */

function DeviceLinked() {
  const navigate = useNavigate()
  const [staffName, setStaffName] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [focused, setFocused] = useState(0)
  const [error, setError] = useState('')

  const handlePinInput = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value

    setPin(newPin)

    // Auto-focus next input
    if (value && index < 3) {
      setFocused(index + 1)
    }
  }

  const handleGeneratePin = async () => {
    const pinString = pin.join('')

    // Validation
    if (!staffName.trim()) {
      setError('Please enter your name')
      return
    }

    if (pinString.length !== 4) {
      setError('Please enter a 4-digit PIN')
      return
    }

    try {
      // Save staff with name and PIN to IndexedDB
      await db.staff.add({
        id: 'staff_' + Date.now(),
        name: staffName.trim(),
        pin: pinString, // In production: hash this with bcrypt
        device_id: generateDeviceId(),
        shop_id: 'shop_001',
        session_token: generateToken(),
        linked_at: new Date().toISOString()
      })

      // Success - go to regular PIN login
      navigate('/staff/pin')
    } catch (err) {
      console.error('Error saving PIN:', err)
      setError('Failed to save PIN. Please try again.')
    }
  }

  const generateDeviceId = () => {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const generateToken = () => {
    return 'token_' + Math.random().toString(36).substr(2, 15)
  }

  const deviceId = generateDeviceId()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          {/* Success Icon */}
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
              <path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Success Message */}
          <h2 className={styles.title}>Device Linked Successfully</h2>
          <p className={styles.subtitle}>Now set up your access credentials</p>

          {/* Name Input */}
          <div className={styles.inputSection}>
            <label className={styles.label}>Your Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className={styles.nameInput}
              autoFocus
            />
          </div>

          {/* PIN Input Boxes */}
          <div className={styles.pinSection}>
            <p className={styles.label}>Create Your PIN</p>
            <div className={styles.pinBoxes}>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinInput(index, e.target.value)}
                  onFocus={() => setFocused(index)}
                  className={styles.pinBox}
                />
              ))}
            </div>
          </div>

          {/* Device Info */}
          <div className={styles.infoBox}>
            <p className={styles.infoTitle}>Welcome to:</p>
            <p className={styles.infoShop}>Amina's Shop (Main Branch)</p>
            <p className={styles.infoDevice}>Device ID: {deviceId.slice(0, 20)}...</p>
            <p className={styles.infoNote}>• You can't transfer this PIN to another phone</p>
          </div>

          {/* Error */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Generate Button */}
          <button 
            className={styles.generateButton}
            onClick={handleGeneratePin}
            disabled={!staffName.trim() || pin.join('').length !== 4}
          >
            Generate PIN
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeviceLinked