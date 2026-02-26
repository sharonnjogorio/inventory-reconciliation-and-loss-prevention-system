import { useState, useEffect } from 'react'
import { alertsAPI } from '../../../services'
import AlertCard from '../../../components/AlertCard/AlertCard'
import AlertDetailsModal from '../../../components/AlertDetailsModal/AlertDetailsModal'
import styles from './Alerts.module.css'

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('active') // active, resolved, all
  const [severityFilter, setSeverityFilter] = useState('all') // all, critical, warning, minor

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter, severityFilter])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (severityFilter !== 'all') params.severity = severityFilter

      const response = await alertsAPI.getAlerts(params)
      setAlerts(response.alerts || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (alertId) => {
    try {
      const response = await alertsAPI.getAlertDetails(alertId)
      setSelectedAlert(response.alert)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Failed to fetch alert details:', error)
      alert('Failed to load alert details')
    }
  }

  const handleResolve = async (alertId, notes) => {
    try {
      await alertsAPI.resolveAlert(alertId, notes)
      setShowDetailsModal(false)
      fetchAlerts() // Refresh list
    } catch (error) {
      console.error('Failed to resolve alert:', error)
      alert('Failed to resolve alert')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#DC143C'
      case 'WARNING': return '#FFC107'
      case 'MINOR': return '#FF8C00'
      default: return '#50C878'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '🚨'
      case 'WARNING': return '⚠️'
      case 'MINOR': return '🟠'
      default: return '✅'
    }
  }

  const getActiveCount = () => alerts.filter(a => !a.is_resolved).length
  const getCriticalCount = () => alerts.filter(a => a.severity === 'CRITICAL' && !a.is_resolved).length
  const getTotalLoss = () => alerts.reduce((sum, a) => sum + (a.estimated_loss || 0), 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Alerts</h1>
          <p className={styles.subtitle}>Monitor inventory discrepancies and theft alerts</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{getActiveCount()}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={`${styles.statCard} ${styles.critical}`}>
            <span className={styles.statValue}>{getCriticalCount()}</span>
            <span className={styles.statLabel}>Critical</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>${getTotalLoss().toFixed(2)}</span>
            <span className={styles.statLabel}>Total Loss</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Severity:</label>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        <button onClick={fetchAlerts} className={styles.refreshBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>No alerts found</h3>
            <p>
              {statusFilter === 'active' 
                ? 'All clear! No active alerts at the moment.' 
                : 'No alerts match your filters.'}
            </p>
          </div>
        ) : (
          <div className={styles.alertsList}>
            {alerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onViewDetails={() => handleViewDetails(alert.id)}
                getSeverityColor={getSeverityColor}
                getSeverityIcon={getSeverityIcon}
              />
            ))}
          </div>
        )}
      </div>

      {showDetailsModal && selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setShowDetailsModal(false)}
          onResolve={handleResolve}
          getSeverityColor={getSeverityColor}
          getSeverityIcon={getSeverityIcon}
        />
      )}
    </div>
  )
}

export default Alerts
