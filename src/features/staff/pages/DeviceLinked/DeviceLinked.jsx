import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import db from '../../../../services/db'
import styles from './DeviceLinked.module.css'

const generateDeviceId = () => {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const generateToken = () => {
  return 'token_' + Math.random().toString(36).substr(2, 15)
}

function DeviceLinked() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')

  const handlePinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)

      if (value && index < 3) {
        document.getElementById(`pin-${index + 1}`)?.focus()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const pinString = pin.join('')

      if (!staffName.trim()) {
        setError('Please enter your name')
        setLoading(false)
        return
      }

      if (pinString.length !== 4) {
        setError('Please enter a 4-digit PIN')
        setLoading(false)
        return
      }

      const deviceId = generateDeviceId()
      const token = generateToken()
      const staffId = 'staff_' + Date.now()

      const staffData = {
        id: staffId,
        name: staffName.trim(),
        pin: pinString,
        device_id: deviceId,
        token: token,
        linked_at: new Date().toISOString()
      }

      await db.staff.add(staffData)

      localStorage.setItem('deviceLinked', 'true')
      localStorage.setItem('staffData', JSON.stringify({
        id: staffId,
        name: staffName.trim(),
        deviceId: deviceId,
        linkedAt: new Date().toISOString()
      }))

      console.log('✅ Device linked and logged in:', staffName.trim())

      navigate('/staff/pin')
      
    } catch (err) {
      console.error('Failed to link device:', err)
      setError('Failed to link device. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#4CAF50" fillOpacity="0.1"/>
              <circle cx="32" cy="32" r="24" fill="#4CAF50" fillOpacity="0.2"/>
              <path d="M20 32L28 40L44 24" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className={styles.title}>Device Linked!</h1>
          <p className={styles.subtitle}>Set up your staff credentials</p>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputSection}>
              <label className={styles.label}>Your Name</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g., John Doe"
                className={styles.nameInput}
                required
              />
            </div>

            <div className={styles.pinSection}>
              <label className={styles.label}>Set Your 4-Digit PIN</label>
              <div className={styles.pinBoxes}>
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    className={styles.pinBox}
                  />
                ))}
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.generateButton}
              disabled={loading}
            >
              {loading ? 'Setting Up...' : 'Complete Setup & Start Working'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DeviceLinked