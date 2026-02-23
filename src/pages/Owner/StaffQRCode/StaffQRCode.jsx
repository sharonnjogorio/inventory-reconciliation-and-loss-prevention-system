import { useNavigate } from 'react-router-dom'
import styles from './StaffQRCode.module.css'
import qrCodeImage from '../../../assets/qr-code.png' // Import your QR image

function StaffQRCode() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button 
            className={styles.backBtn}
            onClick={() => navigate('/owner/staff')}
          >
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Manage Staff</h1>
          <p className={styles.subtitle}>Control who has access to your shop system</p>
        </div>
        <button 
          className={styles.addStaffBtn}
          onClick={() => navigate('/owner/staff/qr-code')}
        >
          + ADD NEW STAFF
        </button>
      </div>

      {/* Main Card */}
      <div className={styles.content}>
        <div className={styles.mainCard}>
          {/* Step Badge */}
          <div className={styles.stepBadge}>STEP 1 OF 3</div>

          {/* Title */}
          <h2 className={styles.cardTitle}>Link New Staff Member</h2>
          <p className={styles.cardSubtitle}>Have your staff scan this QR code with their phone</p>

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrFrame}>
              <img 
                src={qrCodeImage} 
                alt="QR Code" 
                className={styles.qrCode}
              />
              
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructionsBox}>
            <h3 className={styles.instructionsTitle}>Instructions for Staff:</h3>
            <ol className={styles.instructionsList}>
              <li>
                <div className={styles.stepNum}>1</div>
                <p>Open the Smart Loss Control app on your phone</p>
              </li>
              <li>
                <div className={styles.stepNum}>2</div>
                <p>Select "Staff Login" from the welcome screen</p>
              </li>
              <li>
                <div className={styles.stepNum}>3</div>
                <p>Tap "Scan QR Code" and point your camera at this code</p>
              </li>
              <li>
                <div className={styles.stepNum}>4</div>
                <p>Create a 4-digit PIN when prompted</p>
              </li>
            </ol>
          </div>

          {/* Security Notes */}
          <div className={styles.securityBox}>
            <div className={styles.securityIcon}>⚠️</div>
            <div className={styles.securityContent}>
              <h4>Security Notes</h4>
              <p>
                This QR code is unique to your shop and is needed for the linking process. 
                It's important to not share this QR code outside of authorized users as 
                this can lead to a security breach in the system. You can regenerate this 
                code at any time for additional security.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button className={styles.regenerateBtn}>
              REGENERATE CODE
            </button>
            <button 
              className={styles.doneBtn}
              onClick={() => navigate('/owner/staff')}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffQRCode