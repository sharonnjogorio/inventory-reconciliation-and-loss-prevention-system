import { useState, useEffect } from 'react'
import styles from './AlertDetailsModal.module.css'
import { inventoryAPI } from '../../../../services'

const computeSeverity = (alert) => {
  const pct = Math.abs(alert.variance_percent || 0)
  const isMissing = (alert.variance || 0) < 0

  if (!isMissing) {
    // Excess units — counting error, not theft; cap at WARNING
    if (pct <= 15) return 'MINOR'
    return 'WARNING'
  }

  // Missing units — potential theft/loss; full scale applies
  if (pct <= 10) return 'MINOR'
  if (pct <= 30) return 'WARNING'
  return 'CRITICAL'
}

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'CRITICAL': return '#DC143C'
    case 'WARNING':  return '#FF8C00'
    case 'MINOR':    return '#F59E0B'
    default:         return '#50C878'
  }
}

const getSeverityIcon = (severity) => {
  const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (severity) {
    case 'CRITICAL':
      return <svg {...base}><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    case 'WARNING':
      return <svg {...base}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    case 'MINOR':
      return <svg {...base}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    default:
      return <svg {...base}><polyline points="20 6 9 17 4 12"/></svg>
  }
}

function AlertDetailsModal({ alert, inventory = [], onClose, onResolve }) {
  const [notes, setNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [corrected, setCorrected] = useState(null)
  const [correcting, setCorrecting] = useState(true)

  useEffect(() => {
    const physicalCount = alert.actual_count ?? 0

    // 1. localStorage — written by the staff device at the exact moment of count.
    //    Keyed by sku_id (try both field names) + date.
    try {
      const skuId = alert.sku?.sku_id || alert.sku?.id
      const date  = (alert.counted_at || alert.created_at || '').split('T')[0]
      if (skuId && date) {
        const stored = localStorage.getItem(`qc_${skuId}_${date}`)
        if (stored) {
          const { expectedCount, variance, variancePct } = JSON.parse(stored)
          const absPct   = Math.abs(variancePct)
          const severity = absPct <= 10 ? 'NORMAL' : absPct <= 20 ? 'MINOR' : absPct <= 30 ? 'WARNING' : 'CRITICAL'
          setCorrected({ expectedCount, variance, variancePct, severity })
          setCorrecting(false)
          return
        }
      }
    } catch (_) { /* localStorage unavailable */ }

    // 2. Use the same inventory snapshot the card used (passed from Alerts.jsx).
    //    This guarantees card and modal always compute from identical data.
    const resolve = (inv) => {
      const match = inv.find(item =>
        item.sku_id === (alert.sku?.sku_id || alert.sku?.id) ||
        (item.brand === alert.sku?.brand && item.size === alert.sku?.size)
      )
      if (match) {
        const currentStock = match.quantity
        const variance     = physicalCount - currentStock
        const variancePct  = currentStock > 0 ? (variance / currentStock) * 100 : 0
        const absPct       = Math.abs(variancePct)
        const severity     = absPct <= 10 ? 'NORMAL' : absPct <= 20 ? 'MINOR' : absPct <= 30 ? 'WARNING' : 'CRITICAL'
        setCorrected({ expectedCount: currentStock, variance, variancePct, severity })
      }
      setCorrecting(false)
    }

    if (inventory.length > 0) {
      resolve(inventory)
    } else {
      inventoryAPI.getInventorySummary()
        .then(data => resolve(data.inventory || data.data || []))
        .catch(() => setCorrecting(false))
    }
  }, [alert, inventory])


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

  const displayExpected  = corrected ? corrected.expectedCount : alert.expected_count
  const displayVariance  = corrected ? corrected.variance      : alert.variance
  const displayVariancePct = corrected ? corrected.variancePct : alert.variance_percent

  const getVarianceText = () => {
    const abs = Math.abs(displayVariance)
    if (abs === 0) return 'No variance'
    const isMissing = displayVariance < 0
    return isMissing ? `-${abs} units (missing)` : `+${abs} units (excess)`
  }

  const severity = corrected ? corrected.severity : computeSeverity(alert)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header} style={{ borderTopColor: getSeverityColor(severity) }}>
          <div className={styles.headerLeft}>
            <span className={styles.icon}>{getSeverityIcon(severity)}</span>
            <div>
              <h2 className={styles.title}>Alert Details</h2>
              <p className={styles.subtitle}>{severity} - {alert.type}</p>
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
              <div className={styles.productMessage}>
                {correcting
                  ? '…'
                  : corrected
                    ? `${corrected.variance < 0 ? 'Missing' : 'Excess'} ${Math.abs(corrected.variance)} units of ${alert.sku.brand} ${alert.sku.size}`
                    : alert.message
                }
              </div>
            </div>
          </div>

          {/* Variance Details */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Variance Analysis</h3>
            {correcting ? (
              <div style={{ padding: '16px 0', color: '#888', fontSize: '14px' }}>Loading variance data…</div>
            ) : (
            <div className={styles.grid}>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>Expected Count</span>
                <span className={styles.gridValue}>{displayExpected} units</span>
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
                  {Math.abs(displayVariancePct).toFixed(2)}%
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
            )}
          </div>

          {/* Staff Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Staff Information</h3>
            <div className={styles.staffCard}>
              <div className={styles.staffRow}>
                <span className={styles.staffLabel}>Name:</span>
                <span className={styles.staffValue}>{alert.staff_name || 'Unknown'}</span>
              </div>
              {alert.staff_phone && (
                <div className={styles.staffRow}>
                  <span className={styles.staffLabel}>Phone:</span>
                  <span className={styles.staffValue}>{alert.staff_phone}</span>
                </div>
              )}
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
