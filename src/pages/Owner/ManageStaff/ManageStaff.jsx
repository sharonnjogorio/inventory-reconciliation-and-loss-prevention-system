import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopsAPI } from '../../../services'
import styles from './ManageStaff.module.css'

function ManageStaff() {
  const navigate = useNavigate()
  
  const [activeStaff, setActiveStaff] = useState([])
  const [removedStaff, setRemovedStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStaffList()
  }, [])

  const fetchStaffList = async () => {
    try {
      setLoading(true)
      const response = await shopsAPI.getStaffList()
      console.log('✅ Staff list loaded:', response)
      
      if (response.success) {
        // Separate active and removed staff
        const active = response.staff.filter(s => s.is_active)
        const removed = response.staff.filter(s => !s.is_active)
        
        setActiveStaff(active)
        setRemovedStaff(removed)
      }
    } catch (err) {
      console.error('❌ Failed to load staff:', err)
      setError('Failed to load staff list')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to remove access for ${staffName}?`)) {
      return
    }

    try {
      await shopsAPI.revokeStaffAccess(staffId)
      console.log('✅ Staff access revoked:', staffId)
      fetchStaffList() // Refresh list
    } catch (err) {
      console.error('❌ Failed to revoke access:', err)
      alert('Failed to revoke staff access')
    }
  }

  const handleReactivate = async (staffId, staffName) => {
    if (!confirm(`Reactivate access for ${staffName}?`)) {
      return
    }

    try {
      await shopsAPI.reactivateStaffAccess(staffId)
      console.log('✅ Staff reactivated:', staffId)
      fetchStaffList() // Refresh list
    } catch (err) {
      console.error('❌ Failed to reactivate staff:', err)
      alert('Failed to reactivate staff')
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading staff...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Manage Staff</h1>
            <p className={styles.subtitle}>Control who has access to your shop system</p>
          </div>
          <button 
            className={styles.addStaffBtn}
            onClick={() => navigate('/owner/staff/qr-code')}
          >
            ADD NEW STAFF
          </button>
        </div>

        {/* Active Staff Members */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Staff Members ({activeStaff.length})</h2>
          {activeStaff.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <p className={styles.emptyText}>No active staff members</p>
              <button 
                className={styles.addStaffBtn}
                onClick={() => navigate('/owner/staff/qr-code')}
              >
                ADD FIRST STAFF
              </button>
            </div>
          ) : (
            <div className={styles.staffList}>
              {activeStaff.map(staff => (
                <div key={staff.id} className={styles.staffCard}>
                  <div className={styles.staffMain}>
                    <div className={styles.avatar}>
                      {getInitials(staff.full_name || staff.staff_name)}
                    </div>
                    <div className={styles.staffInfo}>
                      <h3 className={styles.staffName}>{staff.full_name || staff.staff_name}</h3>
                      <span className={`${styles.badge} ${styles.badgeActive}`}>
                        Active
                      </span>
                      <div className={styles.staffDetails}>
                        <span>Device: {staff.device_id || 'Not linked'}</span>
                        <span>Last Login: {formatLastLogin(staff.last_login_at)}</span>
                        <span>Joined: {new Date(staff.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.staffActions}>
                    <button className={styles.actionBtnDanger} onClick={() => handleRevokeAccess(staff.id, staff.full_name || staff.staff_name)}>
                      REMOVE ACCESS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Invitations */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pending Invitations (0)</h2>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>No pending invitations</p>
          </div>
        </section>

        {/* Removed Staff */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Removed Staff ({removedStaff.length})</h2>
          {removedStaff.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✓</div>
              <p className={styles.emptyText}>No removed staff</p>
            </div>
          ) : (
            <div className={styles.staffList}>
              {removedStaff.map(staff => (
                <div key={staff.id} className={`${styles.staffCard} ${styles.staffCardRemoved}`}>
                  <div className={styles.staffMain}>
                    <div className={styles.avatar}>
                      {getInitials(staff.full_name || staff.staff_name)}
                    </div>
                    <div className={styles.staffInfo}>
                      <h3 className={styles.staffName}>{staff.full_name || staff.staff_name}</h3>
                      <div className={styles.staffDetails}>
                        <span>Device: {staff.device_id || 'Not linked'}</span>
                        <span className={styles.removedDate}>
                          Removed on {staff.revoked_at ? new Date(staff.revoked_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.staffActions}>
                    <button className={styles.actionBtn} onClick={() => handleReactivate(staff.id, staff.full_name || staff.staff_name)}>
                      REINSTATE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>📦</div>
              <div className={styles.quickActionText}>
                <h4>Add Stock</h4>
                <p>Record new inventory</p>
              </div>
            </button>

            <button className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>📊</div>
              <div className={styles.quickActionText}>
                <h4>View Inventory/Report</h4>
                <p>Generate Inventory Reports</p>
              </div>
            </button>

            <button className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>👥</div>
              <div className={styles.quickActionText}>
                <h4>Manage Staff</h4>
                <p>Add or remove staff</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ManageStaff