import './ProductDetail.css'
import { useState, useEffect } from 'react'

function ProductDetail({ product, addToCart, onClose, onNavigate }) {
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [product])

  if (!product) return null

  const productImages = [
    product.image_url,
    product.image_url,
    product.image_url
  ]

  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1)
  }

  const handleAddToCart = () => {
    // Add the product with the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    alert(`Added ${quantity} x ${product.name} to cart!`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    onNavigate('cart')
  }

  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    let stars = ''
    for (let i = 1; i <= fullStars; i++) stars += '⭐'
    if (hasHalfStar) stars += '⭐'
    while (stars.length < 5) stars += '☆'
    return stars
  }

  return (
    <div className="product-detail-page">
      <button className="back-to-shop-btn" onClick={onClose}>
        ← Back to Shop
      </button>

      <div className="product-detail-container">
        {/* Left - Image Gallery */}
        <div className="product-image-gallery">
          <div className="main-image">
            <img src={productImages[activeImage]} alt={product.name} />
          </div>
          <div className="thumbnail-images">
            {productImages.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={img} alt={`${product.name} view ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right - Product Info */}
        <div className="product-info-detail">
          <div className="product-breadcrumb">
            Home / Jewellery / {product.category || 'Collection'} / {product.name}
          </div>

          <h1 className="product-name-detail">{product.name}</h1>
          
          <div className="product-rating">
            <span className="stars">{renderStars(4.5)}</span>
            <span className="rating-text">4.5 | 125 Reviews</span>
          </div>

          <div className="product-price-detail">
            <span className="current-price">Rs. {product.price}</span>
<span className="original-price">Rs. {Math.round(product.price * 1.3)}</span>
            <span className="discount-badge">-30%</span>
          </div>

          <div className="product-tax-info">
            <span>Rs. {Math.round(product.price * 1.18)}</span> incl. of all taxes
          </div>

          <div className="product-material-info">
            <p><strong>Made With:</strong> Fine {product.material || '925 Silver'}</p>
            <p><strong>Category:</strong> {product.category || 'Jewellery'}</p>
            <p><strong>SKU:</strong> SKU-{product.id || '001'}</p>
          </div>

          <div className="product-description">
            <h3>Product Description</h3>
            <p className={showFullDescription ? 'full' : 'short'}>
              {product.description || 'Beautiful handcrafted jewellery made with authentic materials. Perfect for everyday wear or special occasions. This piece showcases traditional craftsmanship with modern elegance. Each piece is carefully crafted by skilled artisans using premium quality materials.'}
            </p>
            <button 
              className="read-more-btn"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Read Less' : 'Read More'}
            </button>
          </div>

          {/* Features / Benefits */}
          <div className="product-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Easy 15 Day Return</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Lifetime Plating</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>6-Month Warranty</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔱</span>
              <span>Fine 925 Silver</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button onClick={decreaseQuantity}>−</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="add-to-cart-detail" onClick={handleAddToCart}>
              🛒 Add to Cart
            </button>
            <button className="buy-now-detail" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="delivery-item">
              <span className="delivery-icon">🚚</span>
              <div>
                <p><strong>Estimated Delivery</strong></p>
                <p className="delivery-text">Free delivery on orders above ₹10,000</p>
              </div>
            </div>
          </div>

          {/* Gift Option */}
          <div className="gift-option">
            <label>
              <input type="checkbox" />
              🎁 Wrap it for just ₹50
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail