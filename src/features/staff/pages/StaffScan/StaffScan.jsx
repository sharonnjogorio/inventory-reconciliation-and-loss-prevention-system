import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './StaffScan.module.css'

function StaffScan() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        streamRef.current = stream
      } catch (err) {
        console.error('Camera access denied:', err)
        setError('Camera access denied. Please enable camera permissions.')
      }
    }

    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleMockScan = () => {
    const mockToken = 'mock_qr_token_12345'
    navigate('/staff/linked', { state: { qrToken: mockToken } })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Scan QR Code</h1>
      </div>

      <div className={styles.scannerWrapper}>
        <div className={styles.scanner}>
          <video ref={videoRef} autoPlay playsInline className={styles.video} />
          <div className={styles.scanFrame}>
            <div className={styles.corner}></div>
            <div className={styles.corner}></div>
            <div className={styles.corner}></div>
            <div className={styles.corner}></div>
          </div>
          {error && (
            <div className={styles.errorBox}>
              <p>{error}</p>
              <button onClick={handleMockScan} className={styles.retryButton}>
                Use Mock QR
              </button>
            </div>
          )}
        </div>

        <p className={styles.instruction}>Point your camera at the QR code displayed by your manager</p>
        <p className={styles.subtext}>Scanning automatically...</p>

        <button onClick={handleMockScan} className={styles.mockButton}>
          Skip Camera (Testing)
        </button>
      </div>
    </div>
  )
}

export default StaffScan