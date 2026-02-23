import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../../store/useAuthStore'
import db from '../../../../services/db'
import styles from './StaffPIN.module.css'
import keypadStyles from '../../components/PINKeypad/PINKeypad.module.css'

function StaffPIN() {
  const navigate = useNavigate()
  const { loginStaff } = useAuthStore()
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [staffName, setStaffName] = useState('Chinedu')
  const [pin, setPin] = useState('')

  useEffect(() => {
    const loadStaffName = async () => {
      const staff = await db.staff.toCollection().first()
      if (staff) {
        setStaffName(staff.name)
      }
    }
    loadStaffName()
  }, [])

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
      setPin('')
    }
  }

  const handlePINComplete = async (enteredPIN) => {
    setIsValidating(true)
    setError('')

    try {
      const staff = await db.staff.toCollection().first()

      if (!staff) {
        setError('Device not linked. Please scan QR code.')
        setIsValidating(false)
        return
      }

      const isValid = enteredPIN === staff.pin

      if (isValid) {
        await db.sessions.add({
          staff_id: staff.id,
          staff_name: staff.name,
          login_time: new Date().toISOString(),
          device_id: staff.device_id
        })

        loginStaff(
          {
            id: staff.id,
            name: staff.name,
            shopId: staff.shop_id
          },
          staff.session_token
        )

        navigate('/staff/sales')
      } else {
        setError('Incorrect PIN. Try again.')
        setIsValidating(false)
      }
    } catch (err) {
      console.error('PIN validation error:', err)
      setError('Something went wrong. Please try again.')
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
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.title}>Staff</h1>
        <p className={styles.subtitle}>Control who has access to your shop system</p>
      </div>

      <div className={styles.keypadWrapper}>
        <div className={keypadStyles.keypadContainer}>
          
          <div className={keypadStyles.userIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <p className={keypadStyles.instruction}>Click here to continue</p>
          <h2 className={keypadStyles.welcome}>Welcome, {staffName}</h2>

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