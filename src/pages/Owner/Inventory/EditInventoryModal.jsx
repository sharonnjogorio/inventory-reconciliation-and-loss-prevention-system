import { useState } from 'react'
import styles from './EditInventoryModal.module.css'

function EditInventoryModal({ item, onClose, onSave }) {
  // ✅ initialize directly from prop instead of using useEffect + setState
  const [formData, setFormData] = useState({
    costPrice: item?.cost_price || '',
    sellingPrice: item?.selling_price || '',
    reorderLevel: item?.reorder_level || 10
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.costPrice || !formData.sellingPrice) {
      setError('Cost price and selling price are required')
      return
    }

    if (parseFloat(formData.costPrice) <= 0 || parseFloat(formData.sellingPrice) <= 0) {
      setError('Prices must be greater than 0')
      return
    }

    if (parseFloat(formData.sellingPrice) < parseFloat(formData.costPrice)) {
      setError('Selling price should be higher than cost price')
      return
    }

    setSaving(true)
    try {
      await onSave(item.sku_id, {
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        reorderLevel: parseInt(formData.reorderLevel) || 10
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product')
      setSaving(false)
    }
  }

  if (!item) return null

  const profitMargin = formData.costPrice && formData.sellingPrice
    ? (((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100).toFixed(2)
    : 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Edit Product</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.productInfo}>
          <h3>{item.brand} {item.size}</h3>
          <p>Current Stock: {item.quantity} units</p>
        </div>

        {error && (
          <div className={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Cost Price (per bottle)</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.currencyIcon}>$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                placeholder="0.00"
                className={styles.priceInput}
                required
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
                value={formData.sellingPrice}
                onChange={(e) => handleChange('sellingPrice', e.target.value)}
                placeholder="0.00"
                className={styles.priceInput}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Reorder Level (Low stock alert)</label>
            <input
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={(e) => handleChange('reorderLevel', e.target.value)}
              placeholder="10"
              required
            />
            <small>You'll be alerted when stock falls below this level</small>
          </div>

          {profitMargin > 0 && (
            <div className={styles.profitInfo}>
              <span>Profit Margin:</span>
              <strong className={profitMargin >= 20 ? styles.goodMargin : styles.lowMargin}>
                {profitMargin}%
              </strong>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditInventoryModal