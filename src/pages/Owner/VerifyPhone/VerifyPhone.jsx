import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../../../services'
import styles from './VerifyPhone.module.css'

function VerifyPhone() {
  const location = useLocation()
  const navigate = useNavigate()
  const { phoneNumber, devOtp } = location.state || {}

  const [otp, setOtp] = useState(['', '', '', ''])
  const [timer, setTimer] = useState(120)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ Derived value — no useEffect needed
  const expired = timer === 0

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (devOtp) {
      const otpArray = devOtp.split('')
      setOtp(otpArray)
      console.log('🔧 Dev OTP auto-filled:', devOtp)
    }
  }, [devOtp])

  useEffect(() => {
    if (timer > 0 && !verified) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(countdown)
    }
  }, [timer, verified])

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      setError('')

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus()
      }

      if (index === 3 && value) {
        const otpString = [...newOtp.slice(0, 3), value].join('')
        handleVerify(otpString)
      }
    }
  }

  const handleVerify = async (otpString) => {
    if (!phoneNumber) {
      setError('Phone number missing. Please register again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📤 Verifying OTP:', { phoneNumber, otp: otpString })
      
      const response = await authAPI.verifyOTP(phoneNumber, otpString)
      
      console.log('✅ OTP verified:', response)
      setVerified(true)
      
      // Navigate to Create PIN page after successful verification
      setTimeout(() => {
        navigate('/owner/createpin', {
          state: {
            phoneNumber,
            fullName: localStorage.getItem('fullName'),
            shopName: localStorage.getItem('shopName')
          }
        })
      }, 1000)
    } catch (err) {
      console.error('❌ OTP verification failed:', err)
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    // TODO: Call backend to resend OTP
    setTimer(120)
    setOtp(['', '', '', ''])
    setError('')
    console.log('🔄 Resend OTP requested')
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Verify Your Phone</h1>
        <p className={styles.subtitle}>
          Enter the 4-digit code sent to {phoneNumber}
        </p>

        {devOtp && (
          <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
            <strong>🔧 Dev Mode:</strong> OTP is <strong>{devOtp}</strong>
          </div>
        )}

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div className={styles.otpInputs}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className={styles.otpInput}
              disabled={verified || expired || loading}
            />
          ))}
        </div>

        {verified && <p className={styles.success}>✓ Verified! Redirecting...</p>}
        {expired && <p className={styles.expired}>Code expired. Please resend.</p>}
        {loading && <p style={{ color: '#667eea' }}>Verifying...</p>}

        <p className={styles.timer}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </p>

        <p className={styles.resendText}>
          Didn't receive code? <button onClick={handleResend} disabled={loading}>Resend</button>
        </p>

        <p className={styles.helpText}>
          Need help? Contact support
        </p>
      </div>
    </div>
  )
}

export default VerifyPhone