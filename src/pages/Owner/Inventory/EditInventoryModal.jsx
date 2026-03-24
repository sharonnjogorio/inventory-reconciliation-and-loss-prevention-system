import { useState } from 'react'
import styles from './EditInventoryModal.module.css'

function EditInventoryModal({ item, onClose, onSave }) {
  if (!item) return null

  const [formData, setFormData] = useState({
    costPrice: item.cost_price || '',
    sellingPrice: item.selling_price || '',
    reorderLevel: item.reorder_level || 10
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    const { costPrice, sellingPrice, reorderLevel } = formData
    if (!costPrice || !sellingPrice) return setError('Cost price and selling price are required')
    if (parseFloat(sellingPrice) < parseFloat(costPrice)) return setError('Selling price must be higher than cost price')

    setSaving(true)
    try {
      await onSave(item.sku_id, {
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        reorderLevel: parseInt(reorderLevel) || 10
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update product')
      setSaving(false)
    }
  }

  const profitMargin = formData.costPrice && formData.sellingPrice
    ? (((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100).toFixed(2)
    : 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Edit Product</h2>
          <button onClick={onClose}>×</button>
        </div>

        <h3>{item.brand} {item.size}</h3>
        <p>Current Stock: {item.quantity} units</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="number" min="0" step="0.01" placeholder="Cost Price" value={formData.costPrice} onChange={e => handleChange('costPrice', e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Selling Price" value={formData.sellingPrice} onChange={e => handleChange('sellingPrice', e.target.value)} />
          <input type="number" min="0" placeholder="Reorder Level" value={formData.reorderLevel} onChange={e => handleChange('reorderLevel', e.target.value)} />

          {profitMargin > 0 && <p>Profit Margin: <strong>{profitMargin}%</strong></p>}

          <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  )
}

export default EditInventoryModal