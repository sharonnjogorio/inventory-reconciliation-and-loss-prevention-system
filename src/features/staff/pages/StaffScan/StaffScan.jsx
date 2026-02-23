import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../../store/useAuthStore'
import styles from './StaffScan.module.css'


function StaffScan() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Back camera
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setScanning(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  // Mock QR scan for testing
  const handleMockScan = () => {
    // Simulate successful scan
    stopCamera()
    navigate('/staff/linked')
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => {
            stopCamera()
            navigate('/staff')
          }}
        >
          ← Back
        </button>
      
      </div>

      {/* Scanner View */}
      <div className={styles.scannerWrapper}>
        <div className={styles.scanner}>
          {scanning && !error && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={styles.video}
            />
          )}
          
          {/* Scan Frame */}
          <div className={styles.scanFrame}>
            <div className={styles.corner} style={{ top: 0, left: 0 }}></div>
            <div className={styles.corner} style={{ top: 0, right: 0 }}></div>
            <div className={styles.corner} style={{ bottom: 0, left: 0 }}></div>
            <div className={styles.corner} style={{ bottom: 0, right: 0 }}></div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <p>{error}</p>
              <button onClick={startCamera} className={styles.retryButton}>
                Retry
              </button>
            </div>
          )}
        </div>

        <p className={styles.instruction}>
          Point camera at QR Code
        </p>
        <p className={styles.subtext}>
          Get the QR code from your shop owner
        </p>

        {/* Mock Scan Button (for testing without camera) */}
        <button 
          className={styles.mockButton}
          onClick={handleMockScan}
        >
          Simulate Successful Scan (Testing)
        </button>
      </div>
    </div>
  )
}

export default StaffScan