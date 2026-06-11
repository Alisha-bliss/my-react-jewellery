function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist, onImageClick }) {
  return (
    <div className="product-card">
      <div className="product-badge">NEW</div>
      <img src={product.image_url} alt={product.name} onClick={() => onImageClick(product)} />
      <h3>{product.name}</h3>
      <p className="material">{product.material} | {product.category}</p>
      <div className="price-row">
        <span className="price">₹{product.price}</span>
        <span className="original-price">₹{Math.round(product.price * 1.3)}</span>
        <span className="discount">-30%</span>
      </div>
      <div className="product-buttons">
        <button onClick={() => onAddToCart(product)}>Add to Cart 🛒</button>
        <button 
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`} 
          onClick={() => onToggleWishlist(product)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
              stroke="#ff4444" strokeWidth="1.8" fill={isInWishlist ? "#ff4444" : "none"}/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ProductCard