import styles from './AlertCard.module.css'

function AlertCard({ alert, onViewDetails, getSeverityColor, getSeverityIcon }) {
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

  const getVarianceText = () => {
    const variance = alert.variance
    if (variance === 0) return 'No variance'
    if (variance > 0) return `+${variance} units (excess)`
    return `${variance} units (missing)`
  }

  return (
    <div 
      className={`${styles.card} ${alert.is_resolved ? styles.resolved : ''}`}
      style={{ borderLeftColor: getSeverityColor(alert.severity) }}
    >
      <div className={styles.header}>
        <div className={styles.severity}>
          <span className={styles.icon}>{getSeverityIcon(alert.severity)}</span>
          <span className={styles.severityText}>{alert.severity}</span>
        </div>
        {alert.is_resolved && (
          <span className={styles.resolvedBadge}>✓ Resolved</span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>
            {alert.sku.brand} {alert.sku.size}
          </h3>
          <p className={styles.message}>{alert.message}</p>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Expected:</span>
            <span className={styles.value}>{alert.expected_count} units</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Counted:</span>
            <span className={styles.value}>{alert.actual_count} units</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Variance:</span>
            <span className={`${styles.value} ${styles.variance}`}>
              {getVarianceText()} ({Math.abs(alert.variance_percent || 0).toFixed(1)}%)
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Estimated Loss:</span>
            <span className={`${styles.value} ${styles.loss}`}>
              ${alert.estimated_loss.toFixed(2)}
            </span>
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{alert.staff_name || 'Unknown'}</span>
          </div>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{formatDate(alert.created_at)}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          onClick={onViewDetails}
          className={styles.viewBtn}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default AlertCard
