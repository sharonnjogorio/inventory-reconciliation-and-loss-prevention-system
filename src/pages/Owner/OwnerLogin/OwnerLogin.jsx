import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './OwnerLogin.module.css'

function OwnerLogin() {
  const navigate = useNavigate()
  const [shopName, setShopName] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])

  const handlePinChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Auto-focus next
    if (value && index < 3) {
      document.getElementById(`owner-pin-${index + 1}`)?.focus()
    }
  }

  const handleLogin = () => {
    const pinString = pin.join('')
    
    if (!shopName.trim()) {
      alert('Please enter your shop name')
      return
    }
    
    if (pinString.length !== 4) {
      alert('Please enter your 4-digit PIN')
      return
    }

    // Validate credentials (add your logic here)
    if (shopName === "Amina's Store" && pinString === '1234') {
      navigate('/owner/dashboard')
    } else {
      alert('Invalid shop name or PIN')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Owner Login</h1>
        <p className={styles.subtitle}>Enter your shop credentials</p>

        {/* Shop Name */}
        <div className={styles.inputGroup}>
          <label>Shop Name</label>
          <input
            type="text"
            placeholder="Enter your shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* PIN */}
        <div className={styles.inputGroup}>
          <label>4-Digit PIN</label>
          <div className={styles.pinInputs}>
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`owner-pin-${index}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
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