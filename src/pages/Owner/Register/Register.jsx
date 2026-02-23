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

    // Validation
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
        name: formData.fullName.trim(),
        shop_name: formData.shopName.trim(),
        phone_number: formData.phoneNumber.trim(),
        country: formData.countryCode.toUpperCase(),
        city: formData.city.trim()
      }

      console.log('📤 Registration payload:', payload)

      const response = await authAPI.registerOwner(payload)
      
      console.log('✅ Registration successful:', response)
      
      // Store phone for OTP page
      localStorage.setItem('phoneNumber', formData.phoneNumber)
      localStorage.setItem('shopName', formData.shopName)
      
      navigate('/owner/verify', { 
        state: { 
          phoneNumber: formData.phoneNumber,
          userId: response.user_id,
          shopName: formData.shopName
        } 
      })
      
    } catch (err) {
      console.error('❌ Registration failed:', err)
      console.error('Error details:', err.response?.data)
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Left Pane - Branding */}
      <div className={styles.leftPane}>
        <div className={styles.overlay}>
          <h1>Smart Loss Control</h1>
          <h2>Stop Revenue Leaks</h2>
          <p>Track every drop, save every naira</p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className={styles.rightPane}>
        <div className={styles.innerBox}>
          <div className={styles.logo}>
            {/* Add your logo here if you have one */}
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

            {/* Full Name */}
            <div>
              <label>
                Full Name <span className={styles.required}>*</span>
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

            {/* Shop Name */}
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

            {/* Phone Number */}
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
                Include country code (e.g., +234 for Nigeria)
              </span>
            </div>

            {/* Country */}
            <div>
              <label>Country</label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '0.6rem 0.75rem', 
                  borderRadius: '8px', 
                  border: '0.89px solid #E6EAED', 
                  marginTop: '0.4rem',
                  fontSize: '0.9rem'
                }}
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

            {/* City */}
            <div>
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Lagos"
              />
            </div>

            {/* Submit Button */}
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

            {/* Footer */}
            <div className={styles.footer}>
              <p>Already have an account? <a href="/owner/login">Login here</a></p>
            </div>
          </form>

          {/* Dev Note */}
          <div className={styles.devNote}>
            <strong>Development Mode:</strong> OTP will be <strong>1234</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register