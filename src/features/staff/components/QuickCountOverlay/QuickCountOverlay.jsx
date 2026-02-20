import { useState } from 'react'
import styles from './QuickCountOverlay.module.css'
import db from '../../../../services/db'
import useAuthStore from '../../../../store/useAuthStore'


function QuickCountOverlay({ product, expectedCount, onComplete, onClose }) {
  const { getCurrentStaff } = useAuthStore()
  const [actualCount, setActualCount] = useState('')
  const [result, setResult] = useState(null) // null | 'match' | 'mismatch'
  const [deviation, setDeviation] = useState(0)
  const staff = getCurrentStaff()

  const handleSubmit = async () => {
    const actual = parseInt(actualCount)
    const gap = actual - expectedCount
    const isMatch = gap === 0
    const percentageDeviation = Math.abs((gap / expectedCount) * 100)

    setDeviation(gap)
    setResult(isMatch ? 'match' : 'mismatch')

    // Log the count to audit trail
    try {
      await db.audit_logs.add({
        type: 'QUICK_COUNT',
        staff_id: staff.id,
        staff_name: staff.name,
        product_id: product.id,
        product_name: `${product.name} ${product.size}`,
        expected: expectedCount,
        actual: actual,
        deviation: gap,
        deviation_percentage: percentageDeviation,
        timestamp: new Date().toISOString()
      })

      // PRD: Alert owner if deviation > 10%
      if (percentageDeviation > 10) {
        await sendDeviationAlert({
          product: `${product.name} ${product.size}`,
          expected: expectedCount,
          actual: actual,
          gap: gap,
          value: Math.abs(gap * product.price),
          staff: staff.name
        })
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        onComplete({ actual, gap, isMatch })
        onClose()
      }, 7000)
    } catch (err) {
      console.error('Error logging count:', err)
    }
  }

  const sendDeviationAlert = async (alertData) => {
    // TODO: Send to backend to trigger WhatsApp alert to owner
    console.log('🚨 DEVIATION ALERT:', alertData)
    
    // For now, store in local queue
    await db.sync_queue.add({
      type: 'DEVIATION_ALERT',
      data: alertData,
      synced: false,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {result === null && (
          <>
            {/* Lock Icon */}
            <div className={styles.lockIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h2 className={styles.title}>Quick Count Required</h2>
            <p className={styles.prompt}>
              Count the physical stock on the shelf
            </p>

            {/* Product Info */}
            <div className={styles.productCard}>
              {product.image && (
                <img src={product.image} alt={product.name} className={styles.productImage} />
              )}
              <div className={styles.productInfo}>
                <p className={styles.productName}>{product.name}</p>
                <p className={styles.productSize}>{product.size}</p>
              </div>
            </div>

            <p className={styles.instruction}>
              How many <strong>{product.name} {product.size}</strong> are on the shelf?
            </p>

            {/* Count Input */}
            <input
              type="number"
              inputMode="numeric"
              placeholder="Enter count"
              value={actualCount}
              onChange={(e) => setActualCount(e.target.value)}
              className={styles.input}
              autoFocus
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!actualCount}
              className={styles.submitButton}
            >
              Submit Count
            </button>

            <p className={styles.note}>
              ⚠️ Sales are locked until count is submitted
            </p>
          </>
        )}

        {/* Match Result - Green */}
        {result === 'match' && (
          <div className={styles.resultSection}>
            <div className={`${styles.resultIcon} ${styles.success}`}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#50C878"/>
                <path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.resultTitle}>Count Verified!</h2>
            <p className={styles.resultText}>
              Stock matches system records
            </p>
            <div className={styles.resultDetails}>
              <p>Expected: <strong>{expectedCount}</strong></p>
              <p>Counted: <strong>{actualCount}</strong></p>
              <p className={styles.resultMatch}>✓ Perfect Match</p>
            </div>
          </div>
        )}

        {/* Mismatch Result - Red */}
        {result === 'mismatch' && (
          <div className={styles.resultSection}>
            <div className={`${styles.resultIcon} ${styles.error}`}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#DC143C"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.resultTitle}>Deviation Detected</h2>
            <p className={styles.resultText}>
              Stock count does not match system
            </p>
            <div className={styles.resultDetails}>
              <p>Expected: <strong>{expectedCount}</strong></p>
              <p>Counted: <strong>{actualCount}</strong></p>
              <p className={styles.resultMismatch}>
                {deviation > 0 ? '▲' : '▼'} {Math.abs(deviation)} units {deviation > 0 ? 'extra' : 'missing'}
              </p>
              <p className={styles.valueImpact}>
                Value: ₦{(Math.abs(deviation) * product.price).toLocaleString()}
              </p>
            </div>
            <p className={styles.alertSent}>
              📱 Alert sent to shop owner
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default QuickCountOverlay