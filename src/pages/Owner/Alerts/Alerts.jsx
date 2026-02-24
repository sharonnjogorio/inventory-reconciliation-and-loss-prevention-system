import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { alertsAPI } from '../../../services'
import styles from './Alerts.module.css'

function Alerts() {
  const navigate = useNavigate()
  
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter === 'all' ? {} : { status: filter }
      const response = await alertsAPI.getAlerts(params)
      setAlerts(response.data || response.alerts || [])
      console.log('✅ Alerts loaded:', response)
    } catch (err) {
      console.error('❌ Failed to load alerts:', err)
      setError('Failed to load alerts. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleResolveAlert = async (alertId) => {
    try {
      await alertsAPI.resolveAlert(alertId)
      console.log('✅ Alert resolved:', alertId)
      fetchAlerts()
    } catch (err) {
      console.error('❌ Failed to resolve alert:', err)
      alert('Failed to resolve alert')
    }
  }

  const stats = {
    total: alerts.length,
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    totalValue: alerts.reduce((sum, a) => sum + (a.estimated_loss || 0), 0)
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.status === filter)

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return styles.statusNew
      case 'acknowledged': return styles.statusAcknowledged
      case 'resolved': return styles.statusResolved
      default: return ''
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'new': return 'New Alert'
      case 'acknowledged': return 'Acknowledged'
      case 'resolved': return 'Resolved'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading alerts...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alerts & Notifications</h1>
          <p className={styles.subtitle}>Monitor stock variances and supplier discrepancies</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Alerts</h3>
          <p className={styles.statValue}>{stats.total}</p>
        </div>
        <div className={`${styles.statCard} ${styles.statCardNew}`}>
          <h3>New Alerts</h3>
          <p className={styles.statValue}>{stats.new}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Acknowledged</h3>
          <p className={styles.statValue}>{stats.acknowledged}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Potential Loss</h3>
          <p className={styles.statValue}>${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({alerts.length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'new' ? styles.filterActive : ''}`}
          onClick={() => setFilter('new')}
        >
          New ({stats.new})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'acknowledged' ? styles.filterActive : ''}`}
          onClick={() => setFilter('acknowledged')}
        >
          Acknowledged ({stats.acknowledged})
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'resolved' ? styles.filterActive : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({stats.resolved})
        </button>
      </div>

      <div className={styles.alertsList}>
        {filteredAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✓</div>
            <h3>No {filter !== 'all' ? filter : ''} alerts</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className={`${styles.alertCard} ${getStatusColor(alert.status)}`}>
              <div className={styles.alertHeader}>
                <div className={styles.alertProduct}>
                  <div>
                    <h3 className={styles.productName}>
                      {alert.sku?.brand} {alert.sku?.size}
                    </h3>
                    <span className={styles.alertType}>
                      🚨 Stock Variance Alert
                    </span>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${getStatusColor(alert.status)}`}>
                  {getStatusText(alert.status)}
                </span>
              </div>

              <div className={styles.alertDetails}>
                <div className={styles.varianceDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Expected:</span>
                    <span className={styles.detailValue}>{alert.expected_count} units</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Actual Count:</span>
                    <span className={styles.detailValue}>{alert.actual_count} units</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Missing:</span>
                    <span className={`${styles.detailValue} ${styles.detailDanger}`}>
                      {alert.variance} units
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Estimated Loss:</span>
                    <span className={`${styles.detailValue} ${styles.detailDanger}`}>
                      ${alert.estimated_loss?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.alertMeta}>
                {alert.staff_name && (
                  <span className={styles.metaItem}>
                    👤 Count by: <strong>{alert.staff_name}</strong>
                  </span>
                )}
                <span className={styles.metaItem}>
                  🕒 {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>

              {alert.status === 'new' && (
                <div className={styles.alertActions}>
                  <button 
                    className={styles.resolveBtn}
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Alerts