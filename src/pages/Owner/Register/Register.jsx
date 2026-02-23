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
    countryCode: 'NG',
    city: ''
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
      const response = await authAPI.registerOwner(formData)
      
      console.log('✅ Registration successful:', response)
      
      navigate('/owner/verify', { 
        state: { 
          phoneNumber: formData.phoneNumber,
          userId: response.user_id,
          shopName: formData.shopName
        } 
      })
      
    } catch (err) {
      console.error('❌ Registration failed:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Register Your Shop</h1>
          <p className={styles.subtitle}>Get started with Smart Loss Control</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Full Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., Amina Yusuf"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Shop Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="e.g., Amina's Store"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Phone Number <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              className={styles.input}
              required
            />
            <span className={styles.hint}>Include country code (e.g., +234 for Nigeria)</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Country</label>
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="NG">🇳🇬 Nigeria</option>
              <option value="KE">🇰🇪 Kenya</option>
              <option value="GH">🇬🇭 Ghana</option>
              <option value="ZA">🇿🇦 South Africa</option>
              <option value="ET">🇪🇹 Ethiopia</option>
              <option value="UG">🇺🇬 Uganda</option>
              <option value="TZ">🇹🇿 Tanzania</option>
              <option value="CM">🇨🇲 Cameroon</option>
              <option value="CI">🇨🇮 Ivory Coast</option>
              <option value="SN">🇸🇳 Senegal</option>
              <option value="RW">🇷🇼 Rwanda</option>
              <option value="ZM">🇿🇲 Zambia</option>
              <option value="ZW">🇿🇼 Zimbabwe</option>
              <option value="BW">🇧🇼 Botswana</option>
              <option value="MW">🇲🇼 Malawi</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Lagos"
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
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
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
        </form>

        <div className={styles.devNote}>
          <strong>Development Mode:</strong> OTP will be <strong>1234</strong>
        </div>
      </div>
    </div>
  )
}

export default Register