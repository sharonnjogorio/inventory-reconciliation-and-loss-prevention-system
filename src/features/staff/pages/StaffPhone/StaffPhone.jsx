import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../../../services'
import styles from './StaffPhone.module.css'

function StaffPhone() {
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (!phone.trim()) {
        setError('Please enter your phone number')
        setLoading(false)
        return
      }

      console.log('📤 Getting staff by phone:', phone.trim())

      // Call backend to get staff name
      const response = await authAPI.getStaffByPhone(phone.trim())
      
      console.log('✅ Staff found:', response)

      // Navigate to PIN page with staff info
      navigate('/staff/pin', {
        state: {
          phone: phone.trim(),
          staffName: response.staff.name
        }
      })
    } catch (err) {
      console.error('❌ Failed to find staff:', err)
      setError(err.response?.data?.message || 'Phone number not found. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          {successMessage && (
            <div className={styles.successMessage}>
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.inputSection}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251912345678"
                className={styles.phoneInput}
                required
                autoFocus
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.continueButton}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StaffPhone
