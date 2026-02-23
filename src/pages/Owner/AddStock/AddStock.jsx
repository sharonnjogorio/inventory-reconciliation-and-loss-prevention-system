import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { inventoryAPI, skusAPI } from '../../../services'
import styles from './AddStock.module.css'

function AddStock() {
  const navigate = useNavigate()
  
  const [skus, setSKUs] = useState([])
  const [loadingSKUs, setLoadingSKUs] = useState(true)
  const [formData, setFormData] = useState({
    skuId: '',
    quantityOrdered: '',
    quantityReceived: '',
    costPrice: '',
    supplierName: '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchSKUs()
  }, [])

  const fetchSKUs = async () => {
    try {
      const response = await skusAPI.getSKUs()
      setSKUs(response.data || response)
      console.log('✅ SKUs loaded:', response)
    } catch (err) {
      console.error('❌ Failed to load SKUs:', err)
      setError('Failed to load products. Please refresh.')
    } finally {
      setLoadingSKUs(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const selectedSKU = skus.find(s => s.id === parseInt(formData.skuId))
  
  const discrepancy = formData.quantityOrdered && formData.quantityReceived 
    ? parseInt(formData.quantityOrdered) - parseInt(formData.quantityReceived)
    : 0

  const hasDiscrepancy = discrepancy !== 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.skuId || !formData.quantityReceived || !formData.costPrice) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const response = await inventoryAPI.recordRestock({
        skuId: parseInt(formData.skuId),
        quantityOrdered: parseInt(formData.quantityOrdered) || parseInt(formData.quantityReceived),
        quantityReceived: parseInt(formData.quantityReceived),
        costPrice: parseFloat(formData.costPrice),
        supplierName: formData.supplierName,
        notes: formData.notes
      })
      
      console.log('✅ Restock recorded:', response)
      
      setShowSuccess(true)
      
      setTimeout(() => {
        navigate('/owner/inventory')
      }, 2000)
      
    } catch (err) {
      console.error('❌ Restock failed:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add stock. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingSKUs) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading products...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/owner/inventory')}>
          ← Back to Inventory
        </button>
        <h1 className={styles.title}>Add New Stock</h1>
        <p className={styles.subtitle}>Record new inventory received from supplier</p>
      </div>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Product Information</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Select Product <span className={styles.required}>*</span>
              </label>
              <select 
                name="skuId"
                value={formData.skuId}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Choose a product...</option>
                {skus.map(sku => (
                  <option key={sku.id} value={sku.id}>
                    {sku.brand} {sku.size} - {sku.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedSKU && (
              <div className={styles.productPreview}>
                <div className={styles.previewInfo}>
                  <span className={styles.previewLabel}>Selected:</span>
                  <span className={styles.previewName}>
                    {selectedSKU.brand} {selectedSKU.size}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Quantity Audit</h2>
            <p className={styles.sectionNote}>
              Track ordered vs received to detect supplier errors or delivery theft
            </p>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Quantity Ordered</label>
                <input 
                  type="number"
                  name="quantityOrdered"
                  value={formData.quantityOrdered}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  className={styles.input}
                  min="0"
                />
                <span className={styles.hint}>What you ordered from supplier</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Quantity Received <span className={styles.required}>*</span>
                </label>
                <input 
                  type="number"
                  name="quantityReceived"
                  value={formData.quantityReceived}
                  onChange={handleChange}
                  placeholder="e.g., 98"
                  className={styles.input}
                  min="0"
                  required
                />
                <span className={styles.hint}>What actually arrived (enters inventory)</span>
              </div>
            </div>

            {hasDiscrepancy && (
              <div className={`${styles.discrepancyAlert} ${discrepancy > 0 ? styles.alertWarning : styles.alertInfo}`}>
                <div className={styles.alertIcon}>⚠️</div>
                <div className={styles.alertContent}>
                  <h4>Supplier Discrepancy Detected</h4>
                  <p>
                    {discrepancy > 0 
                      ? `${discrepancy} unit(s) missing from delivery`
                      : `${Math.abs(discrepancy)} extra unit(s) received`
                    }
                  </p>
                  <p className={styles.alertNote}>
                    This will be flagged in your reports for follow-up.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Pricing Information</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Cost Price (per unit) <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <span className={styles.currency}>$</span>
                  <input 
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="13.75"
                    className={styles.inputWithCurrency}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <span className={styles.hint}>USD - What you paid per unit</span>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Additional Details (Optional)</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Supplier Name</label>
              <input 
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                placeholder="e.g., Wilmar Distributors"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this delivery..."
                className={styles.textarea}
                rows="3"
              />
              <span className={styles.hint}>
                e.g., "2 bottles damaged", "Delivery was late"
              </span>
            </div>
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Restock Summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Product:</span>
                <span className={styles.summaryValue}>
                  {selectedSKU ? `${selectedSKU.brand} ${selectedSKU.size}` : 'Not selected'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Units to Add:</span>
                <span className={styles.summaryValue}>{formData.quantityReceived || '0'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total Cost:</span>
                <span className={styles.summaryValue}>
                  ${formData.quantityReceived && formData.costPrice 
                    ? (parseFloat(formData.quantityReceived) * parseFloat(formData.costPrice)).toFixed(2)
                    : '0.00'
                  }
                </span>
              </div>
              {hasDiscrepancy && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Discrepancy:</span>
                  <span className={`${styles.summaryValue} ${styles.summaryDanger}`}>
                    {discrepancy > 0 ? `-${discrepancy}` : `+${Math.abs(discrepancy)}`} units
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={() => navigate('/owner/inventory')}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner}></span>
                  Adding Stock...
                </span>
              ) : (
                'Confirm & Add to Inventory'
              )}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.modalTitle}>Stock Added Successfully!</h2>
            <p className={styles.modalText}>
              {formData.quantityReceived} units of {selectedSKU?.brand} {selectedSKU?.size} 
              {' '}have been added to your inventory.
            </p>
            {hasDiscrepancy && (
              <p className={styles.modalWarning}>
                ⚠️ Supplier discrepancy of {Math.abs(discrepancy)} units has been logged.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AddStock