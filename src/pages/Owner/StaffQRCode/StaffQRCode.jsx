import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../services'
import QRCode from 'qrcode'
import styles from './StaffQRCode.module.css'

function StaffQRCode() {
  const navigate = useNavigate()
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expiresIn, setExpiresIn] = useState(0) // in seconds
  const [expiryTime, setExpiryTime] = useState(null)

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode()
  }, [])

  // Countdown timer - every second
  useEffect(() => {
    if (expiryTime) {
      const timer = setInterval(() => {
        const now = new Date()
        const remaining = Math.floor((expiryTime - now) / 1000)
        
        if (remaining <= 0) {
          setExpiresIn(0)
          clearInterval(timer)
        } else {
          setExpiresIn(remaining)
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [expiryTime])

  const generateQRCode = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('📤 Generating QR code...')
      const response = await authAPI.generateQRCode()
      console.log('✅ QR code generated:', response)

      const token = response.qr_code.token
      setQrToken(token)
      
      // Calculate expiry time
      const expiryDate = new Date(response.qr_code.expires_at)
      setExpiryTime(expiryDate)
      
      const remainingSeconds = Math.floor((expiryDate - new Date()) / 1000)
      setExpiresIn(remainingSeconds)

      // Generate QR code image from token
      const qrUrl = await QRCode.toDataURL(token, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrUrl)
    } catch (err) {
      console.error('❌ Failed to generate QR code:', err)
      setError(err.response?.data?.message || 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button 
            className={styles.backBtn}
            onClick={() => navigate('/owner/staff')}
          >
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Manage Staff</h1>
          <p className={styles.subtitle}>Control who has access to your shop system</p>
        </div>
        <button 
          className={styles.addStaffBtn}
          onClick={() => navigate('/owner/staff/qr-code')}
        >
          + ADD NEW STAFF
        </button>
      </div>

      {/* Main Card */}
      <div className={styles.content}>
        <div className={styles.mainCard}>
          {/* Step Badge */}
          <div className={styles.stepBadge}>STEP 1 OF 3</div>

          {/* Title */}
          <h2 className={styles.cardTitle}>Link New Staff Member</h2>
          <p className={styles.cardSubtitle}>Have your staff scan this QR code with their phone</p>

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrFrame}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div className={styles.spinner}></div>
                  <p>Generating QR Code...</p>
                </div>
              ) : error ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
                  <p>{error}</p>
                  <button onClick={generateQRCode} style={{ marginTop: '10px' }}>
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className={styles.qrCode}
                  />
                  <div style={{ marginTop: '10px', fontSize: '14px', color: expiresIn < 60 ? '#dc3545' : '#666' }}>
                    <p>
                      {expiresIn > 0 ? (
                        <>Expires in: <strong>{formatTime(expiresIn)}</strong></>
                      ) : (
                        <span style={{ color: '#dc3545' }}>⚠️ QR Code Expired - Please regenerate</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructionsBox}>
            <h3 className={styles.instructionsTitle}>Instructions for Staff:</h3>
            <ol className={styles.instructionsList}>
              <li>
                <div className={styles.stepNum}>1</div>
                <p>Open the Smart Loss Control app on your phone</p>
              </li>
              <li>
                <div className={styles.stepNum}>2</div>
                <p>Select "Staff Login" from the welcome screen</p>
              </li>
              <li>
                <div className={styles.stepNum}>3</div>
                <p>Tap "Scan QR Code" and point your camera at this code</p>
              </li>
              <li>
                <div className={styles.stepNum}>4</div>
                <p>Create a 4-digit PIN when prompted</p>
              </li>
            </ol>
          </div>

          {/* Security Notes */}
          <div className={styles.securityBox}>
            <div className={styles.securityIcon}>⚠️</div>
            <div className={styles.securityContent}>
              <h4>Security Notes</h4>
              <p>
                This QR code is unique to your shop and is needed for the linking process. 
                It's important to not share this QR code outside of authorized users as 
                this can lead to a security breach in the system. You can regenerate this 
                code at any time for additional security.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button 
              className={styles.regenerateBtn}
              onClick={generateQRCode}
              disabled={loading}
            >
              {loading ? 'GENERATING...' : 'REGENERATE CODE'}
            </button>
            <button 
              className={styles.doneBtn}
              onClick={() => navigate('/owner/staff')}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffQRCode