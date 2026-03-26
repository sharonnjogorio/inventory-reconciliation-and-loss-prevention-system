import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../../services'
import styles from './CreateNewPin.module.css'

function CreateNewPin() {
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [shopName, setShopName] = useState('')

  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])

  const [step, setStep] = useState('verify') // verify → create
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle PIN inputs
  const handlePinChange = useCallback(
    (e, type, index) => {
      const digit = e.target.value.replace(/\D/g, '').slice(-1)

      if (type === 'pin') {
        const updated = [...pin]
        updated[index] = digit
        setPin(updated)
      } else {
        const updated = [...confirmPin]
        updated[index] = digit
        setConfirmPin(updated)
      }

      if (digit && index < 3) {
        const next = document.querySelector(
          `input[data-type="${type}"][data-index="${index + 1}"]`
        )
        if (next) next.focus()
      }
    },
    [pin, confirmPin]
  )

  const handleBackspace = useCallback((e, type, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prev = document.querySelector(
        `input[data-type="${type}"][data-index="${index - 1}"]`
      )
      if (prev) prev.focus()
    }
  }, [])

  // Step 1 — Verify phone number
  const handleVerifyPhone = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    if (!phone.startsWith('+')) {
      setError('Phone number must include country code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await authAPI.verifyOwnerPhone(phone)

      if (!res.exists) {
        setError('No owner found with that phone number.')
        return
      }

      // Sync backend owner details
      setOwnerName(res.full_name)
      setShopName(res.shop_name)

      // Save to local storage for safety
      localStorage.setItem('ownerPhone', phone)
      localStorage.setItem('ownerFullName', res.full_name)
      localStorage.setItem('ownerShopName', res.shop_name)

      setStep('create')
    } catch (err) {
      setError('Failed to verify phone. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — Create New PIN
  const handleSaveNewPin = async () => {
    const pinValue = pin.join('')
    const confirmValue = confirmPin.join('')

    if (pinValue.length !== 4 || confirmValue.length !== 4) {
      setError('Enter a full 4-digit PIN in both fields.')
      return
    }
    if (pinValue !== confirmValue) {
      setError('PINs do not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.resetOwnerPin(phone, pinValue)

      // Save updated user info
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      localStorage.setItem('shopId', response.user.shop_id)

      navigate('/owner/dashboard') // Auto-login
    } catch (err) {
      setError('Failed to save PIN. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset Your PIN</h2>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* STEP 1: Verify Phone */}
        {step === 'verify' && (
          <>
            <label className={styles.label}>Registered Phone Number</label>
            <input
              type="tel"
              placeholder="+254 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
            <button
              className={styles.submitButton}
              disabled={loading}
              onClick={handleVerifyPhone}
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </>
        )}

        {/* STEP 2: Create New PIN */}
        {step === 'create' && (
          <div>
            <div className={styles.infoBox}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Owner:</span>
                <span className={styles.infoValue}>{ownerName}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Shop:</span>
                <span className={styles.infoValue}>{shopName}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone:</span>
                <span className={styles.infoValue}>{phone}</span>
              </div>
            </div>

            <p className={styles.subtitle}>Enter a new 4-digit PIN.</p>

            {/* New PIN */}
            <div className={styles.section}>
              <label className={styles.label}>New PIN</label>
              <div className={styles.pinRow}>
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    type="password"
                    maxLength={1}
                    className={styles.pinInput}
                    value={digit}
                    data-type="pin"
                    data-index={idx}
                    onChange={(e) => handlePinChange(e, 'pin', idx)}
                    onKeyDown={(e) => handleBackspace(e, 'pin', idx)}
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
                    maxLength={1}
                    className={styles.pinInput}
                    value={digit}
                    data-type="confirm"
                    data-index={idx}
                    onChange={(e) => handlePinChange(e, 'confirm', idx)}
                    onKeyDown={(e) => handleBackspace(e, 'confirm', idx)}
                  />
                ))}
              </div>
            </div>

            <button
              className={styles.submitButton}
              disabled={loading}
              onClick={handleSaveNewPin}
            >
              {loading ? 'Saving PIN...' : 'Save New PIN'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default CreateNewPin
