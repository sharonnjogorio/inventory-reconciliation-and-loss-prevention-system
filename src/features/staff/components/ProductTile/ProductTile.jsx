import styles from './ProductTile.module.css'

function ProductTile({ product, quantity, onTap }) {
  const getStockStatus = (stock = 34) => {
    if (stock <= 5) {
      return { level: 'critical', text: `! Critical: ${stock} units`, color: '#DC143C' }
    } else if (stock <= 12) {
      return { level: 'low', text: `⚠ Low: ${stock} units`, color: '#FFA500' }
    } else {
      return { level: 'normal', text: `Stock: ${stock} units`, color: '#718096' }
    }
  }

  // Create subtle background tint (10% opacity of brand color)
  const getSubtleBackground = (brandColor) => {
    // Convert hex to RGB and add alpha
    const hex = brandColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgba(${r}, ${g}, ${b}, 0.08)` // Very subtle 8% opacity
  }

  const stockStatus = getStockStatus(34)
  const subtleBackground = getSubtleBackground(product.color)

  return (
    <div 
      className={styles.tile} 
      onClick={onTap}
      style={{ 
        borderColor: product.color,
        backgroundColor: subtleBackground // Subtle brand color tint
      }}
    >
      {/* Quantity Badge */}
      {quantity > 0 && (
        <div className={styles.badge}>
          {quantity}
        </div>
      )}

      {/* Image Section with White Frame */}
      <div className={styles.imageSection}>
        <div className={styles.imageFrame}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={`${product.name} ${product.size}`}
              className={styles.productImage}
            />
          ) : (
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          )}
        </div>
      </div>

      {/* Product Info Section */}
      <div className={styles.infoSection}>
        <h3 
          className={styles.brandName}
          style={{ color: product.color }} // Brand color on name
        >
          {product.name}
        </h3>
        <p 
          className={styles.size}
          style={{ color: product.color }} // Brand color on size
        >
          {product.size}
        </p>
        <p className={styles.price}>
          ${product.price.toFixed(2)}
        </p>
        <p 
          className={styles.stock}
          style={{ color: stockStatus.color }}
        >
          {stockStatus.text}
        </p>
      </div>
    </div>
  )
}

export default ProductTile