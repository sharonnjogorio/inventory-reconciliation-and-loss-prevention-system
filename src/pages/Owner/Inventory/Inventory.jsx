import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await inventoryAPI.getInventorySummary()
      console.log('✅ Inventory loaded:', data)
      
      // Backend returns {success: true, inventory: [...]}
      const inventoryList = data.inventory || data.data || data
      setInventory(Array.isArray(inventoryList) ? inventoryList : [])
    } catch (err) {
      console.error('❌ Failed to load inventory:', err)
      setError('Failed to load inventory. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
  }

  const handleSaveEdit = async (skuId, data) => {
    try {
      await inventoryAPI.updateSKUInventory(skuId, data)
      console.log('✅ Product updated successfully')
      
      // Refresh inventory
      await fetchInventory()
      setEditingItem(null)
    } catch (err) {
      console.error('❌ Failed to update product:', err)
      throw err
    }
  }
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

  const stats = {
    lowItems: inventory.filter(item => item.quantity > 0 && item.quantity <= 10).length,
    inStock: inventory.filter(item => item.quantity > 0).length,
    lowStock: inventory.filter(item => item.quantity > 0 && item.quantity <= 10).length,
    outOfStock: inventory.filter(item => item.quantity === 0).length
  }

  const filteredInventory = inventory.filter(item =>
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.size?.toLowerCase().includes(searchTerm.toLowerCase())
  )


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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Low Items</h3>
          <p className={styles.statValue}>{stats.lowItems}</p>
        </div>
        <div className={styles.statCard}>
          <h3>In Stock</h3>
          <p className={styles.statValue}>{stats.inStock}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Low Stock</h3>
          <p className={styles.statValue}>{stats.lowStock}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Out of Stock</h3>
          <p className={styles.statValue}>{stats.outOfStock}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by product name or size..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterButtons}>
          <button className={styles.filterBtn}>Filters</button>
          <button className={styles.viewBtn}>Table View</button>
        </div>
      </div>

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
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.sku_id}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>
                        {item.brand} {item.size}
                      </span>
                    </div>
                  </td>
                  <td>{/* Category/Unit if you have it, otherwise 'Oil' or 'N/A' */}Oil</td>
                  <td>
                    <span className={styles.quantity}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusColor(item.quantity)}`}>
                      {getStatusText(item.quantity)}
                    </span>

                  </td>
                  <td className={styles.lastUpdated}>
                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <button 
                      className={styles.editBtn}
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      <div className={styles.footerCta}>
        <h2>Struggling to Track or Observe Work and Stock Levels Growth?</h2>
        <p>© 2025 Smart Loss Control • Your Data Security Matters To Us</p>
      </div>

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