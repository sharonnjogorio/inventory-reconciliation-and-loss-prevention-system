import styles from './footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Footer Links */}
      <div className={styles.links}>
        <a href="#" className={styles.link}>Terms of use</a>
        <a href="#" className={styles.link}>Refund Policy</a>
        <a href="#" className={styles.link}>Documentation</a>
        <a href="#" className={styles.link}>Changelog</a>
        <a href="#" className={styles.link}>License</a>
      </div>

      {/* Footer Text */}
      <div className={styles.text}>
        <p className={styles.sdg}>Supporting SDG 8: Decent Work and Economic Growth</p>
        <p className={styles.copyright}>© 2026 Smart Loss Control - Next Gen Workforce Team 70</p>
      </div>
    </footer>
  )
}

export default Footer