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
          <span className={styles.severityText} style={{ color: getSeverityColor(alert.severity) }}>
            {alert.severity}
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
          <p className={styles.message}>{alert.message}</p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Variance</span>
            <span className={`${styles.summaryValue} ${styles.variance}`}>
              {getVarianceText()} ({Math.abs(alert.variance_percent || 0).toFixed(1)}%)
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
