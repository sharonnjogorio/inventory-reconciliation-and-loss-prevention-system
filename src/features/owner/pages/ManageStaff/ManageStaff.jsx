import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { shopsAPI } from '../../../../services'
import styles from './ManageStaff.module.css'

const UsersIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const ClipboardIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const AddStockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
    <line x1="12" y1="7" x2="12" y2="3"/>
    <line x1="10" y1="5" x2="14" y2="5"/>
  </svg>
)

const ReportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const ManageStaffIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

function ManageStaff() {
  const navigate = useNavigate()

  const [activeStaff, setActiveStaff] = useState([])
  const [removedStaff, setRemovedStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStaffList = async () => {
    setError('')
    try {
      setLoading(true)
      const response = await shopsAPI.getStaffList()
      const staffList = response.staff || response.data || []
      const isActive = (s) =>
        s.is_active === true ||
        s.status === 'active' ||
        s.active === true ||
        (s.is_active !== false && s.status !== 'revoked' && s.status !== 'removed' && s.status !== 'inactive')
      setActiveStaff(staffList.filter(s => isActive(s)))
      setRemovedStaff(staffList.filter(s => !isActive(s)))
    } catch (err) {
      console.error('❌ Failed to load staff list:', err)
      setError('Failed to load staff list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffList()
    const interval = setInterval(fetchStaffList, 10000)
    // Re-fetch when owner switches back to this browser tab
    const onVisible = () => { if (document.visibilityState === 'visible') fetchStaffList() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const handleRevokeAccess = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to remove access for ${staffName}?`)) return

    try {
      await shopsAPI.revokeStaffAccess(staffId)
      fetchStaffList()
    } catch (err) {
      alert('Failed to revoke staff access')
    }
  }

  const handleReactivate = async (staffId, staffName) => {
    if (!confirm(`Reactivate access for ${staffName}?`)) return

    try {
      await shopsAPI.reactivateStaffAccess(staffId)
      fetchStaffList()
    } catch (err) {
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

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 0) return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
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
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Staff</h1>
          <p className={styles.subtitle}>Control who has access to your shop system</p>
        </div>
        <button
          className={styles.addStaffBtn}
          onClick={() => navigate('/owner/staff/qr-code')}
        >
          + Add New Staff
        </button>
      </div>

      <div className={styles.content}>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Staff Members ({activeStaff.length})</h2>
          {activeStaff.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><UsersIcon /></div>
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
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pending Invitations (0)</h2>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><ClipboardIcon /></div>
            <p className={styles.emptyText}>No pending invitations</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Removed Staff ({removedStaff.length})</h2>
          {removedStaff.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><CheckIcon /></div>
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

        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button className={styles.quickActionCard} onClick={() => navigate('/owner/inventory/add')}>
              <div className={styles.quickActionIcon}><AddStockIcon /></div>
              <div className={styles.quickActionText}>
                <h4>Add Stock</h4>
                <p>Record new inventory</p>
              </div>
            </button>

            <button className={styles.quickActionCard} onClick={() => navigate('/owner/inventory')}>
              <div className={styles.quickActionIcon}><ReportIcon /></div>
              <div className={styles.quickActionText}>
                <h4>View Inventory/Report</h4>
                <p>Generate Inventory Reports</p>
              </div>
            </button>

            <button className={styles.quickActionCard} onClick={() => navigate('/owner/staff')}>
              <div className={styles.quickActionIcon}><ManageStaffIcon /></div>
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
