import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../services'
import styles from './RegisterPage.module.css'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    shopName: '',
    phoneNumber: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.fullName || !formData.shopName || !formData.phoneNumber) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!formData.phoneNumber.startsWith('+')) {
      setError('Phone number must include country code (e.g., +234...)')
      setLoading(false)
      return
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        shopName: formData.shopName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      }

      console.log('📤 Registration payload (to authAPI):', payload)

      const response = await authAPI.registerOwner(payload)
      console.log('✅ Registration successful:', response)
      console.log('🔐 Dev OTP:', response.dev_otp || '1234')

      localStorage.setItem('phoneNumber', formData.phoneNumber)
      localStorage.setItem('shopName', formData.shopName)
      localStorage.setItem('fullName', formData.fullName)
      if (response.dev_otp) {
        localStorage.setItem('devOtp', response.dev_otp)
      }

      navigate('/owner/verify', {
        state: {
          phoneNumber: formData.phoneNumber,
          shopName: formData.shopName,
          devOtp: response.dev_otp || null,
        }
      })

    } catch (err) {
      console.error('❌ Registration failed:', err)
      console.error('Error details:', err.response?.data)
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.overlay}>
          <h1>Smart Loss Control</h1>
          <h2>Stop Revenue Leaks</h2>
          <p>Track every drop, save every naira</p>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.innerBox}>
          <div className={styles.logo}>
            <h2>Register Your Shop</h2>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.subTitle}>Get started with Smart Loss Control</p>

            {error && (
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label>
                Your Full Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g., Amina Yusuf"
                required
              />
            </div>

            <div>
              <label>
                Shop Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="e.g., Amina's Store"
                required
              />
            </div>

            <div>
              <label>
                Phone Number <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                required
              />
              <span className={styles.hint}>
                Include country code (e.g., +234 for Nigeria, +254 for Kenya)
              </span>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner}></span>
                  Sending OTP...
                </span>
              ) : (
                'Register My Shop'
              )}
            </button>

            <div className={styles.footer}>
              <p>Already have an account? <a href="/owner/login">Login here</a></p>
            </div>
          </form>

          <div className={styles.devNote}>
            <strong>🔧 Development Mode</strong><br/>
            OTP will be <strong>1234</strong> (also visible in browser console)
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register