import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../../../services'
import useAuthStore from '../../../../store/useAuthStore'
import db from '../../../../services/db'
import styles from './StaffPIN.module.css'
import keypadStyles from '../../components/PINKeypad/PINKeypad.module.css'

function StaffPIN() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginStaff } = useAuthStore()
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [pin, setPin] = useState('')

  // Get phone and staff name from navigation state
  const phone = location.state?.phone || ''
  const staffName = location.state?.staffName || ''

  // Redirect if no phone provided
  if (!phone || !staffName) {
    navigate('/staff/phone')
    return null
  }

  const handleDigitPress = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = () => {
    if (pin.length === 4) {
      handlePINComplete(pin)
    }
  }

  const handlePINComplete = async (enteredPIN) => {
    setIsValidating(true)
    setError('')

    try {
      console.log('📤 Staff login:', { phone, pin: '****' })

      // Call backend API to login with phone + PIN
      const response = await authAPI.staffLogin(phone, enteredPIN)
      
      console.log('✅ Staff login successful:', response)

      // Save session to IndexedDB
      await db.sessions.add({
        staff_id: response.user.id,
        staff_name: response.user.name,
        phone: response.user.phone,
        login_time: new Date().toISOString()
      })

      // Update auth store
      loginStaff(
        {
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
          shopId: response.user.shop_id
        },
        response.token
      )

      // Save to localStorage
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      localStorage.setItem('staffData', JSON.stringify({
        id: response.user.id,
        name: response.user.name,
        phone: response.user.phone
      }))

      // Navigate to sales dashboard
      navigate('/staff/sales')
    } catch (err) {
      console.error('❌ Staff login failed:', err)
      setError(err.response?.data?.message || 'Incorrect PIN. Try again.')
      setPin('')
      setIsValidating(false)
    }
  }

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['delete', '0', 'submit']
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/staff/phone')}>
          ← Back
        </button>
        <h1 className={styles.title}>Staff Login</h1>
        <p className={styles.subtitle}>Enter your PIN</p>
      </div>

      <div className={styles.keypadWrapper}>
        <div className={keypadStyles.keypadContainer}>
          
          <div className={keypadStyles.userIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h2 className={keypadStyles.welcome}>Welcome, {staffName}</h2>
          <p className={keypadStyles.instruction}>{phone}</p>

          <div className={keypadStyles.pinDots}>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`${keypadStyles.dot} ${index < pin.length ? keypadStyles.filled : ''}`}
              />
            ))}
          </div>

          {error && <p className={keypadStyles.error}>{error}</p>}

          <div className={keypadStyles.keypad}>
            {keypadButtons.map((row, rowIndex) => (
              <div key={rowIndex} className={keypadStyles.keypadRow}>
                {row.map((key) => {
                  if (key === 'delete') {
                    return (
                      <button
                        key={key}
                        className={`${keypadStyles.key} ${keypadStyles.keyDelete}`}
                        onClick={handleDelete}
                        disabled={pin.length === 0}
                      >
                        ←
                      </button>
                    )
                  }
                  
                  if (key === 'submit') {
                    return (
                      <button
                        key={key}
                        className={`${keypadStyles.key} ${keypadStyles.keySubmit}`}
                        onClick={handleSubmit}
                        disabled={pin.length < 4}
                      >
                        ✓
                      </button>
                    )
                  }

                  return (
                    <button
                      key={key}
                      className={keypadStyles.key}
                      onClick={() => handleDigitPress(key)}
                    >
                      {key}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <p className={keypadStyles.forgotPin}>
            Forgot PIN? <span className={keypadStyles.link}>Contact your shop owner</span>
          </p>
        </div>
      </div>

      {isValidating && (
        <div className={styles.validating}>
          <span className={styles.spinner}></span>
          <p>Validating...</p>
        </div>
      )}
    </div>
  )
}

export default StaffPIN