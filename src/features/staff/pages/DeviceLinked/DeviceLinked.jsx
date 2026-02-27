import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../../../services'
import db from '../../../../services/db'
import styles from './DeviceLinked.module.css'

const generateDeviceId = () => {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function DeviceLinked() {
  const navigate = useNavigate()
  const location = useLocation()
  const qrToken = location.state?.qrToken || ''

  const [loading, setLoading] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
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

  const handleConfirmPinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newConfirmPin = [...confirmPin]
      newConfirmPin[index] = value
      setConfirmPin(newConfirmPin)
      if (value && index < 3) {
        document.getElementById(`confirm-pin-${index + 1}`)?.focus()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const pinString = pin.join('')
      const confirmPinString = confirmPin.join('')

      if (!staffName.trim()) { setError('Please enter your name'); setLoading(false); return }
      if (!phone.trim()) { setError('Please enter your phone number'); setLoading(false); return }
      if (pinString.length !== 4) { setError('Please enter a 4-digit PIN'); setLoading(false); return }
      if (confirmPinString.length !== 4) { setError('Please confirm your PIN'); setLoading(false); return }
      if (pinString !== confirmPinString) { setError('PINs do not match. Please try again.'); setLoading(false); return }
      if (!qrToken) { setError('QR token missing. Please scan QR code again.'); setLoading(false); return }

      const deviceId = generateDeviceId()

      // Make the actual API call to link the device
      const response = await authAPI.linkStaff({
        qr_token: qrToken,
        staff_name: staffName.trim(),
        phone: phone.trim(),
        pin: pinString,
        device_id: deviceId
      })

      const staffId = response.staff?.id

      const staffData = {
        id: staffId,
        name: staffName.trim(),
        pin: pinString,
        device_id: response.staff.device_id,
        shop_id: response.staff.shop_id,
        session_token: response.token,
        linked_at: new Date().toISOString()
      }

      await db.staff.add(staffData)

      localStorage.setItem('deviceLinked', 'true')
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.staff))
      localStorage.setItem('staffData', JSON.stringify({
        id: response.staff.id,
        name: response.staff.full_name,
        phone: response.staff.phone,
        deviceId: response.staff.device_id,
        linkedAt: new Date().toISOString()
      }))

      console.log('✅ Device linked and logged in:', staffName.trim())
      navigate('/staff/pin')

    } catch (err) {
      console.error('❌ Failed to link device:', err)
      setError(err.response?.data?.message || 'Failed to link device. Please try again.')
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
              <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="e.g., John Doe" className={styles.nameInput} required />
            </div>

            <div className={styles.inputSection}>
              <label className={styles.label}>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +251912345678" className={styles.nameInput} required />
            </div>

            <div className={styles.pinSection}>
              <label className={styles.label}>Set Your 4-Digit PIN</label>
              <div className={styles.pinBoxes}>
                {pin.map((digit, index) => (
                  <input key={index} id={`pin-${index}`} type="password" inputMode="numeric" maxLength="1" value={digit} onChange={(e) => handlePinChange(index, e.target.value)} className={styles.pinBox} />
                ))}
              </div>
            </div>

            <div className={styles.pinSection}>
              <label className={styles.label}>Confirm Your PIN</label>
              <div className={styles.pinBoxes}>
                {confirmPin.map((digit, index) => (
                  <input key={index} id={`confirm-pin-${index}`} type="password" inputMode="numeric" maxLength="1" value={digit} onChange={(e) => handleConfirmPinChange(index, e.target.value)} className={styles.pinBox} />
                ))}
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.generateButton} disabled={loading}>
              {loading ? 'Setting Up...' : 'Complete Setup & Start Working'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DeviceLinked