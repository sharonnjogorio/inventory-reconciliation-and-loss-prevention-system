import { useState } from 'react'
import styles from './AlertDetailsModal.module.css'

function AlertDetailsModal({ alert, onClose, onResolve, getSeverityColor, getSeverityIcon }) {
  const [notes, setNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const handleResolve = async () => {
    if (isResolving) return
    
    setIsResolving(true)
    try {
      await onResolve(alert.id, notes)
    } catch (error) {
      console.error('Failed to resolve:', error)
    } finally {
      setIsResolving(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVarianceText = () => {
    const variance = alert.variance
    if (variance === 0) return 'No variance'
    if (variance > 0) return `+${variance} units (excess)`
    return `${variance} units (missing)`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header} style={{ borderTopColor: getSeverityColor(alert.severity) }}>
          <div className={styles.headerLeft}>
            <span className={styles.icon}>{getSeverityIcon(alert.severity)}</span>
            <div>
              <h2 className={styles.title}>Alert Details</h2>
              <p className={styles.subtitle}>{alert.severity} - {alert.type}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Product Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Product</h3>
            <div className={styles.productCard}>
              <div className={styles.productName}>
                {alert.sku.brand} {alert.sku.size}
              </div>
              <div className={styles.productMessage}>{alert.message}</div>
            </div>
          </div>

          {/* Variance Details */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Variance Analysis</h3>
            <div className={styles.grid}>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Expected Count</span>
                <span className={styles.gridValue}>{alert.expected_count} units</span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Physical Count</span>
                <span className={styles.gridValue}>{alert.actual_count} units</span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Variance</span>
                <span className={`${styles.gridValue} ${styles.variance}`}>
                  {getVarianceText()}
                </span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Variance %</span>
                <span className={`${styles.gridValue} ${styles.variance}`}>
                  {Math.abs(alert.variance_percent).toFixed(2)}%
                </span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Estimated Loss</span>
                <span className={`${styles.gridValue} ${styles.loss}`}>
                  ${alert.estimated_loss.toFixed(2)}
                </span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Counted At</span>
                <span className={styles.gridValue}>
                  {formatDate(alert.counted_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Staff Information</h3>
            <div className={styles.staffCard}>
              <div className={styles.staffRow}>
                <span className={styles.staffLabel}>Name:</span>
                <span className={styles.staffValue}>{alert.staff.name}</span>
              </div>
              <div className={styles.staffRow}>
                <span className={styles.staffLabel}>Phone:</span>
                <span className={styles.staffValue}>{alert.staff.phone}</span>
              </div>
            </div>
          </div>

          {/* Resolution Section */}
          {!alert.is_resolved && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Resolve Alert</h3>
              <textarea
                placeholder="Add notes about investigation or resolution (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
                rows={4}
              />
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className={styles.resolveBtn}
              >
                {isResolving ? 'Resolving...' : 'Mark as Resolved'}
              </button>
            </div>
          )}

          {alert.is_resolved && (
            <div className={styles.section}>
              <div className={styles.resolvedBanner}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                  <div className={styles.resolvedTitle}>Alert Resolved</div>
                  <div className={styles.resolvedDate}>
                    {formatDate(alert.resolved_at)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlertDetailsModal
