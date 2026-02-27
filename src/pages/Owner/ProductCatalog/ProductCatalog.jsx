import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventoryAPI } from '../../../services'
import styles from './ProductCatalog.module.css'
import oilBottle from '../../../assets/hero-oil-1.png'

// 10 Popular African Cooking Oil Brands (All 1L)
const AFRICAN_OIL_BRANDS = [
  { id: 1, name: "King's Oil", brand: "King's Oil", image: oilBottle, color: '#FFD700' },
  { id: 2, name: 'Mamador', brand: 'Mamador', image: oilBottle, color: '#8B008B' },
  { id: 3, name: 'Golden Terra', brand: 'Golden Terra', image: oilBottle, color: '#FF6347' },
  { id: 4, name: 'Devon Kings', brand: 'Devon Kings', image: oilBottle, color: '#4169E1' },
  { id: 5, name: 'Golden Penny', brand: 'Golden Penny', image: oilBottle, color: '#DAA520' },
  { id: 6, name: 'Power Oil', brand: 'Power Oil', image: oilBottle, color: '#DC143C' },
  { id: 7, name: 'Gino', brand: 'Gino', image: oilBottle, color: '#228B22' },
  { id: 8, name: 'Soya Gold', brand: 'Soya Gold', image: oilBottle, color: '#FF8C00' },
  { id: 9, name: 'Tropical', brand: 'Tropical', image: oilBottle, color: '#00CED1' },
  { id: 10, name: 'Grand Pure', brand: 'Grand Pure', image: oilBottle, color: '#9370DB' }
]

