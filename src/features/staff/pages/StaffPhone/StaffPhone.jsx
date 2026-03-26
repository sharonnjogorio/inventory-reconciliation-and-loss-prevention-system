import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../../services'
import useAuthStore from '../../../../store/useAuthStore'
import db from '../../../../services/db'
import styles from './StaffPhone.module.css'
import keypadStyles from '../../components/PINKeypad/PINKeypad.module.css'

function StaffPhone() {
  const navigate = useNavigate()
  const { loginStaff } = useAuthStore()

  const [step, setStep] = useState('phone') // 'phone' | 'pin'
  const [phone, setPhone] = useState('')
  const [staffName, setStaffName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Step 1: look up staff by phone ───────────────────────
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    setLoading(true)
    try {
      const response = await authAPI.getStaffByPhone(phone.trim())
      setStaffName(response.staff.name)
      setStep('pin')
    } catch (err) {
      setError(err.response?.data?.message || 'Phone number not found. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: PIN keypad ────────────────────────────────────
  const handleDigitPress = (digit) => {
    if (pin.length < 4) setPin(prev => prev + digit)
  }

  const handleDelete = () => setPin(prev => prev.slice(0, -1))

  const handlePINSubmit = async () => {
    if (pin.length < 4) return
    setLoading(true)
    setError('')
    try {
      const response = await authAPI.staffLogin(phone.trim(), pin)

      await db.sessions.add({
        staff_id: response.user.id,
        staff_name: response.user.name,
        phone: response.user.phone,
        login_time: new Date().toISOString()
      })

      loginStaff(
        {
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone,
          shopId: response.user.shop_id
        },
        response.token
      )

      localStorage.setItem('authToken', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      localStorage.setItem('staffData', JSON.stringify({
        id: response.user.id,
        name: response.user.name,
        phone: response.user.phone
      }))

      navigate('/staff/sales')
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect PIN. Try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['delete', '0', 'submit']
  ]

  // ── Phone step ────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/staff/landing')}>
            ← Back
          </button>
          <h1 className={styles.title}>Staff Login</h1>
          <p className={styles.subtitle}>Enter your phone number</p>
        </div>

        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.userIcon}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            <form onSubmit={handlePhoneSubmit}>
              <div className={styles.inputSection}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError('') }}
                  placeholder="+234 800 000 0000"
                  className={styles.phoneInput}
                  autoFocus
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.continueButton}
                disabled={loading || !phone.trim()}
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── PIN step ──────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => { setStep('phone'); setPin(''); setError('') }}>
          ← Back
        </button>
        <h1 className={styles.title}>Staff Login</h1>
        <p className={styles.subtitle}>Enter your PIN</p>
      </div>

      <div className={styles.content}>
        <div className={keypadStyles.keypadContainer}>
          <div className={keypadStyles.userIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          <h2 className={keypadStyles.welcome}>Welcome, {staffName}</h2>
          <p className={keypadStyles.instruction}>{phone}</p>

          <div className={keypadStyles.pinDots}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${keypadStyles.dot} ${i < pin.length ? keypadStyles.filled : ''}`} />
            ))}
          </div>

          {error && <p className={keypadStyles.error}>{error}</p>}

          <div className={keypadStyles.keypad}>
            {keypadButtons.map((row, rowIndex) => (
              <div key={rowIndex} className={keypadStyles.keypadRow}>
                {row.map((key) => {
                  if (key === 'delete') return (
                    <button
                      key={key}
                      className={`${keypadStyles.key} ${keypadStyles.keyDelete}`}
                      onClick={handleDelete}
                      disabled={pin.length === 0}
                    >←</button>
                  )
                  if (key === 'submit') return (
                    <button
                      key={key}
                      className={`${keypadStyles.key} ${keypadStyles.keySubmit}`}
                      onClick={handlePINSubmit}
                      disabled={pin.length < 4 || loading}
                    >✓</button>
                  )
                  return (
                    <button
                      key={key}
                      className={keypadStyles.key}
                      onClick={() => handleDigitPress(key)}
                    >{key}</button>
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
    </div>
  )
}

export default StaffPhone
