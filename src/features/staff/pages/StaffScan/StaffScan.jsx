import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import styles from './StaffScan.module.css'

function StaffScan() {
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true) // ✅ default to true, no need to set inside effect
  const [manualMode, setManualMode] = useState(false)
  const [manualToken, setManualToken] = useState('')

  const onScanSuccess = useCallback((decodedText) => {
    console.log('✅ QR Code scanned:', decodedText)
    if (scannerRef.current) {
      scannerRef.current.clear()
    }
    navigate('/staff/linked', { state: { qrToken: decodedText } })
  }, [navigate])

  const onScanError = useCallback((errorMessage) => {
    const errorStr = String(errorMessage || '')
    if (!errorStr.includes('NotFoundException')) {
      console.error('QR Scan error:', errorMessage)
    }
  }, [])

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    )

    scanner.render(onScanSuccess, onScanError)
    scannerRef.current = scanner
    // ✅ removed setScanning(true) — no longer needed since we default to true

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Scanner cleanup error:', err))
      }
    }
  }, [onScanSuccess, onScanError])

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualToken.trim()) {
      navigate('/staff/linked', { state: { qrToken: manualToken.trim() } })
    }
  }

  const toggleManualMode = () => {
    setManualMode(!manualMode)
    if (scannerRef.current && !manualMode) {
      scannerRef.current.clear()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Scan QR Code</h1>
        <p className={styles.subtitle}>Point your camera at the QR code from your manager</p>
      </div>

      <div className={styles.scannerWrapper}>
        {!manualMode ? (
          <>
            <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
            {error && <div className={styles.errorBox}><p>{error}</p></div>}
            <p className={styles.instruction}>{scanning ? 'Scanning...' : 'Initializing camera...'}</p>
          </>
        ) : (
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Enter QR Token Manually</h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>Copy the token from the QR code page and paste it here</p>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste QR token here..."
                style={{ width: '100%', padding: '12px', fontSize: '14px', border: '2px solid #ddd', borderRadius: '8px', marginBottom: '15px' }}
              />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                Continue
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={toggleManualMode} className={styles.mockButton}>
            {manualMode ? '📷 Use Camera' : '⌨️ Enter Token Manually'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffScan