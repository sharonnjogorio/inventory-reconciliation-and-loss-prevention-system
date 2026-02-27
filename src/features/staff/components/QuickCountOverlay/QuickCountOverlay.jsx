import { useState } from 'react'
import styles from './QuickCountOverlay.module.css'
import { auditAPI } from '../../../../services'
import useAuthStore from '../../../../store/useAuthStore'


function QuickCountOverlay({ product, expectedCount, onComplete, onClose }) {
  const { getCurrentStaff } = useAuthStore()
  const [actualCount, setActualCount] = useState('')
  const [result, setResult] = useState(null) // null | 'match' | 'minor' | 'warning' | 'critical'
  const [verificationData, setVerificationData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const staff = getCurrentStaff()

  // Debug logging
  console.log('🔍 QuickCountOverlay state:', {
    actualCount,
    isSubmitting,
    disabled: !actualCount || isSubmitting,
    product: product?.id
  })

  const handleSubmit = async () => {
    if (!actualCount || isSubmitting) return
    
    setIsSubmitting(true)
    const actual = parseInt(actualCount)

    // Validate input
    if (isNaN(actual) || actual < 0) {
      alert('Please enter a valid count (0 or greater)')
      setIsSubmitting(false)
      return
    }

    try {
      console.log('📊 Submitting count:', { sku_id: product.id, physical_count: actual })
      
      // Call backend to verify count
      const response = await auditAPI.verifyPhysicalCount({
        skuId: product.id,
        physicalCount: actual,
        countedAt: new Date().toISOString()
      })

      console.log('✅ Verification response:', response)

      if (response.success) {
        const verification = response.verification
        setVerificationData(verification)

        // Determine result level based on alert level
        if (verification.alert_level === 'NORMAL') {
          setResult('match')
        } else if (verification.alert_level === 'MINOR') {
          setResult('minor')
        } else if (verification.alert_level === 'WARNING') {
          setResult('warning')
        } else if (verification.alert_level === 'CRITICAL') {
          setResult('critical')
        }

        // Auto-close after showing result
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
        }, 5000)
      } else {
        console.error('❌ Verification failed:', response)
        alert('Failed to verify count. Please try again.')
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('❌ Error verifying count:', err)
      alert(`Failed to verify count: ${err.message || 'Please check your connection'}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {result === null && (
          <div style={{ position: 'relative', zIndex: 1 }}>
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
              onKeyPress={(e) => {
                if (e.key === 'Enter' && actualCount) {
                  handleSubmit()
                }
              }}
              className={styles.input}
              autoFocus
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!actualCount || isSubmitting}
              className={styles.submitButton}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: actualCount && !isSubmitting ? '#DC143C' : '#999',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: actualCount && !isSubmitting ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                opacity: actualCount && !isSubmitting ? 1 : 0.6
              }}
            >
              {isSubmitting ? 'Verifying...' : 'Submit Count'}
            </button>

            <p className={styles.note}>
              ⚠️ Sales are locked until count is submitted
            </p>
          </div>
        )}

        {/* Match Result - Green */}
        {result === 'match' && verificationData && (
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
              <p>Expected: <strong>{verificationData.expected_stock}</strong></p>
              <p>Counted: <strong>{verificationData.physical_count}</strong></p>
              <p className={styles.resultMatch}>✓ Perfect Match</p>
            </div>
          </div>
        )}

        {/* Minor Deviation - Orange */}
        {result === 'minor' && verificationData && (
          <div className={styles.resultSection}>
            <div className={`${styles.resultIcon} ${styles.warning}`}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FF8C00"/>
                <path d="M12 8v4M12 16h.01" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.resultTitle}>Minor Discrepancy</h2>
            <p className={styles.resultText}>
              Small variance detected
            </p>
            <div className={styles.resultDetails}>
              <p>Expected: <strong>{verificationData.expected_stock}</strong></p>
              <p>Counted: <strong>{verificationData.physical_count}</strong></p>
              <p className={styles.resultMinor}>
                {verificationData.variance > 0 ? '▲' : '▼'} {Math.abs(verificationData.variance)} units ({Math.abs(verificationData.variance_percent).toFixed(1)}%)
              </p>
              <p className={styles.valueImpact}>
                Loss: ${verificationData.estimated_loss.toFixed(2)}
              </p>
            </div>
            <p className={styles.alertSent}>
              📊 Logged for review
            </p>
          </div>
        )}

        {/* Warning Deviation - Yellow */}
        {result === 'warning' && verificationData && (
          <div className={styles.resultSection}>
            <div className={`${styles.resultIcon} ${styles.warning}`}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#FFC107"/>
                <path d="M12 9v4M12 17h.01" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.resultTitle}>⚠️ Warning</h2>
            <p className={styles.resultText}>
              Significant variance detected
            </p>
            <div className={styles.resultDetails}>
              <p>Expected: <strong>{verificationData.expected_stock}</strong></p>
              <p>Counted: <strong>{verificationData.physical_count}</strong></p>
              <p className={styles.resultWarning}>
                {verificationData.variance > 0 ? '▲' : '▼'} {Math.abs(verificationData.variance)} units ({Math.abs(verificationData.variance_percent).toFixed(1)}%)
              </p>
              <p className={styles.valueImpact}>
                Loss: ${verificationData.estimated_loss.toFixed(2)}
              </p>
            </div>
            <p className={styles.alertSent}>
              📱 Owner has been notified
            </p>
          </div>
        )}

        {/* Critical Deviation - Red */}
        {result === 'critical' && verificationData && (
          <div className={styles.resultSection}>
            <div className={`${styles.resultIcon} ${styles.error}`}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#DC143C"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.resultTitle}>🚨 CRITICAL ALERT</h2>
            <p className={styles.resultText}>
              Major discrepancy detected
            </p>
            <div className={styles.resultDetails}>
              <p>Expected: <strong>{verificationData.expected_stock}</strong></p>
              <p>Counted: <strong>{verificationData.physical_count}</strong></p>
              <p className={styles.resultCritical}>
                {verificationData.variance > 0 ? '▲' : '▼'} {Math.abs(verificationData.variance)} units ({Math.abs(verificationData.variance_percent).toFixed(1)}%)
              </p>
              <p className={styles.valueImpact}>
                Estimated Loss: ${verificationData.estimated_loss.toFixed(2)}
              </p>
            </div>
            <p className={styles.alertSent}>
              📱 Owner alerted immediately
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default QuickCountOverlay