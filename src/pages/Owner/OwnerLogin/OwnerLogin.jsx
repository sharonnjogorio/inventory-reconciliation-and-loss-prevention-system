import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerLogin.module.css'

function OwnerLogin() {
  const navigate = useNavigate()

  const [shopName, setShopName] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [storedPin, setStoredPin] = useState('')
  const [error, setError] = useState('')

  // Load stored values from localStorage (set by Create PIN page)
  useEffect(() => {
    const savedPin = localStorage.getItem('ownerPin')
    const savedShopName = localStorage.getItem('shopName')

    if (savedShopName) {
      setShopName(savedShopName)
    }
    if (savedPin) {
      setStoredPin(savedPin)
    }
  }, [])

  const handlePinChange = useCallback((index, value) => {
    // digits only, allow empty
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')

    // auto-focus next box
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

  const handleLogin = () => {
    const pinString = pin.join('')

    if (!shopName.trim()) {
      setError('Please enter your shop name')
      return
    }

    if (pinString.length !== 4) {
      setError('Please enter your 4-digit PIN')
      return
    }

    // Compare with stored PIN (set during Create PIN)
    if (!storedPin) {
      setError('No PIN found. Please create a PIN first.')
      return
    }

    if (pinString !== storedPin) {
      setError('Invalid shop name or PIN')
      return
    }

    // At this point credentials are valid (locally)
    // Next step in a real app: call backend /auth/login-pin with shopName + pinString
    navigate('/owner/dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Owner Login</h1>
        <p className={styles.subtitle}>Enter your shop credentials</p>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Shop Name */}
        <div className={styles.inputGroup}>
          <label>SHOP NAME</label>
          <input
            type="text"
            placeholder="Enter your shop name"
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value)
              setError('')
            }}
            className={styles.input}
          />
        </div>

        {/* PIN */}
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
              />
            ))}
          </div>
        </div>

        <button 
          className={styles.loginBtn}
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default OwnerLogin
