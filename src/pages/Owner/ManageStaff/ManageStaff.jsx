import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ManageStaff.module.css'

function ManageStaff() {
  const navigate = useNavigate()
  
  const [activeStaff] = useState([
    {
      id: 1,
      name: 'Chinedu Okafor',
      avatar: '/avatar1.png',
      status: 'Active',
      email: 'chinedu@email.com',
      phone: '+234 803 XXX 4567',
      lastLogin: 'Today at 9:45 AM'
    },
    {
      id: 2,
      name: 'Blessing Adeyemi',
      avatar: '/avatar2.png',
      status: 'On Leave',
      email: 'blessing@email.com',
      phone: '+234 805 XXX 1234',
      lastLogin: '2 days ago'
    }
  ])

  const [removedStaff] = useState([
    {
      id: 3,
      name: 'Emeka Johnson',
      avatar: '/avatar3.png',
      email: 'emeka@email.com',
      phone: '+234 807 XXX 9876',
      removedDate: 'Removed on Jan 15, 2025'
    }
  ])

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
          <div className={styles.staffList}>
            {activeStaff.map(staff => (
              <div key={staff.id} className={styles.staffCard}>
                <div className={styles.staffMain}>
                  <img src={staff.avatar} alt={staff.name} className={styles.avatar} />
                  <div className={styles.staffInfo}>
                    <h3 className={styles.staffName}>{staff.name}</h3>
                    <span className={`${styles.badge} ${staff.status === 'Active' ? styles.badgeActive : styles.badgeLeave}`}>
                      {staff.status}
                    </span>
                    <div className={styles.staffDetails}>
                      <span>Email: {staff.email}</span>
                      <span>Phone Number: {staff.phone}</span>
                      <span>Last Login: {staff.lastLogin}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.staffActions}>
                  <button className={styles.actionBtn}>VIEW ACTIVITY</button>
                  <button className={styles.actionBtnDanger}>REMOVE ACCESS</button>
                </div>
              </div>
            ))}
          </div>
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
          <h2 className={styles.sectionTitle}>Removed Staff (1)</h2>
          <div className={styles.staffList}>
            {removedStaff.map(staff => (
              <div key={staff.id} className={`${styles.staffCard} ${styles.staffCardRemoved}`}>
                <div className={styles.staffMain}>
                  <img src={staff.avatar} alt={staff.name} className={styles.avatar} />
                  <div className={styles.staffInfo}>
                    <h3 className={styles.staffName}>{staff.name}</h3>
                    <div className={styles.staffDetails}>
                      <span>Email: {staff.email}</span>
                      <span>Phone Number: {staff.phone}</span>
                      <span className={styles.removedDate}>{staff.removedDate}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.staffActions}>
                  <button className={styles.actionBtn}>REINSTATE</button>
                </div>
              </div>
            ))}
          </div>
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