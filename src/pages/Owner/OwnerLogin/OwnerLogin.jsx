import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../services'
import styles from './OwnerLogin.module.css'

function OwnerLogin() {
  const navigate = useNavigate()

  const [shopName, setShopName] = useState(() => localStorage.getItem('shopName') || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
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

    const pinString = pin.join('')
    if (pinString.length !== 4) { setError('Please enter your 4-digit PIN'); return }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.ownerLoginWithPin(phoneNumber.trim(), pinString)

      if (response.token) {
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('userData', JSON.stringify(response.user))
        localStorage.setItem('shopId', response.user?.shop_id)
        localStorage.setItem('fullName', response.user?.full_name)
        localStorage.setItem('shopName', response.user?.shop_name)
      }

      navigate('/owner/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid phone number or PIN')
    } finally {
      setLoading(false)
    }
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
          <p style={{ color: '#666' }}>
            Forget Pin? <a href="/owner/createnewpin" style={{ color: '#667eea' }}>Click here</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OwnerLogin