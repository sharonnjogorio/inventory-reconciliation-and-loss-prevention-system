import { useState } from 'react'
import styles from './QuickCountOverlay.module.css'
import { auditAPI } from '../../../../services'

// Always read staff identity from staffData — never from owner-side Zustand store
const getStaffFromStorage = () => {
  try {
    const saved = localStorage.getItem('staffData')
    if (saved) return JSON.parse(saved)
  } catch (_) { /* localStorage unavailable */ }
  return null
}

function QuickCountOverlay({ product, expectedCount, onComplete, onClose }) {
  const [actualCount, setActualCount] = useState('')
  const [result, setResult] = useState(null)
  const [verificationData, setVerificationData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const staff = getStaffFromStorage()

  const handleSubmit = async () => {
    if (!actualCount || isSubmitting) return

    const actual = parseInt(actualCount)
    if (isNaN(actual) || actual < 0) {
      setApiError('Please enter a valid count (0 or greater)')
      return
    }

    setIsSubmitting(true)
    setApiError(null)

    try {
      console.log('📤 Sending audit verify:', { skuId: product.id, physicalCount: actual, staffId: staff?.id })
      const response = await auditAPI.verifyPhysicalCount({
        skuId: product.id,
        physicalCount: actual,
        expectedCount,
        countedAt: new Date().toISOString(),
        staffId: staff?.id
      })

      if (response.success) {
        const verification = response.verification

        // The backend uses the initial stock count (from store creation) as
        // expected_stock, ignoring all sales since then. Override with the
        // frontend's current stock level, which already has all sales deducted.
        if (expectedCount != null) {
          const correctedVariance = actual - expectedCount
          const correctedPct = expectedCount > 0
            ? (correctedVariance / expectedCount) * 100
            : 0
          const absPct = Math.abs(correctedPct)

          verification.expected_stock  = expectedCount
          verification.variance        = correctedVariance
          verification.variance_percent = correctedPct

          // Recompute alert level from corrected percentage
          if (absPct <= 10)       verification.alert_level = 'NORMAL'
          else if (absPct <= 20)  verification.alert_level = 'MINOR'
          else if (absPct <= 30)  verification.alert_level = 'WARNING'
          else                    verification.alert_level = 'CRITICAL'

          // Persist corrected data so the owner's alert modal can retrieve
          // the stock level at the time of the count (inventory changes after)
          try {
            const date = new Date().toISOString().split('T')[0]
            const key  = `qc_${product.id}_${date}`
            localStorage.setItem(key, JSON.stringify({
              expectedCount,
              variance: correctedVariance,
              variancePct: correctedPct,
              physicalCount: actual,
              ts: Date.now()
            }))
          } catch (_) { /* localStorage unavailable */ }
        }

        setVerificationData(verification)

        if (verification.alert_level === 'NORMAL')         setResult('match')
        else if (verification.alert_level === 'MINOR')     setResult('minor')
        else if (verification.alert_level === 'WARNING')   setResult('warning')
        else if (verification.alert_level === 'CRITICAL')  setResult('critical')

        setTimeout(() => {
          onComplete({
            actual,
            expected: verification.expected_stock,
            gap: verification.variance,
            variance: verification.variance_percent,
            isMatch: verification.alert_level === 'NORMAL',
            alertLevel: verification.alert_level
          })
          onClose()
        }, 4000)
      } else {
        setApiError('Verification failed. You can skip and continue.')
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('❌ Error verifying count:', err)
      console.error('❌ Backend response:', err.response?.data)
      const status = err.response?.status
      const backendMsg = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data)
      setApiError(
        status === 500
          ? `Server error: ${backendMsg || 'Unknown — check console'}`
          : `Failed to verify: ${backendMsg || err.message}`
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {result === null && (
          <>
            <div className={styles.lockIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h2 className={styles.title}>Quick Count Required</h2>
            <p className={styles.prompt}>Count the physical stock on the shelf</p>

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
              How many <strong>{product.name}</strong> units are on the shelf?
            </p>

            {apiError && (
              <div className={styles.errorBox}>
                <span>{apiError}</span>
              </div>
            )}

            <input
              type="number"
              inputMode="numeric"
              placeholder="Enter count"
              value={actualCount}
              onChange={(e) => { setActualCount(e.target.value); setApiError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && actualCount) handleSubmit() }}
              className={styles.input}
              autoFocus
              min="0"
            />

            <button
              onClick={handleSubmit}
              disabled={!actualCount || isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Verifying...' : 'Submit Count'}
            </button>

            <p className={styles.note}>Sales are locked until count is submitted</p>
          </>
        )}

        {result === 'match' && verificationData && (
          <div className={styles.resultSection}>
            <div className={styles.resultIconWrap}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#16A34A"/>
                <path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={`${styles.resultTitle} ${styles.titleSuccess}`}>Count Verified!</h2>
            <p className={styles.resultText}>Within acceptable range — no alert triggered</p>
            <div className={styles.resultDetails}>
              <div className={styles.detailRow}><span>Expected</span><strong>{verificationData.expected_stock}</strong></div>
              <div className={styles.detailRow}><span>Counted</span><strong>{verificationData.physical_count}</strong></div>
              <div className={`${styles.detailRow} ${styles.match}`}>
                <span>Variance</span>
                <strong>
                  {verificationData.physical_count === verificationData.expected_stock
                    ? 'None'
                    : `${verificationData.physical_count < verificationData.expected_stock ? '-' : '+'}${Math.abs(verificationData.variance)} units (within 10%)`
                  }
                </strong>
              </div>
            </div>
          </div>
        )}

        {(result === 'minor' || result === 'warning' || result === 'critical') && verificationData && (
          <div className={styles.resultSection}>
            <div className={styles.resultIconWrap}>
              {result === 'minor' && (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#D97706"/>
                  <path d="M12 8v4M12 16h.01" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
              {result === 'warning' && (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#D97706"/>
                  <path d="M12 9v4M12 17h.01" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
              {result === 'critical' && (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#DC143C"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <h2 className={`${styles.resultTitle} ${result === 'critical' ? styles.titleCritical : styles.titleWarning}`}>
              {result === 'minor' ? 'Minor Discrepancy' : result === 'warning' ? 'Significant Variance' : 'Critical Alert'}
            </h2>
            <p className={styles.resultText}>
              {result === 'critical' ? 'Major discrepancy detected — owner notified' : 'Variance has been logged for review'}
            </p>
            <div className={styles.resultDetails}>
              <div className={styles.detailRow}><span>Expected</span><strong>{verificationData.expected_stock}</strong></div>
              <div className={styles.detailRow}><span>Counted</span><strong>{verificationData.physical_count}</strong></div>
              <div className={`${styles.detailRow} ${result === 'critical' ? styles.critical : styles.warning}`}>
                <span>Variance</span>
                <strong>
                {verificationData.physical_count < verificationData.expected_stock ? '-' : '+'}{Math.abs(verificationData.variance)} units ({Math.abs(verificationData.variance_percent)?.toFixed(1)}%)
              </strong>
              </div>
              <div className={`${styles.detailRow} ${styles.loss}`}>
                <span>Est. Loss</span>
                <strong>${verificationData.estimated_loss?.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default QuickCountOverlay
