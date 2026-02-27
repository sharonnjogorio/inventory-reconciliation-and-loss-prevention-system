import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../services'
import styles from './OwnerLogin.module.css'

function OwnerLogin() {
  const navigate = useNavigate()

  const [shopName, setShopName] = useState(() => localStorage.getItem('shopName') || '')
  const [phoneNumber, setPhoneNumber] = useState('')   // ✅ was missing
  const [pin, setPin] = useState(['', '', '', ''])
  const [storedPin, setStoredPin] = useState(() => localStorage.getItem('ownerPin') || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePinChange = useCallback((index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')
    if (value && index < 3) {
      const next = document.getElementById(`owner-pin-${index + 1}`)
      if (next) next.focus()
    }
  }, [pin])

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !e.target.value) {
      const prevIndex = index - 1
      if (prevIndex >= 0) {
        const prev = document.getElementById(`owner-pin-${prevIndex}`)
        if (prev) prev.focus()
      }
    }
  }, [])

  const handleLogin = async () => {
    if (!phoneNumber.trim()) { setError('Please enter your phone number'); return }
    if (!phoneNumber.startsWith('+')) { setError('Phone number must include country code (e.g., +254...)'); return }
    if (!storedPin) { setError('No PIN found. Please create a PIN first.'); return }

    setLoading(true)
    setError('')
    navigate('/owner/dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Owner Login</h1>
        <p className={styles.subtitle}>Enter your credentials</p>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label>PHONE NUMBER</label>
          <input
            type="tel"
            placeholder="+254 712 345 678"
            value={phoneNumber}
            onChange={(e) => { setPhoneNumber(e.target.value); setError('') }}
            className={styles.input}
          />
          <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
            Include country code (e.g., +254 for Kenya)
          </span>
        </div>

        <div className={styles.inputGroup}>
          <label>4-DIGIT PIN</label>
          <div className={styles.pinInputs}>
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`owner-pin-${index}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={styles.pinBox}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <button className={styles.loginBtn} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Don't have an account? <a href="/owner/register" style={{ color: '#667eea' }}>Register here</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OwnerLogin