import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './BulkDecant.module.css'
import db from '../../../services/db'
import useAuthStore from '../../../store/useAuthStore'

/**
 * Bulk-to-Retail Conversion (Carton Break)
 * 
 * Allows staff to:
 * - Select a product brand and size
 * - Input number of cartons to break
 * - Convert cartons to individual bottles
 * - PRD: 1 Carton = 12 Bottles
 * 
 * PRD: Section 5.3 Story #2
 */

// Same products from Sales Dashboard
const PRODUCTS = [
  { id: 'kings_1l', name: "King's Oil", size: '1L', bottles_per_carton: 12 },
  { id: 'kings_5l', name: "King's Oil", size: '5L', bottles_per_carton: 4 },
  { id: 'mamador_1l', name: 'Mamador', size: '1L', bottles_per_carton: 12 },
  { id: 'mamador_2l', name: 'Mamador', size: '2L', bottles_per_carton: 6 },
  { id: 'terra_1l', name: 'Golden Terra', size: '1L', bottles_per_carton: 12 },
]

function BulkDecant() {
  const navigate = useNavigate()
  const { getCurrentStaff } = useAuthStore()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [cartonCount, setCartonCount] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const staff = getCurrentStaff()

  const product = PRODUCTS.find(p => p.id === selectedProduct)
  const bottlesAdded = product ? cartonCount * product.bottles_per_carton : 0

  const handleBreakCarton = async () => {
    if (!product) return

    try {
      // Log the carton break action
      await db.audit_logs.add({
        type: 'CARTON_BREAK',
        staff_id: staff.id,
        staff_name: staff.name,
        product_id: product.id,
        product_name: `${product.name} ${product.size}`,
        cartons_broken: cartonCount,
        bottles_added: bottlesAdded,
        timestamp: new Date().toISOString()
      })

      // Update inventory (in real app, this would update backend)
      await db.inventory
        .where('id')
        .equals(product.id)
        .modify(item => {
          item.qty_cartons = (item.qty_cartons || 0) - cartonCount
          item.qty_bottles = (item.qty_bottles || 0) + bottlesAdded
        })

      alert(`✅ Successfully broke ${cartonCount} carton(s)\n${bottlesAdded} bottles added to inventory`)
      
      // Reset form
      setCartonCount(1)
      setShowConfirm(false)
      setSelectedProduct('')
    } catch (err) {
      console.error('Error breaking carton:', err)
      alert('Failed to break carton. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/staff/sales')}>
          ← Back to Sales
        </button>
        <h1 className={styles.title}>Bulk to Retail Conversion</h1>
        <p className={styles.subtitle}>Break cartons into individual bottles</p>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        
        {/* Product Selection */}
        <div className={styles.section}>
          <label className={styles.label}>Select Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className={styles.select}
          >
            <option value="">-- Choose a product --</option>
            {PRODUCTS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.size}
              </option>
            ))}
          </select>
        </div>

        {/* Carton Count Input */}
        {product && (
          <>
            <div className={styles.section}>
              <label className={styles.label}>Number of Cartons</label>
              <div className={styles.counterWrapper}>
                <button
                  className={styles.counterBtn}
                  onClick={() => setCartonCount(Math.max(1, cartonCount - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={cartonCount}
                  onChange={(e) => setCartonCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={styles.counterInput}
                  min="1"
                />
                <button
                  className={styles.counterBtn}
                  onClick={() => setCartonCount(cartonCount + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Conversion Preview */}
            <div className={styles.conversionCard}>
              <h3 className={styles.conversionTitle}>Conversion Preview</h3>
              
              <div className={styles.conversionFlow}>
                {/* From Cartons */}
                <div className={styles.conversionBox}>
                  <p className={styles.conversionLabel}>Cartons</p>
                  <div className={styles.conversionValue}>{cartonCount}</div>
                  <p className={styles.conversionUnit}>
                    {cartonCount === 1 ? 'carton' : 'cartons'}
                  </p>
                </div>

                {/* Arrow */}
                <div className={styles.arrow}>→</div>

                {/* To Bottles */}
                <div className={`${styles.conversionBox} ${styles.conversionResult}`}>
                  <p className={styles.conversionLabel}>Bottles</p>
                  <div className={styles.conversionValue}>{bottlesAdded}</div>
                  <p className={styles.conversionUnit}>individual bottles</p>
                </div>
              </div>

              <p className={styles.formula}>
                Formula: {cartonCount} carton(s) × {product.bottles_per_carton} bottles/carton = {bottlesAdded} bottles
              </p>
            </div>

            {/* Confirm Button */}
            <button
              className={styles.breakButton}
              onClick={() => setShowConfirm(true)}
            >
              Break Carton{cartonCount > 1 ? 's' : ''}
            </button>
          </>
        )}

        {!product && (
          <div className={styles.placeholder}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <p>Select a product to begin conversion</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirm Carton Break</h2>
            <p className={styles.modalText}>
              You are about to break <strong>{cartonCount} carton(s)</strong> of <strong>{product.name} {product.size}</strong>
            </p>
            
            <div className={styles.modalDetails}>
              <p>This will add <strong>{bottlesAdded} bottles</strong> to inventory</p>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleBreakCarton}
              >
                Confirm Break
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkDecant