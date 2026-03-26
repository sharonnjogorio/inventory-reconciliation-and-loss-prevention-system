import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventoryAPI } from '../../../../services/endpoints/inventory'
import styles from './AddStock.module.css'
import kingsoilImg from '../../../../assets/image/kingsoil.png'
import mamadorImg from '../../../../assets/image/mamador.svg'
import goldenTerraImg from '../../../../assets/image/hero-oil-2.png'
import devonkingImg from '../../../../assets/image/devonking.svg'
import goldenpennyImg from '../../../../assets/image/goldenpenny.svg'
import poweroilImg from '../../../../assets/image/poweroil.svg'
import ginoImg from '../../../../assets/image/hero-oil-3.png'
import soyaGoldImg from '../../../../assets/image/hero-oil-1.png'
import tropicalImg from '../../../../assets/image/hero-oil-2.png'
import grandPureImg from '../../../../assets/image/hero-oil-3.png'

const AFRICAN_OIL_BRANDS = [
  { id: 1,  name: "King's Oil",   brand: "King's Oil",   image: kingsoilImg,    color: '#FFD700' },
  { id: 2,  name: 'Mamador',      brand: 'Mamador',      image: mamadorImg,     color: '#8B008B' },
  { id: 3,  name: 'Golden Terra', brand: 'Golden Terra', image: goldenTerraImg, color: '#FF6347' },
  { id: 4,  name: 'Devon Kings',  brand: 'Devon Kings',  image: devonkingImg,   color: '#4169E1' },
  { id: 5,  name: 'Golden Penny', brand: 'Golden Penny', image: goldenpennyImg, color: '#DAA520' },
  { id: 6,  name: 'Power Oil',    brand: 'Power Oil',    image: poweroilImg,    color: '#DC143C' },
  { id: 7,  name: 'Gino',         brand: 'Gino',         image: ginoImg,        color: '#228B22' },
  { id: 8,  name: 'Soya Gold',    brand: 'Soya Gold',    image: soyaGoldImg,    color: '#FF8C00' },
  { id: 9,  name: 'Tropical',     brand: 'Tropical',     image: tropicalImg,    color: '#00CED1' },
  { id: 10, name: 'Grand Pure',   brand: 'Grand Pure',   image: grandPureImg,   color: '#9370DB' },
]

