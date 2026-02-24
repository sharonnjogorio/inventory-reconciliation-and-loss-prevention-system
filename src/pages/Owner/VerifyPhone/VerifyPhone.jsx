import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './VerifyPhone.module.css'

function VerifyPhone() {
  const location = useLocation()
  const navigate = useNavigate()
  const { phoneNumber } = location.state || {}

  const [otp, setOtp] = useState(['', '', '', ''])
  const [timer, setTimer] = useState(120)
  const [verified, setVerified] = useState(false)

  // ✅ Derived value — no useEffect needed
  const expired = timer === 0

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

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus()
      }

      if (index === 3 && value) {
        const otpString = [...newOtp.slice(0, 3), value].join('')
        handleVerify(otpString)
      }
    }
  }

  const handleVerify = (otpString) => {
    if (otpString === '1234') {
      setVerified(true)
      setTimeout(() => {
        navigate('/owner/catalog')
      }, 1000)
    } else {
      alert('Invalid OTP. Please try again.')
    }
  }

  const handleResend = () => {
    setTimer(120)
    setOtp(['', '', '', ''])
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Verify Your Phone</h1>
        <p className={styles.subtitle}>
          Enter the 4-digit code sent to {phoneNumber}
        </p>

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
              disabled={verified || expired}
            />
          ))}
        </div>

        {verified && <p className={styles.success}>✓ Verified!</p>}
        {expired && <p className={styles.expired}>Code expired. Please resend.</p>}

        <p className={styles.timer}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </p>

        <p className={styles.resendText}>
          Didn't receive code? <button onClick={handleResend}>Resend</button>
        </p>

        <p className={styles.helpText}>
          Need help? Contact support
        </p>
      </div>
    </div>
  )
}

export default VerifyPhone