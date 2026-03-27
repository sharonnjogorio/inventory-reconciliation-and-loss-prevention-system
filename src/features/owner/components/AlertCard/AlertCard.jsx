import { useMemo } from 'react'
import styles from './AlertCard.module.css'

const computeSeverityFromPct = (pct) => {
  if (pct <= 10) return 'MINOR'
  if (pct <= 30) return 'WARNING'
  return 'CRITICAL'
}

// Read corrected count data saved by QuickCountOverlay at count time
const readLocalStorage = (alert) => {
  try {
    const skuId = alert.sku?.sku_id || alert.sku?.id
    const date  = (alert.counted_at || alert.created_at || '').split('T')[0]
    if (!skuId || !date) return null
    const stored = localStorage.getItem(`qc_${skuId}_${date}`)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (_) { return null }
}


const getSeverityIcon = (severity) => {
  const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
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

function AlertCard({ alert, inventory = [], onViewDetails }) {
  // Compute corrected variance using the same priority as AlertDetailsModal:
  // 1. localStorage (saved at count time — most accurate)
  // 2. inventory prop (fetched by parent page alongside alerts)
  // 3. backend values (last resort — wrong base stock)
  const corrected = useMemo(() => {
    const ls = readLocalStorage(alert)
    if (ls) return { variance: ls.variance, variancePct: ls.variancePct }

    const physical = alert.actual_count ?? 0
    const match = inventory.find(item =>
      item.sku_id === (alert.sku?.sku_id || alert.sku?.id) ||
      (item.brand === alert.sku?.brand && item.size === alert.sku?.size)
    )
    if (match && match.quantity != null) {
      const v    = physical - match.quantity
      const pct  = match.quantity > 0 ? (v / match.quantity) * 100 : 0
      return { variance: v, variancePct: pct }
    }
    return null
  }, [alert, inventory])

  const variance    = corrected ? corrected.variance    : alert.variance
  const variancePct = corrected ? corrected.variancePct : alert.variance_percent
  const physical    = alert.actual_count

  const severity = computeSeverityFromPct(Math.abs(variancePct || 0))
  const severityClass = severity === 'CRITICAL' ? styles.critical
    : severity === 'WARNING' ? styles.warning
    : severity === 'MINOR' ? styles.minor
    : ''

  const getVarianceText = () => {
    const abs = Math.abs(variance)
    if (abs === 0) return 'No variance'
    return variance < 0 ? `-${abs} units (missing)` : `+${abs} units (excess)`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`${styles.card} ${severityClass} ${alert.is_resolved ? styles.resolved : ''}`}>
      <div className={styles.header}>
        <div className={styles.severity}>
          <span className={`${styles.icon} ${severityClass}`}>{getSeverityIcon(severity)}</span>
          <span className={`${styles.severityText} ${severityClass}`}>
            {severity}
          </span>
        </div>
        {alert.is_resolved
          ? <span className={styles.resolvedBadge}>✓ Resolved</span>
          : <span className={styles.lossBadge}>${alert.estimated_loss.toFixed(2)} loss</span>
        }
      </div>

      <div className={styles.content}>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{alert.sku.brand} {alert.sku.size}</h3>
          <p className={styles.message}>
            {`Stock count variance detected — ${physical} units counted`}
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Variance</span>
            <span className={`${styles.summaryValue} ${styles.variance}`}>
              {corrected || (alert.expected_count != null && alert.expected_count > 0)
                ? `${getVarianceText()} (${Math.abs(variancePct || 0).toFixed(1)}%)`
                : `${physical} units counted (open details)`
              }
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Counted by</span>
            <span className={styles.summaryValue}>{alert.staff_name || 'Unknown'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>When</span>
            <span className={styles.summaryValue}>{formatDate(alert.created_at)}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={onViewDetails} className={styles.viewBtn}>
          {alert.is_resolved ? 'View Details' : 'Review & Resolve'}
        </button>
      </div>
    </div>
  )
}

export default AlertCard
