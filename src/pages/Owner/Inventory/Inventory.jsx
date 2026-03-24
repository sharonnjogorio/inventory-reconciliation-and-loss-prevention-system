import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventoryAPI } from '../../../services/endpoints/inventory'
import EditInventoryModal from './EditInventoryModal'
import styles from './Inventory.module.css'

function Inventory() {
  const navigate = useNavigate()

  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState(null)

  // ✅ Fetch inventory (single source of truth)
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await inventoryAPI.getInventorySummary()
      const inventoryList = data.inventory || data.data || data
      setInventory(Array.isArray(inventoryList) ? inventoryList : [])
    } catch (err) {
      console.error('❌ Failed to load inventory:', err)
      setError('Failed to load inventory. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // ✅ Edit handlers
  const handleEditItem = (item) => setEditingItem(item)

  const handleSaveEdit = async (skuId, formData) => {
    try {
      const response = await inventoryAPI.updateSKUInventory(skuId, formData)
      const updatedProduct = response.product

      // Update or append if missing
      setInventory(prev => {
        const exists = prev.find(i => i.sku_id === skuId)
        if (exists) {
          return prev.map(i => i.sku_id === skuId ? { ...i, ...updatedProduct } : i)
        } else {
          return [...prev, updatedProduct]
        }
      })

      setEditingItem(null)
    } catch (err) {
      console.error('❌ Failed to update product:', err)
      alert('Failed to update product')
    }
  }

  // ✅ Search filter
  const filteredInventory = inventory.filter(item =>
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.size?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ✅ Stats
  const stats = {
    lowItems: inventory.filter(item => item.quantity > 0 && item.quantity <= 10).length,
    inStock: inventory.filter(item => item.quantity > 0).length,
    lowStock: inventory.filter(item => item.quantity > 0 && item.quantity <= 10).length,
    outOfStock: inventory.filter(item => item.quantity === 0).length
  }

  // ✅ Status helpers
  const getStatusColor = (quantity) => {
    if (quantity === 0) return styles.statusRed
    if (quantity <= 10) return styles.statusYellow
    return styles.statusGreen
  }

  const getStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock'
    if (quantity <= 10) return 'Low Stock'
    return 'In Stock'
  }

  // ✅ Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading inventory...
        </div>
      </div>
    )
  }

  // ✅ Error state
  if (error && inventory.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <h3>{error}</h3>
          <button onClick={fetchInventory} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Management</h1>
          <p className={styles.subtitle}>Track and manage your stock levels</p>
        </div>
        <button
          className={styles.addStockBtn}
          onClick={() => navigate('/owner/inventory/add')}
        >
          + ADD NEW STOCK
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className={styles.statCard}>
            <h3>{key.replace(/([A-Z])/g, ' $1')}</h3>
            <p className={styles.statValue}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by brand or size..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <div className={styles.tableWrapper}>
        {filteredInventory.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No inventory found</h3>
            <p>Add your first stock to get started</p>
            <button
              className={styles.addFirstBtn}
              onClick={() => navigate('/owner/inventory/add')}
            >
              Add Stock
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.sku_id}>
                  <td>{item.brand} {item.size}</td>
                  <td>{item.quantity} units</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusColor(item.quantity)}`}>
                      {getStatusText(item.quantity)}
                    </span>
                  </td>
                  <td>{item.updated_at ? new Date(item.updated_at).toLocaleString() : 'N/A'}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => handleEditItem(item)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditInventoryModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

export default Inventory