import { useState, useEffect } from 'react'
import styles from './InstallPrompt.module.css'

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User ${outcome} the install prompt`)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className={styles.prompt}>
      <p>📱 Install Smart Loss Control for offline access</p>
      <button onClick={handleInstall} className={styles.installBtn}>
        Install App
      </button>
      <button onClick={() => setShowPrompt(false)} className={styles.closeBtn}>
        ×
      </button>
    </div>
  )
}

export default InstallPrompt