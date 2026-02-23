import { useState } from 'react'
import styles from './PINKeypad.module.css'



function PINKeypad({ onPINComplete, error, maxDigits = 4 }) {
  const [pin, setPin] = useState('')

  const handleDigitPress = (digit) => {
    if (pin.length < maxDigits) {
      const newPin = pin + digit
      setPin(newPin)
      
      
      if (newPin.length === maxDigits) {
        setTimeout(() => {
          onPINComplete(newPin)
          setPin('') 
        }, 400)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = () => {
    if (pin.length === maxDigits) {
      onPINComplete(pin)
      setPin('')
    }
  }

  
  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['delete', '0', 'submit']
  ]

  return (
    <div className={styles.keypadContainer}>
      
      {/* PIN Dots Display */}
      <div className={styles.pinDots}>
        {[...Array(maxDigits)].map((_, index) => (
          <div
            key={index}
            className={`${styles.dot} ${index < pin.length ? styles.filled : ''}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className={styles.error}>{error}</p>
      )}

      {/* Keypad Grid */}
      <div className={styles.keypad}>
        {keypadButtons.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.keypadRow}>
            {row.map((key) => {
              if (key === 'delete') {
                return (
                  <button
                    key={key}
                    className={`${styles.key} ${styles.keyDelete}`}
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
                    className={`${styles.key} ${styles.keySubmit}`}
                    onClick={handleSubmit}
                    disabled={pin.length < maxDigits}
                  >
                    ✓
                  </button>
                )
              }

              return (
                <button
                  key={key}
                  className={styles.key}
                  onClick={() => handleDigitPress(key)}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className={styles.hint}>Enter your 4-digit PIN</p>
    </div>
  )
}

export default PINKeypad
