import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventoryAPI } from '../../../services/endpoints/inventory'
import styles from './AddStock.module.css'
import oilBottle from '../../../assets/hero-oil-1.png'

// Popular African Cooking Oil Brands
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

function AddStock() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState([])
  const [allSKUs, setAllSKUs] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockData, setStockData] = useState({ cartons: 0, bottlesPerCarton: 12, totalBottles: 0, costPrice: 0, sellingPrice: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      // Fetch inventory summary
      const inventoryData = await inventoryAPI.getInventorySummary()
      setInventory(Array.isArray(inventoryData.inventory) ? inventoryData.inventory : [])

      // Fetch all SKUs
      const skusResponse = await fetch(`${import.meta.env.VITE_API_URL}/inventory/skus`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      const skusData = await skusResponse.json()
      setAllSKUs(skusData.skus || [])

    } catch (err) {
      console.error('❌ Failed to load data:', err)
      setError('Failed to load data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Check if product already exists in inventory
  const getExistingInventory = (brand) =>
    inventory.find(item => item.brand.toLowerCase() === brand.toLowerCase() && item.size === '1L')

  const handleProductSelect = (product) => {
    const existing = getExistingInventory(product.brand)
    setSelectedProduct({ ...product, existing })
    setStockData({
      cartons: 0,
      bottlesPerCarton: 12,
      totalBottles: 0,
      costPrice: existing?.cost_price || 0,
      sellingPrice: existing?.selling_price || 0
    })
    setError('')
    setSuccess('')
  }

  const updateStockData = (field, value) => {
    setStockData(prev => {
      const updated = { ...prev, [field]: parseFloat(value) || 0 }
      if (field === 'cartons' || field === 'bottlesPerCarton') updated.totalBottles = updated.cartons * updated.bottlesPerCarton
      return updated
    })
  }

  const handleSubmit = async () => {
    if (!selectedProduct) return setError('Please select a product')
    if (stockData.totalBottles <= 0) return setError('Please enter quantity')
    if (!stockData.costPrice || !stockData.sellingPrice) return setError('Please enter cost and selling prices')
    if (stockData.sellingPrice < stockData.costPrice) return setError('Selling price should be higher than cost price')

    setSubmitting(true)
    setError('')

    try {
      let skuId
      const matchingSKU = allSKUs.find(sku => sku.brand.toLowerCase() === selectedProduct.brand.toLowerCase() && sku.size === '1L')

      if (matchingSKU) {
        skuId = matchingSKU.id
      } else {
        const createData = await inventoryAPI.createSKU({
          brand: selectedProduct.brand,
          size: '1L',
          is_carton: false,
          units_per_carton: stockData.bottlesPerCarton
        })
        skuId = createData.sku.id
        setAllSKUs(prev => [...prev, createData.sku])
      }

      await inventoryAPI.recordRestock({
        skuId,
        orderedQty: stockData.totalBottles,
        receivedQty: stockData.totalBottles,
        costPrice: stockData.costPrice,
        sellPrice: stockData.sellingPrice,
        supplierName: selectedProduct.existing ? 'Restock' : 'Initial Stock',
        referenceNote: `${stockData.cartons} cartons × ${stockData.bottlesPerCarton} bottles`
      })

      setSuccess(`✅ ${selectedProduct.name} ${selectedProduct.existing ? 'restocked' : 'added'} successfully!`)
      await fetchData()

      setTimeout(() => {
        setSelectedProduct(null)
        setStockData({ cartons: 0, bottlesPerCarton: 12, totalBottles: 0, costPrice: 0, sellingPrice: 0 })
        setSuccess('')
      }, 2000)

    } catch (err) {
      console.error('❌ Failed to add stock:', err)
      setError(err.message || 'Failed to add stock')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add Stock</h1>
        <button onClick={() => navigate('/owner/inventory')}>&larr; Back</button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.productsGrid}>
        {AFRICAN_OIL_BRANDS.map(product => {
          const existing = getExistingInventory(product.brand)
          const selected = selectedProduct?.id === product.id
          return (
            <div key={product.id} className={`${styles.productCard} ${selected ? styles.selected : ''}`} onClick={() => handleProductSelect(product)} style={{ borderColor: selected ? product.color : '#ddd' }}>
              {existing && <div className={styles.badge}>In Stock: {existing.quantity}</div>}
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <span className={styles.statusBadge} style={{ background: existing ? '#e29a5c' : '#10b981' }}>
                {existing ? 'Restock' : 'Add New'}
              </span>
            </div>
          )
        })}
      </div>

      {selectedProduct && (
        <div className={styles.formSection}>
          <h2>{selectedProduct.existing ? 'Restock' : 'Add'} {selectedProduct.name}</h2>
          {selectedProduct.existing && <p>Current Stock: {selectedProduct.existing.quantity} bottles</p>}
          <div className={styles.formRow}>
            <input type="number" min="0" placeholder="Cartons" value={stockData.cartons} onChange={e => updateStockData('cartons', e.target.value)} />
            <input type="number" min="1" placeholder="Bottles per carton" value={stockData.bottlesPerCarton} onChange={e => updateStockData('bottlesPerCarton', e.target.value)} />
            <input type="number" placeholder="Total Bottles" value={stockData.totalBottles} disabled />
          </div>
          <div className={styles.formRow}>
            <input type="number" min="0" step="0.01" placeholder="Cost Price" value={stockData.costPrice} onChange={e => updateStockData('costPrice', e.target.value)} />
            <input type="number" min="0" step="0.01" placeholder="Selling Price" value={stockData.sellingPrice} onChange={e => updateStockData('sellingPrice', e.target.value)} />
          </div>
          <button onClick={handleSubmit} disabled={submitting || stockData.totalBottles === 0}>
            {submitting ? 'Processing...' : selectedProduct.existing ? 'Restock Product' : 'Add to Inventory'}
          </button>
        </div>
      )}
    </div>
  )
}

export default AddStock