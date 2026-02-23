import styles from './ProductTile.module.css'

function ProductTile({ product, quantity, onTap, onRemove }) {
  const getSubtleBackground = (brandColor) => {
    // FIX: Check if brandColor exists before using .replace()
    if (!brandColor || typeof brandColor !== 'string') {
      return 'rgba(226, 154, 92, 0.08)' // Default subtle orange
    }
    
    const hex = brandColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgba(${r}, ${g}, ${b}, 0.08)`
  }

  // FIX: Use default color if product.color is missing
  const productColor = product?.color || '#E29A5C'

  return (
    <div
      className={styles.tile}
      style={{
        borderColor: productColor,
        backgroundColor: getSubtleBackground(productColor)
      }}
    >
      {/* Quantity Badge - Click to Remove */}
      {quantity > 0 && (
        <div
          className={styles.badge}
          onClick={(e) => {
            e.stopPropagation()
            onRemove && onRemove()
          }}
          title="Tap to remove one"
        >
          <span className={styles.badgeNumber}>{quantity}</span>
        </div>
      )}

      {/* Entire tile = Click to Add */}
      <div className={styles.clickableArea} onClick={onTap}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageFrame}>
            {product.image ? (
              <img
                src={product.image}
                alt={`${product.name} ${product.size}`}
                className={styles.productImage}
              />
            ) : (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            )}
          </div>
        </div>

        {/* Product Info Section */}
        <div className={styles.infoSection}>
          <p
            className={styles.brandName}
            style={{ color: productColor }}
          >
            {product.name}
          </p>
          <p
            className={styles.size}
            style={{ color: productColor }}
          >
            {product.size}
          </p>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
          <p className={styles.stock}>Stock: 34 units</p>
        </div>
      </div>
    </div>
  )
}

export default ProductTile