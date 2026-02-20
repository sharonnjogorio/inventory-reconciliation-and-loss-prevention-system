import styles from './ProductTile.module.css'

function ProductTile({ product, quantity, onTap }) {
  return (
    <div className={styles.tile} onClick={onTap}>
      {/* Top Section - Brand Color */}
      <div 
        className={styles.brandSection}
        style={{ 
          backgroundColor: product.color,
          color: product.textColor
        }}
      >
        {/* Quantity Badge - Shows when item selected */}
        {quantity > 0 && (
          <div className={styles.badge}>
            {quantity}
          </div>
        )}
        
        {/* Product Image */}
        <div className={styles.imageWrapper}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={`${product.name} ${product.size}`}  
              className={styles.productImage}
            />
          ) : (
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Bottom Section - Product Info */}
      <div className={styles.infoSection}>
        <p className={styles.brandName}>{product.name}</p>
        <p className={styles.size}>{product.size}</p>
        <p className={styles.price}>₦{product.price.toLocaleString()}</p>
      </div>
    </div>
  )
}

export default ProductTile