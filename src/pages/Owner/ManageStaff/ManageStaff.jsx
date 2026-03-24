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
        const active = response.staff.filter(s => s.is_active)
        const removed = response.staff.filter(s => !s.is_active)

        setActiveStaff(active)
        setRemovedStaff(removed)
      } else {
        setError('Failed to load staff list')
      }
    } catch (err) {
      console.error('❌ Failed to load staff:', err)
      setError('Failed to load staff list')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to remove access for ${staffName}?`)) return
    try {
      await shopsAPI.revokeStaffAccess(staffId)
      fetchStaffList()
    } catch (err) {
      console.error(err)
      alert('Failed to revoke staff access')
    }
  }

  const handleReactivate = async (staffId, staffName) => {
    if (!confirm(`Reactivate access for ${staffName}?`)) return
    try {
      await shopsAPI.reactivateStaffAccess(staffId)
      fetchStaffList()
    } catch (err) {
      console.error(err)
      alert('Failed to reactivate staff')
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name[0].toUpperCase()
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className={styles.loading}>Loading staff...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Staff</h1>
        <button onClick={() => navigate('/owner/staff/qr-code')}>Add Staff</button>
      </div>

      {/* Active Staff */}
      <section>
        <h2>Active Staff ({activeStaff.length})</h2>
        {activeStaff.length === 0 ? (
          <p>No active staff</p>
        ) : (
          activeStaff.map((staff) => (
            <div key={staff.id} className={styles.staffCard}>
              <div className={styles.avatar}>{getInitials(staff.full_name)}</div>
              <div>
                <h3>{staff.full_name}</h3>
                <p>Device: {staff.device_id || 'Not linked'}</p>
                <p>Last Login: {formatDate(staff.last_login)}</p>
                <p>Joined: {formatDate(staff.joined_at)}</p>
                <p>Sales Today: {staff.activity.sales_today} | Last 7 days: {staff.activity.sales_last_7_days}</p>
              </div>
              <button onClick={() => handleRevokeAccess(staff.id, staff.full_name)}>Remove Access</button>
            </div>
          ))
        )}
      </section>

      {/* Removed Staff */}
      <section>
        <h2>Removed Staff ({removedStaff.length})</h2>
        {removedStaff.length === 0 ? (
          <p>No removed staff</p>
        ) : (
          removedStaff.map((staff) => (
            <div key={staff.id} className={styles.staffCardRemoved}>
              <div className={styles.avatar}>{getInitials(staff.full_name)}</div>
              <div>
                <h3>{staff.full_name}</h3>
                <p>Device: {staff.device_id || 'Not linked'}</p>
                <p>Joined: {formatDate(staff.joined_at)}</p>
              </div>
              <button onClick={() => handleReactivate(staff.id, staff.full_name)}>Reinstate</button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default ManageStaff