function AddStock() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState([])
  const [allSKUs, setAllSKUs] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockData, setStockData] = useState({
    cartons: '',
    bottlesPerCarton: 12,
    totalBottles: 0,
    costPrice: '',
    sellingPrice: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [inventoryData, skusData] = await Promise.all([
        inventoryAPI.getInventorySummary(),
        inventoryAPI.getSKUs(),
      ])
      const inventoryList = inventoryData.inventory || inventoryData.data || []
      setInventory(Array.isArray(inventoryList) ? inventoryList : [])
      setAllSKUs(skusData.skus || skusData.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load inventory data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProductStatus = (brand) =>
    inventory.find(item => item.brand.toLowerCase() === brand.toLowerCase() && item.size === '1L')

  const handleProductSelect = (product) => {
    const existingItem = getProductStatus(product.brand)
    setSelectedProduct({ ...product, existing: existingItem || null })
    setStockData({
      cartons: '',
      bottlesPerCarton: 12,
      totalBottles: 0,
      costPrice: existingItem?.cost_price?.toString() || '',
      sellingPrice: existingItem?.selling_price?.toString() || ''
    })
    setError('')
    setSuccess('')
  }

  const updateStockData = (field, value) => {
    setStockData(prev => {
      if (field === 'costPrice' || field === 'sellingPrice') {
        return { ...prev, [field]: value }
      }
      const updated = { ...prev, [field]: parseFloat(value) || 0 }
      if (field === 'cartons' || field === 'bottlesPerCarton') {
        updated.totalBottles = updated.cartons * updated.bottlesPerCarton
      }
      return updated
    })
  }

  const handleSubmit = async () => {
    if (!selectedProduct)             { setError('Please select a product'); return }
    if (stockData.totalBottles === 0) { setError('Please enter quantity'); return }
    const costPrice = parseFloat(stockData.costPrice)
    const sellingPrice = parseFloat(stockData.sellingPrice)
    if (!costPrice || !sellingPrice)  { setError('Please enter cost and selling prices'); return }
    if (sellingPrice < costPrice)     { setError('Selling price should be higher than cost price'); return }

    setSubmitting(true)
    setError('')

    try {
      // For existing products use the sku_id we already have from inventory
      // For new products look it up from the SKUs list
      let skuId = selectedProduct.existing?.sku_id

      if (!skuId) {
        const matchingSKU = allSKUs.find(sku =>
          sku.brand.toLowerCase() === selectedProduct.brand.toLowerCase() && sku.size === '1L'
        )
        if (!matchingSKU) throw new Error(`No SKU found for ${selectedProduct.brand} 1L. Please contact support.`)
        skuId = matchingSKU.id
      }

      await inventoryAPI.recordRestock({
        skuId,
        orderedQty: stockData.totalBottles,
        receivedQty: stockData.totalBottles,
        costPrice,
        sellPrice: sellingPrice,
        supplierName: selectedProduct.existing ? 'Restock' : 'Initial Stock',
        referenceNote: `${stockData.cartons} cartons × ${stockData.bottlesPerCarton} bottles`
      })

      setSuccess(`${selectedProduct.name} ${selectedProduct.existing ? 'restocked' : 'added'} successfully!`)
      await fetchData()

      setTimeout(() => {
        setSelectedProduct(null)
        setStockData({ cartons: '', bottlesPerCarton: 12, totalBottles: 0, costPrice: '', sellingPrice: '' })
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add stock. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Add Stock</h1>
          <p className={styles.subtitle}>Select a product to add or restock inventory</p>
        </div>
        <button className={styles.backBtn} onClick={() => navigate('/owner/inventory')}>
          ← Back to Inventory
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading inventory...
        </div>
      ) : (
        <div className={styles.content}>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          {success && <div className={styles.successMsg}>✅ {success}</div>}

          <div className={styles.productsSection}>
            <h2 className={styles.sectionTitle}>Select Product</h2>
            <div className={`${styles.productsGrid} ${selectedProduct ? styles.productsGridCompact : ''}`}>
              {AFRICAN_OIL_BRANDS.map(product => {
                const existingItem = getProductStatus(product.brand)
                const isSelected = selectedProduct?.id === product.id

                return (
                  <div
                    key={product.id}
                    className={`${styles.productCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleProductSelect(product)}
                    style={isSelected ? { borderColor: product.color, boxShadow: `0 0 0 3px ${product.color}33` } : {}}
                  >
                    {existingItem && (
                      <div className={styles.stockBadge}>{existingItem.quantity}</div>
                    )}
                    <div className={styles.imageWrap}>
                      <img src={product.image} alt={product.name} className={styles.productImage} />
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.productSize}>1L Bottle</p>
                      <span
                        className={styles.statusPill}
                        style={{ backgroundColor: existingItem ? '#E29A5C' : '#10B981' }}
                      >
                        {existingItem ? 'Restock' : 'Add New'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedProduct && (
            <div className={styles.formSection}>
              <div className={styles.formInner}>
                <div className={styles.formHeader}>
                  <div className={styles.formHeaderLeft}>
                    <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.formProductImage} />
                    <div>
                      <h2 className={styles.formTitle}>
                        {selectedProduct.existing ? 'Restock' : 'Add'} {selectedProduct.name}
                      </h2>
                      <p className={styles.currentStock}>
                        Current stock: <strong>{selectedProduct.existing?.quantity ?? 0}</strong> bottles
                      </p>
                    </div>
                  </div>
                  <button className={styles.closeFormBtn} onClick={() => setSelectedProduct(null)}>✕</button>
                </div>

                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Cartons</label>
                      <input
                        type="number" min="0"
                        value={stockData.cartons}
                        onChange={(e) => updateStockData('cartons', e.target.value)}
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Bottles / Carton</label>
                      <input
                        type="number" min="1"
                        value={stockData.bottlesPerCarton}
                        onChange={(e) => updateStockData('bottlesPerCarton', e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Total Bottles</label>
                      <input
                        type="number"
                        value={stockData.totalBottles}
                        disabled
                        className={styles.calculated}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Cost Price (₦)</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={stockData.costPrice}
                        onChange={(e) => updateStockData('costPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Selling Price (₦)</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={stockData.sellingPrice}
                        onChange={(e) => updateStockData('sellingPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    {stockData.totalBottles > 0 && (
                      <div className={styles.formGroup}>
                        <label>New Total</label>
                        <div className={styles.newTotalDisplay}>
                          <strong>{(selectedProduct.existing?.quantity ?? 0) + stockData.totalBottles}</strong>
                          <span className={styles.increase}>&nbsp;(+{stockData.totalBottles})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={submitting || stockData.totalBottles === 0}
                  >
                    {submitting ? 'Processing...' : selectedProduct.existing ? 'Restock Product' : 'Add to Inventory'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddStock
