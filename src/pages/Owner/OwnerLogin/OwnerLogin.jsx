import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerLogin.module.css'

function OwnerLogin() {
  const navigate = useNavigate()

  const [shopName, setShopName] = useState(() => localStorage.getItem('shopName') || '')
  const [pin, setPin] = useState(['', '', '', ''])
  const [storedPin, setStoredPin] = useState(() => localStorage.getItem('ownerPin') || '')
  const [error, setError] = useState('')

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

    if (!storedPin) {
      setError('No PIN found. Please create a PIN first.')
      return
    }

    if (pinString !== storedPin) {
      setError('Invalid shop name or PIN')
      return
    }

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