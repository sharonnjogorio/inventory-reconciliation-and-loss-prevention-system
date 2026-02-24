// src/pages/Owner/CreatePin/OwnerCreatePin.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './CreatePin.module.css'

function OwnerCreatePin() {
  const navigate = useNavigate()
  const location = useLocation()

  // You might receive phone / shopName from previous OTP page
  const { fullName, phoneNumber, shopName } = location.state || {}

  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [activeField, setActiveField] = useState({ type: 'pin', index: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Autofocus first input on mount
  useEffect(() => {
    const firstInput = document.querySelector('input[data-type="pin"][data-index="0"]')
    if (firstInput) firstInput.focus()
  }, [])

  // Generic handler for PIN & Confirm PIN inputs
  const handleChange = useCallback((e, type, index) => {
    const value = e.target.value.replace(/\D/g, '') // keep digits only
    if (!value) {
      // cleared
      if (type === 'pin') {
        const newPin = [...pin]
        newPin[index] = ''
        setPin(newPin)
      } else {
        const newConfirm = [...confirmPin]
        newConfirm[index] = ''
        setConfirmPin(newConfirm)
      }
      setError('')
      return
    }

    // Only one digit per box
    const digit = value[value.length - 1]

    if (type === 'pin') {
      const newPin = [...pin]
      newPin[index] = digit
      setPin(newPin)
    } else {
      const newConfirm = [...confirmPin]
      newConfirm[index] = digit
      setConfirmPin(newConfirm)
    }

    setError('')

    // Auto-move to next input
    const nextIndex = index + 1
    if (nextIndex < 4) {
      const nextInput = document.querySelector(
        `input[data-type="${type}"][data-index="${nextIndex}"]`
      )
      if (nextInput) nextInput.focus()
      setActiveField({ type, index: nextIndex })
    }
  }, [pin, confirmPin])

  const handleKeyDown = useCallback((e, type, index) => {
    if (e.key === 'Backspace' && !e.target.value) {
      const prevIndex = index - 1
      if (prevIndex >= 0) {
        const prevInput = document.querySelector(
          `input[data-type="${type}"][data-index="${prevIndex}"]`
        )
        if (prevInput) prevInput.focus()
        setActiveField({ type, index: prevIndex })
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const pinValue = pin.join('')
    const confirmValue = confirmPin.join('')

    if (pinValue.length !== 4 || confirmValue.length !== 4) {
      setError('Please enter a 4-digit PIN in both fields.')
      return
    }

    if (pinValue !== confirmValue) {
      setError('PIN and Confirm PIN do not match.')
      return
    }

    setLoading(true)

    try {
      // In this phase, we store PIN locally to be reused on /owner/login
      // In production, you would also call backend to save PIN securely.
      localStorage.setItem('ownerPin', pinValue)

      if (phoneNumber) {
        localStorage.setItem('phoneNumber', phoneNumber)
      }
      if (shopName) {
        localStorage.setItem('shopName', shopName)
      }
      if (fullName) {
        localStorage.setItem('fullName', fullName)
      }
      // Redirect to owner login page
      navigate('/owner/login')
    } catch (err) {
      console.error('Error saving PIN:', err)
      setError('Failed to save PIN. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create 4-Digit PIN</h2>
        <p className={styles.subtitle}>
          Set a secure PIN you&apos;ll use to log in as the shop owner.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* PIN */}
          <div className={styles.section}>
            <label className={styles.label}>4-Digit PIN</label>
            <div className={styles.pinRow}>
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.pinInput}
                  value={digit}
                  data-type="pin"
                  data-index={idx}
                  onChange={(e) => handleChange(e, 'pin', idx)}
                  onKeyDown={(e) => handleKeyDown(e, 'pin', idx)}
                />
              ))}
            </div>
          </div>

          {/* Confirm PIN */}
          <div className={styles.section}>
            <label className={styles.label}>Confirm PIN</label>
            <div className={styles.pinRow}>
              {confirmPin.map((digit, idx) => (
                <input
                  key={idx}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.pinInput}
                  value={digit}
                  data-type="confirm"
                  data-index={idx}
                  onChange={(e) => handleChange(e, 'confirm', idx)}
                  onKeyDown={(e) => handleKeyDown(e, 'confirm', idx)}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Saving PIN...' : 'Save PIN & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OwnerCreatePin
