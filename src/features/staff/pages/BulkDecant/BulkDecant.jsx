import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './BulkDecant.module.css'
import db from '../../../../services/db'
import useAuthStore from '../../../../store/useAuthStore'



const PRODUCTS = [
  { id: 'kings_1l', name: "King's Oil", size: '1 Litre', bottles_per_carton: 12, cartons_in_stock: 10, loose_units: 7 },
  { id: 'kings_5l', name: "King's Oil", size: '5 Litres', bottles_per_carton: 4, cartons_in_stock: 8, loose_units: 3 },
  { id: 'mamador_1l', name: 'Mamador', size: '1 Litre', bottles_per_carton: 12, cartons_in_stock: 8, loose_units: 5 },
  { id: 'mamador_2l', name: 'Mamador', size: '2 Litres', bottles_per_carton: 6, cartons_in_stock: 6, loose_units: 4 },
  { id: 'terra_1l', name: 'Golden Terra', size: '1 Litre', bottles_per_carton: 12, cartons_in_stock: 5, loose_units: 2 },
]

// Unique brands
const BRANDS = [...new Set(PRODUCTS.map(p => p.name))]

function BulkDecant() {
  const navigate = useNavigate()
  const { getCurrentStaff, isOnline } = useAuthStore()
  const [selectedBrand, setSelectedBrand] = useState('Mamador')
  const [selectedSize, setSelectedSize] = useState('1 Litre')
  const [cartonCount, setCartonCount] = useState(2)
  const [showConfirm, setShowConfirm] = useState(false)

  const staff = getCurrentStaff()

  // Get available sizes for selected brand
  const availableSizes = PRODUCTS
    .filter(p => p.name === selectedBrand)
    .map(p => p.size)

  // Get current product
  const currentProduct = PRODUCTS.find(
    p => p.name === selectedBrand && p.size === selectedSize
  )

  const bottlesAdded = currentProduct ? cartonCount * currentProduct.bottles_per_carton : 0
  const newLooseUnits = currentProduct ? currentProduct.loose_units + bottlesAdded : 0
  const newCartons = currentProduct ? currentProduct.cartons_in_stock - cartonCount : 0

  const handleBreakCarton = async () => {
    if (!currentProduct) return

    try {
      await db.audit_logs.add({
        type: 'CARTON_BREAK',
        staff_id: staff.id,
        staff_name: staff.name,
        product_id: currentProduct.id,
        product_name: `${currentProduct.name} ${currentProduct.size}`,
        cartons_broken: cartonCount,
        bottles_added: bottlesAdded,
        timestamp: new Date().toISOString()
      })

      await db.inventory
        .where('id')
        .equals(currentProduct.id)
        .modify(item => {
          item.qty_cartons = (item.qty_cartons || 0) - cartonCount
          item.qty_bottles = (item.qty_bottles || 0) + bottlesAdded
        })

      alert(`✅ Successfully broke ${cartonCount} carton(s)\n${bottlesAdded} bottles added to inventory`)
      
      setCartonCount(1)
      setShowConfirm(false)
      navigate('/staff/sales')
    } catch (err) {
      console.error('Error breaking carton:', err)
      alert('Failed to break carton. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      {/* Staff Bar */}
      <div className={styles.staffBar}>
        <div className={styles.staffInfo}>
          <span className={styles.loggedInText}>Logged in as</span>
          <span className={styles.staffName}>{staff?.name || 'Chinedu Okafor'}</span>
        </div>

        <div className={styles.staffActions}>
          <button className={`${styles.statusBtn} ${isOnline ? styles.online : styles.offline}`}>
            <span className={styles.statusDot}></span>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
          <button className={styles.syncBtn}>Quick Count</button>
        </div>
      </div>

      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>Bulk to Retail Conversion</h1>
        <p className={styles.subtitle}>Break down bulk packages into retail units</p>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        
        {/* Select Product Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Select Product</h2>
          
          <div className={styles.selectRow}>
            <div className={styles.selectGroup}>
              <label className={styles.label}>Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value)
                  // Reset to first size of new brand
                  const firstSize = PRODUCTS.find(p => p.name === e.target.value)?.size
                  setSelectedSize(firstSize || '1 Litre')
                }}
                className={styles.select}
              >
                {BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label className={styles.label}>Unit Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className={styles.select}
              >
                {availableSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Info Boxes */}
          <div className={styles.stockBoxes}>
            <div className={styles.stockBox}>
              <span className={styles.stockLabel}>CARTONS IN STOCK</span>
              <span className={styles.stockValue}>{currentProduct?.cartons_in_stock || 0} cartons</span>
            </div>
            <div className={styles.stockBox}>
              <span className={styles.stockLabel}>LOOSE UNITS IN STOCK</span>
              <span className={styles.stockValue}>{currentProduct?.loose_units || 0} units</span>
            </div>
          </div>
        </div>

{/* Conversion Section */}
<div className={styles.section}>
  <h2 className={styles.sectionTitle}>Conversion</h2>
  
  <div className={styles.conversionFlow}>
    {/* From Cartons */}
    <div className={styles.conversionColumn}>
      <span className={styles.conversionLabel}>FROM</span>
      
      <div className={styles.conversionBox}>
        <div className={styles.iconBox}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="path-1-inside-1_248_4913" fill="white">
<path d="M0 0H80V80H0V0Z"/>
</mask>
<path d="M0 0H80V80H0V0Z" fill="#6A7282"/>
<path d="M0 0V-1.77778H-1.77778V0H0ZM80 0H81.7778V-1.77778H80V0ZM80 80V81.7778H81.7778V80H80ZM0 80H-1.77778V81.7778H0V80ZM0 0V1.77778H80V0V-1.77778H0V0ZM80 0H78.2222V80H80H81.7778V0H80ZM80 80V78.2222H0V80V81.7778H80V80ZM0 80H1.77778V0H0H-1.77778V80H0Z" fill="#4A5565" mask="url(#path-1-inside-1_248_4913)"/>
</svg>

          
        </div>
        <br></br>
        <span className={styles.iconLabel}>CARTON</span>
      </div>
      
      <div className={styles.counter}>
        <button
          className={styles.counterBtn}
          onClick={() => setCartonCount(Math.max(1, cartonCount - 1))}
          disabled={cartonCount <= 1}
        >
          −
        </button>
        <div className={styles.counterValue}>{cartonCount}</div>
        <button
          className={styles.counterBtn}
          onClick={() => setCartonCount(cartonCount + 1)}
          disabled={cartonCount >= (currentProduct?.cartons_in_stock || 0)}
        >
          +
        </button>
      </div>
      
      <span className={styles.conversionDesc}>Cartons to convert</span>
    </div>

    {/* Arrow */}
    <div className={styles.arrow}>→</div>

    {/* To Bottles */}
    <div className={styles.conversionColumn}>
      <span className={styles.conversionLabel}>TO</span>
      
      <div className={`${styles.conversionBox} ${styles.toBox}`}>
        <div className={styles.iconBoxGreen}>
          <svg width="64" height="96" viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="path-1-inside-1_248_4933" fill="white">
<path d="M0 0H64V96H0V0Z"/>
</mask>
<path d="M0 0H64V96H0V0Z" fill="#00C950"/>
<path d="M0 0V-1.77778H-1.77778V0H0ZM64 0H65.7778V-1.77778H64V0ZM64 96V97.7778H65.7778V96H64ZM0 96H-1.77778V97.7778H0V96ZM0 0V1.77778H64V0V-1.77778H0V0ZM64 0H62.2222V96H64H65.7778V0H64ZM64 96V94.2222H0V96V97.7778H64V96ZM0 96H1.77778V0H0H-1.77778V96H0Z" fill="#00A63E" mask="url(#path-1-inside-1_248_4933)"/>
</svg>

        </div>
        <br></br>
        <span className={styles.iconLabelGreen}>1L BOTTLES</span>
      </div>
      
      <div className={styles.bottleCountBig}>{bottlesAdded}</div>
      
      <span className={styles.conversionDescGreen}>Units will be added</span>
    </div>
  </div>

  {/* Formula */}
  <div className={styles.formula}>
    <p className={styles.formulaText}>
      <strong>Formula:</strong> 1 Carton = {currentProduct?.bottles_per_carton || 12} units of {selectedSize} {selectedBrand}
    </p>
    <p className={styles.formulaCalc}>
      {cartonCount} Cartons × {currentProduct?.bottles_per_carton || 12} = {bottlesAdded} units
    </p>
  </div>
</div>

{/* Preview Changes Section */}
<div className={styles.previewSection}>
  <h2 className={styles.previewTitle}>Preview Changes</h2>
  
  <div className={styles.previewGrid}>
    {/* Cartons Preview */}
    <div className={styles.previewGroup}>
      <span className={styles.previewGroupLabel}>CARTONS</span>
      <div className={styles.previewFlow}>
        <div className={styles.previewBoxCurrent}>
          <span className={styles.previewBoxLabel}>CURRENT</span>
          <span className={styles.previewBoxValue}>{currentProduct?.cartons_in_stock || 8}</span>
        </div>
        <span className={styles.previewArrow}>→</span>
        <div className={styles.previewBoxNew}>
          <span className={styles.previewBoxLabel}>NEW</span>
          <span className={styles.previewBoxValue}>{newCartons}</span>
        </div>
      </div>
    </div>

    {/* Loose Units Preview */}
    <div className={styles.previewGroup}>
      <span className={styles.previewGroupLabel}>LOOSE UNITS</span>
      <div className={styles.previewFlow}>
        <div className={styles.previewBoxCurrent}>
          <span className={styles.previewBoxLabel}>CURRENT</span>
          <span className={styles.previewBoxValue}>{currentProduct?.loose_units || 5}</span>
        </div>
        <span className={styles.previewArrow}>→</span>
        <div className={styles.previewBoxNewGreen}>
          <span className={styles.previewBoxLabel}>NEW</span>
          <span className={styles.previewBoxValue}>{newLooseUnits}</span>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={() => navigate('/staff/sales')}
          >
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={() => setShowConfirm(true)}
            disabled={cartonCount <= 0 || cartonCount > (currentProduct?.cartons_in_stock || 0)}
          >
            Confirm Conversion
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirm Carton Break</h2>
            <p className={styles.modalText}>
              You are about to break <strong>{cartonCount} carton(s)</strong> of <strong>{selectedBrand} {selectedSize}</strong>
            </p>
            
            <div className={styles.modalDetails}>
              <p>This will add <strong>{bottlesAdded} bottles</strong> to inventory</p>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
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