function ProductCatalog() {
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1: Select Products, 2: Setup Stock
  const [selectedProducts, setSelectedProducts] = useState([])
  const [stockSetup, setStockSetup] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        // Remove from selection and stock setup
        const newSetup = { ...stockSetup }
        delete newSetup[productId]
        setStockSetup(newSetup)
        return prev.filter(id => id !== productId)
      } else {
        // Add to selection with default values
        setStockSetup(prev => ({
          ...prev,
          [productId]: {
            cartons: 0,
            bottlesPerCarton: 12,
            totalBottles: 0,
            costPrice: 0,
            sellingPrice: 0
          }
        }))
        return [...prev, productId]
      }
    })
  }

  const updateStockSetup = (productId, field, value) => {
    setStockSetup(prev => {
      const updated = {
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: parseFloat(value) || 0
        }
      }
      
      // Auto-calculate total bottles
      if (field === 'cartons' || field === 'bottlesPerCarton') {
        updated[productId].totalBottles = 
          updated[productId].cartons * updated[productId].bottlesPerCarton
      }
      
      return updated
    })
  }

  const handleContinueToSetup = () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      console.log('🔄 Starting catalog setup...')
      
      // First, get all SKUs from backend to find matching IDs
      const skusResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.8.27:5000'}/inventory/skus`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!skusResponse.ok) {
        throw new Error(`Failed to fetch SKUs: ${skusResponse.status}`)
      }
      
      const skusData = await skusResponse.json()
      const allSKUs = skusData.skus || skusData.data || skusData
      console.log('✅ Fetched SKUs:', allSKUs.length)

      let successCount = 0
      let failedProducts = []

      // Create inventory for each selected product
      for (const productId of selectedProducts) {
        const product = AFRICAN_OIL_BRANDS.find(p => p.id === productId)
        const setup = stockSetup[productId]

        if (!setup || setup.totalBottles === 0) {
          console.log(`⏭️ Skipping ${product.brand} - no stock configured`)
          continue
        }

        // Find matching SKU in database
        const matchingSKU = allSKUs.find(sku => 
          sku.brand.toLowerCase() === product.brand.toLowerCase() && 
          sku.size === '1L'
        )

        if (!matchingSKU) {
          console.warn(`❌ SKU not found for ${product.brand} 1L`)
          failedProducts.push(product.name)
          continue
        }

        console.log(`📦 Adding ${product.brand}: ${setup.totalBottles} bottles`)

        try {
          // Call backend to add initial stock
          await inventoryAPI.recordRestock({
            skuId: matchingSKU.id,
            orderedQty: setup.totalBottles,
            receivedQty: setup.totalBottles,
            costPrice: setup.costPrice,
            sellPrice: setup.sellingPrice,
            supplierName: 'Initial Setup',
            referenceNote: `${setup.cartons} cartons × ${setup.bottlesPerCarton} bottles`
          })
          
          successCount++
          console.log(`✅ ${product.brand} added successfully`)
        } catch (restockError) {
          console.error(`❌ Failed to add ${product.brand}:`, restockError)
          failedProducts.push(product.name)
        }
      }

      console.log(`✅ Catalog setup complete: ${successCount}/${selectedProducts.length} products added`)
      
      if (failedProducts.length > 0) {
        setError(`Some products failed to add: ${failedProducts.join(', ')}. Please try adding them manually.`)
        setSubmitting(false)
        return
      }

      localStorage.setItem('catalogSetup', 'true')
      navigate('/owner/dashboard')
    } catch (err) {
      console.error('❌ Failed to set up catalog:', err)
      setError(err.response?.data?.message || err.message || 'Failed to set up catalog. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('catalogSetup', 'true')
    navigate('/owner/dashboard')
  }

  // Step 1: Product Selection
  if (step === 1) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Select Your Product Catalog</h1>
          <p className={styles.subtitle}>
            Choose the cooking oil brands you sell (All 1L bottles)
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Popular Brands</h2>
          <div className={styles.productsGrid}>
            {AFRICAN_OIL_BRANDS.map(product => (
              <div
                key={product.id}
                className={`${styles.productCard} ${
                  selectedProducts.includes(product.id) ? styles.selected : ''
                }`}
                onClick={() => toggleProduct(product.id)}
                style={{ borderColor: selectedProducts.includes(product.id) ? product.color : '#ddd' }}
              >
                <div className={styles.checkbox}>
                  {selectedProducts.includes(product.id) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </div>
                <img src={product.image} alt={product.name} className={styles.productImage} />
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productSize}>1L Bottle</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.selectedCount}>
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </div>
          <div className={styles.actions}>
            <button className={styles.skipBtn} onClick={handleSkip}>
              Skip for Now
            </button>
            <button
              className={styles.continueBtn}
              onClick={handleContinueToSetup}
              disabled={selectedProducts.length === 0}
            >
              Continue to Setup
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Stock Setup
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => setStep(1)}>
          ← Back
        </button>
        <h1 className={styles.title}>Setup Initial Stock</h1>
        <p className={styles.subtitle}>
          Enter your current stock levels for each product
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      <div className={styles.setupContent}>
        {selectedProducts.map(productId => {
          const product = AFRICAN_OIL_BRANDS.find(p => p.id === productId)
          const setup = stockSetup[productId] || {}

          return (
            <div key={productId} className={styles.setupCard}>
              <div className={styles.setupHeader}>
                <img src={product.image} alt={product.name} className={styles.setupImage} />
                <h3 className={styles.setupProductName}>{product.name} 1L</h3>
              </div>

              <div className={styles.setupForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Number of Cartons</label>
                    <input
                      type="number"
                      min="0"
                      value={setup.cartons || 0}
                      onChange={(e) => updateStockSetup(productId, 'cartons', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Bottles per Carton</label>
                    <input
                      type="number"
                      min="1"
                      value={setup.bottlesPerCarton || 12}
                      onChange={(e) => updateStockSetup(productId, 'bottlesPerCarton', e.target.value)}
                      placeholder="12"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Total Bottles</label>
                    <input
                      type="number"
                      value={setup.totalBottles || 0}
                      disabled
                      className={styles.calculated}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Cost Price (per bottle)</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.currencyIcon}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={setup.costPrice || ''}
                        onChange={(e) => updateStockSetup(productId, 'costPrice', e.target.value)}
                        placeholder="0.00"
                        className={styles.priceInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Selling Price (per bottle)</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.currencyIcon}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={setup.sellingPrice || ''}
                        onChange={(e) => updateStockSetup(productId, 'sellingPrice', e.target.value)}
                        placeholder="0.00"
                        className={styles.priceInput}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.skipBtn} onClick={handleSkip} disabled={submitting}>
          Skip for Now
        </button>
        <button
          className={styles.continueBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Setting up...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  )
}

export default ProductCatalog
