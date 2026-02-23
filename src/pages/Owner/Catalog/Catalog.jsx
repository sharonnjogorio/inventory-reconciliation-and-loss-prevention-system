import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Catalog.module.css'

// ── Import Product Images ───────────────────────────────
import mamadorImg from '../../../assets/image/mamador.svg'
import devonkingImg from '../../../assets/image/devonking.svg'
import poweroilImg from '../../../assets/image/poweroil.svg'
import heroOil1 from '../../../assets/hero-oil-1.png'
import heroOil2 from '../../../assets/hero-oil-2.png'
import heroOil3 from '../../../assets/hero-oil-3.png'
import kingsoilImg from '../../../assets/image/kingsoil.png'
import goldenpennyImg from '../../../assets/image/goldenpenny.png'
const POPULAR_BRANDS = [
  { id: 'mamador', name: 'Mamador', size: 'Pure Vegetable Oil', image: mamadorImg },
  { id: 'golden_penny', name: 'Golden Penny', size: 'Quality Vegetable Oil', image: goldenpennyImg },
  { id: 'devon_kings', name: "Devon King's", size: 'Pure Vegetable Oil', image: devonkingImg },
  { id: 'power_oil', name: 'Power Oil', size: 'Vegetable Oil', image: poweroilImg },
  { id: 'turkey', name: 'Turkey', size: 'Pure Vegetable Oil', image: heroOil3 },
  { id: 'kingsoil', name: "King's Oil", size: 'Premium Oil', image: kingsoilImg },
]

const PACKAGE_SIZES = [
  { id: '1l', name: '1 Litre', size: 'Small packages', image: heroOil1 },
  { id: '2l', name: '2 Litres', size: 'Medium size', image: heroOil2 },
  { id: '5l', name: '5 Litres', size: 'Family size', image: heroOil3 },
  { id: '10l', name: '10 Litres', size: 'Large package', image: heroOil1 },
  { id: '20l', name: '20 Litres', size: 'Bulk size', image: heroOil2 },
  { id: '25l', name: '25 Litres', size: 'Extra large', image: mamadorImg },
]
function Catalog() {
  const navigate = useNavigate()
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Simple toggle - add if not present, remove if present
  const toggleBrand = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const toggleSize = (sizeId) => {
    setSelectedSizes(prev => 
      prev.includes(sizeId)
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    )
  }

  const handleContinue = () => {
    if (selectedBrands.length === 0 && selectedSizes.length === 0) {
      alert('Please select at least one brand or package size')
      return
    }
    
    // Save catalog to database (IndexedDB)
    const catalog = {
      brands: selectedBrands,
      sizes: selectedSizes,
      createdAt: new Date().toISOString()
    }
    
    console.log('Saving catalog:', catalog)
    // TODO: Save to IndexedDB here
    
    setShowSuccessModal(true)
  }

  const handleReturnToDashboard = () => {
    setShowSuccessModal(false)
    navigate('/owner/dashboard')
  }

  const totalSelections = selectedBrands.length + selectedSizes.length

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Page Title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Select Your Product Catalog</h1>
          <p className={styles.subtitle}>Choose the oil/brands and sizes you sell</p>
        </div>

        {/* Popular Brands Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Popular Brands</h2>
          <div className={styles.productGrid}>
            {POPULAR_BRANDS.map(product => {
              const isSelected = selectedBrands.includes(product.id)
              
              return (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.imageFrame}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productSize}>{product.size}</p>
                  
                  <button
                    className={isSelected ? styles.selectedBtn : styles.selectBtn}
                    onClick={() => toggleBrand(product.id)}
                  >
                    {isSelected ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Package Sizes Section */}
        <section className={styles.packageSection}>
          <h2 className={styles.sectionTitle}>Package Sizes for sale</h2>
          <div className={styles.productGrid}>
            {PACKAGE_SIZES.map(size => {
              const isSelected = selectedSizes.includes(size.id)
              
              return (
                <div key={size.id} className={styles.productCard}>
                  <div className={styles.imageFrame}>
                    <img src={size.image} alt={size.name} className={styles.productImage} />
                  </div>
                  <h3 className={styles.productName}>{size.name}</h3>
                  <p className={styles.productSize}>{size.size}</p>
                  
                  <button
                    className={isSelected ? styles.selectedBtn : styles.selectBtn}
                    onClick={() => toggleSize(size.id)}
                  >
                    {isSelected ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Selection Summary */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Your Selections</h3>
          <div className={styles.summaryContent}>
            <p>
              <strong>Brands ({selectedBrands.length}):</strong>{' '}
              {selectedBrands.length > 0 
                ? selectedBrands.map(id => POPULAR_BRANDS.find(b => b.id === id)?.name).join(', ')
                : 'None selected'}
            </p>
            <p>
              <strong>Sizes ({selectedSizes.length}):</strong>{' '}
              {selectedSizes.length > 0 
                ? selectedSizes.map(id => PACKAGE_SIZES.find(s => s.id === id)?.name).join(', ')
                : 'None selected'}
            </p>
            <p className={styles.summaryTotal}>
              <strong>Total Product Types:</strong> {totalSelections}
            </p>
            <p className={styles.summaryNote}>
              💡 You can set inventory quantities for these products after setup
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.saveBtn}>SAVE FOR LATER</button>
          <button 
            className={styles.continueBtn}
            onClick={handleContinue}
            disabled={totalSelections === 0}
          >
            CONTINUE TO DASHBOARD →
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={handleReturnToDashboard}>×</button>
            <div className={styles.checkmark}>✓</div>
            <h2 className={styles.modalTitle}>Store Setup Successful</h2>
            <p className={styles.modalText}>
              Your product catalog has been created with {totalSelections} product types. 
              You can now set inventory quantities in your dashboard.
            </p>
            <button className={styles.returnBtn} onClick={handleReturnToDashboard}>
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catalog