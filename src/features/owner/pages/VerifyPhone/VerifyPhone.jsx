import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../../../../services'
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
  const [showToast, setShowToast] = useState(!!devOtp)

  const expired = timer === 0

  useEffect(() => {
    if (timer > 0 && !verified) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(countdown)
    }
  }, [timer, verified])

  // Auto-dismiss toast after 12 seconds
  useEffect(() => {
    if (!devOtp) return
    const t = setTimeout(() => setShowToast(false), 12000)
    return () => clearTimeout(t)
  }, [devOtp])

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

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }, [])

  const handleVerify = async (otpString) => {
    if (!phoneNumber) {
      setError('Phone number missing. Please register again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.verifyOTP(phoneNumber, otpString)
      setVerified(true)

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
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setTimer(120)
    setOtp(['', '', '', ''])
    setError('')
    if (devOtp) setShowToast(true)
  }

  return (
    <div className={styles.container}>

      {devOtp && showToast && (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <span className={styles.toastLabel}>🔧 Dev OTP</span>
            <span className={styles.toastCode}>{devOtp}</span>
          </div>
          <button className={styles.toastClose} onClick={() => setShowToast(false)}>✕</button>
        </div>
      )}

      <div className={styles.card}>
        <h1>Verify Your Phone</h1>
        <p className={styles.subtitle}>
          Enter the 4-digit code sent to <strong>{phoneNumber}</strong>
        </p>

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {verified && (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✓</span>
            <span>Verified! Redirecting...</span>
          </div>
        )}

        <div className={styles.otpInputs}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={styles.otpBox}
              disabled={verified || expired || loading}
            />
          ))}
        </div>

        <p className={styles.timer}>
          {expired
            ? 'Code expired'
            : `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
        </p>

        {loading && <p className={styles.verifyingText}>Verifying...</p>}

        <p className={styles.resendText}>
          Didn't receive the code?{' '}
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={loading || (!expired && timer > 0)}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  )
}

export default VerifyPhone
