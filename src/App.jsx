import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ProductCard from './components/ProductCard'
import LoginModal from './components/LoginModal'
import AdminPanel from './components/AdminPanel'
import UserDashboard from './components/UserDashboard'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [activePage, setActivePage] = useState('home')
  const [selectedZodiac, setSelectedZodiac] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [blogPosts, setBlogPosts] = useState([])
  const [isPublicView, setIsPublicView] = useState(false)
  
  // Single selection per category
  const [selectedType, setSelectedType] = useState(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  
  // Fetch blog posts from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/news')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogPosts(data)
        }
      })
      .catch(error => console.error('Error fetching blog posts:', error))
  }, [])
  
  const categoryMapping = {
    'Rings': 'Ring',
    'Necklaces': 'Necklace',
    'Earrings': 'Earrings',
    'Bracelets': 'Bracelet',
    'Pendants': 'Pendant',
    'Anklets': 'Anklet'
  }
  
  const addFilter = (filterType, filterValue) => {
    if (filterType === 'type') {
      const dbCategory = categoryMapping[filterValue] || filterValue
      setSelectedType(selectedType === dbCategory ? null : dbCategory)
    } else if (filterType === 'price') {
      setSelectedPriceRange(selectedPriceRange === filterValue ? null : filterValue)
    } else if (filterType === 'collection') {
      setSelectedMaterial(selectedMaterial === filterValue ? null : filterValue)
    }
    setShowCategoryDropdown(false)
    setActivePage('home')
    scrollToTop()
  }

  const removeFilter = (type) => {
    if (type === 'type') setSelectedType(null)
    if (type === 'price') setSelectedPriceRange(null)
    if (type === 'material') setSelectedMaterial(null)
  }

  const clearAllFilters = () => {
    setSelectedType(null)
    setSelectedPriceRange(null)
    setSelectedMaterial(null)
    setActivePage('home')
    scrollToTop()
  }

  const matchesPriceRange = (price, range) => {
    if (!range) return true
    switch(range) {
      case 'Under ₹2000': return price < 2000
      case '₹2000 - ₹5000': return price >= 2000 && price <= 5000
      case '₹5000 - ₹10000': return price >= 5000 && price <= 10000
      case '₹10000 - ₹15000': return price >= 10000 && price <= 15000
      case 'Above ₹15000': return price > 15000
      default: return true
    }
  }

  const handleMaterialFilter = (material) => {
    setSelectedMaterial(selectedMaterial === material ? null : material)
  }

  // Hero section slides
  const heroSlides = [
    {
      image: 'https://www.tibetansilver.com/wp-content/uploads/2025/03/goldish-1910574079-1.jpg',
      title: 'Silver Collection',
      subtitle: 'Handcrafted with techniques'
    },
    {
      image: 'https://energymuse.com/cdn/shop/articles/bestcrystalsforhealingailments_1400x.jpg?v=1674028892',
      title: 'Crystal Gemstones',
      subtitle: 'Healing crystals & natural stones'
    },
    {
      image: 'https://besilvered.com/cdn/shop/files/Be-Silvered-Social-Share_fd84e873-b7d6-4bb8-84aa-ce49bd280aea_1200x1200.png?v=1610851961',
      title: 'Tibetian Silver Jewellery',
      subtitle: 'Traditional designs with modern elegance'
    }
  ]

  const categoryItems = {
    'Jewellery Types': ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Anklets'],
    'Price Range': ['Under ₹2000', '₹2000 - ₹5000', '₹5000 - ₹10000', '₹10000 - ₹15000', 'Above ₹15000'],
    'Collections': ['Silver', 'Copper', 'Crystal', 'Gemstone']
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateTo = (page, extraAction = null) => {
    setActivePage(page)
    if (extraAction) extraAction()
    scrollToTop()
  }

  // Go to public view while staying logged in
  const goToPublicView = () => {
    setIsPublicView(true)
    setActivePage('home')
    scrollToTop()
  }

  // Go back to admin dashboard
  const goBackToAdmin = () => {
    setIsPublicView(false)
    setActivePage('admin')
    scrollToTop()
  }

  const performSearch = () => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      const results = getFilteredProducts().filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.material && p.material.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      )
      setSearchResults(results)
      setShowSuggestions(false)
      setActivePage('search')
      scrollToTop()
    }
  }

  const saleProductNames = ['Discounted Silver Earrings', 'Clearance Copper Bracelet']
  const birthdayGiftNames = ['Birthday Gift - Gemstone Bracelet']
  const weddingProductNames = ['Silver Wedding Band', 'Bridal Silver Necklace Set', 'Copper Wedding Ring']
  const zodiacProductNames = [
    'Aries Gemstone Bracelet', 'Taurus Gemstone Bracelet', 'Gemini Gemstone Bracelet',
    'Cancer Gemstone Bracelet', 'Leo Gemstone Bracelet', 'Virgo Gemstone Bracelet',
    'Libra Gemstone Bracelet', 'Scorpio Gemstone Bracelet', 'Sagittarius Gemstone Bracelet',
    'Capricorn Gemstone Bracelet', 'Aquarius Gemstone Bracelet', 'Pisces Gemstone Bracelet'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('http://localhost:5001/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error:', error))
  }, [])

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const getNonZodiacProducts = () => products.filter(p => !zodiacProductNames.includes(p.name))

  const getFilteredProducts = () => {
    let filtered = getNonZodiacProducts()
    
    if (selectedType) {
      filtered = filtered.filter(p => p.category === selectedType)
    }
    
    if (selectedPriceRange) {
      filtered = filtered.filter(p => matchesPriceRange(p.price, selectedPriceRange))
    }
    
    if (selectedMaterial) {
      filtered = filtered.filter(p => p.material === selectedMaterial)
    }
    
    return filtered
  }

  const getSearchSuggestions = () => {
    if (!searchTerm.trim() || searchTerm.length < 1) return []
    const term = searchTerm.toLowerCase()
    const allProducts = getNonZodiacProducts()
    const matches = allProducts.filter(p => 
      p.name.toLowerCase().includes(term) ||
      (p.material && p.material.toLowerCase().includes(term))
    )
    const uniqueNames = []
    const seen = new Set()
    for (const p of matches) {
      if (!seen.has(p.name)) {
        seen.add(p.name)
        uniqueNames.push(p)
      }
    }
    return uniqueNames.slice(0, 5)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  }

  const handleSuggestionClick = (productName) => {
    setSearchTerm(productName)
    setShowSuggestions(false)
    setTimeout(() => performSearch(), 10)
  }

  const filteredProducts = getFilteredProducts()

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? {...item, quantity: item.quantity + 1} : item
      ))
    } else {
      setCart([...cart, {...product, quantity: 1}])
    }
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => item.id === productId ? {...item, quantity: newQty} : item))
    }
  }

  const getTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const toggleWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id))
    } else {
      setWishlist([...wishlist, product])
    }
  }

  const isInWishlist = (productId) => wishlist.some(item => item.id === productId)

  const handleLogout = () => {
    setUser(null)
    setIsPublicView(false)
    setActivePage('home')
    setCart([])
    setWishlist([])
    alert('Logged out successfully!')
  }

  // Place order function
  const placeOrder = async () => {
    // Check if user is logged in
    if (!user) {
      alert('Please login first to place your order!')
      setShowLogin(true)
      return false
    }

    // Check if cart is empty
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return false
    }

    try {
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: getTotal()
        })
      })

      if (response.ok) {
        alert('Order placed successfully! Thank you for shopping with us!')
        // Clear cart after successful order
        setCart([])
        return true
      } else {
        const error = await response.json()
        alert('Failed to place order: ' + (error.error || 'Unknown error'))
        return false
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
      return false
    }
  }

  const getGiftingProducts = () => getNonZodiacProducts().filter(p => p.price > 2000)
  const getBirthdayGiftProducts = () => products.filter(p => birthdayGiftNames.includes(p.name))
  const getWeddingProducts = () => products.filter(p => weddingProductNames.includes(p.name))

  const zodiacSigns = [
    { name: 'Aries', emoji: '♈', productName: 'Aries Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Taurus', emoji: '♉', productName: 'Taurus Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Gemini', emoji: '♊', productName: 'Gemini Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Cancer', emoji: '♋', productName: 'Cancer Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Leo', emoji: '♌', productName: 'Leo Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Virgo', emoji: '♍', productName: 'Virgo Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Libra', emoji: '♎', productName: 'Libra Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Scorpio', emoji: '♏', productName: 'Scorpio Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Sagittarius', emoji: '♐', productName: 'Sagittarius Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Capricorn', emoji: '♑', productName: 'Capricorn Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Aquarius', emoji: '♒', productName: 'Aquarius Gemstone Bracelet', stone: 'Gemstones' },
    { name: 'Pisces', emoji: '♓', productName: 'Pisces Gemstone Bracelet', stone: 'Gemstones' }
  ]

  const getZodiacProduct = (sign) => products.find(p => p.name === sign.productName)
  const openImageModal = (product) => setSelectedProduct(product)
  const closeImageModal = () => setSelectedProduct(null)

  const suggestions = getSearchSuggestions()
  const currentProducts = activePage === 'search' && searchResults.length > 0 ? searchResults : 
                         activePage === 'home' ? filteredProducts :
                         activePage === 'all' ? getNonZodiacProducts() :
                         activePage === 'new' ? getNonZodiacProducts().slice(0, 8) : []

  const hasActiveFilters = selectedType || selectedPriceRange || selectedMaterial

  const WishlistHeart = ({ isActive, onClick }) => (
    <button className={`wishlist-btn ${isActive ? 'active' : ''}`} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
          stroke="#ff4444" strokeWidth="1.8" fill={isActive ? "#ff4444" : "none"}/>
      </svg>
    </button>
  )

  // Check if we should show the top bar (not in admin panel AND not in dashboard)
  const showTopBar = !(activePage === 'admin' && !isPublicView) && activePage !== 'dashboard'

  // Only show Header when NOT in admin panel AND NOT in dashboard
  const showHeader = !(activePage === 'admin' && !isPublicView) && activePage !== 'dashboard'

  return (
    <div className="app">
      {/* Top Bar - Only show when NOT in admin panel and NOT in dashboard */}
      {showTopBar && (
        <div className="top-bar">
          <p>✨ Free Shipping on orders above Rs. 10,000 all over inside the valley. ✨</p>
        </div>
      )}

      {/* Only show Header when NOT in admin panel and NOT in dashboard */}
      {showHeader && (
        <Header 
          user={user}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          onLoginClick={() => setShowLogin(true)}
          onNavigate={navigateTo}
          activePage={activePage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={performSearch}
          onSearchKeyPress={handleSearchKeyPress}
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          showSuggestions={showSuggestions}
          isPublicView={isPublicView}
          onGoToPublicView={goToPublicView}
          onGoBackToAdmin={goBackToAdmin}
          onLogout={handleLogout}
        />
      )}

      {showLogin && !user && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(userData) => {
            setUser(userData)
            setIsPublicView(false)
            if (userData.role === 'admin') {
              setActivePage('admin')
            } else {
              setActivePage('home')
            }
          }}
        />
      )}

      {/* HOME PAGE - Only show when not in admin panel */}
      {activePage === 'home' && !(activePage === 'admin' && !isPublicView) && (
        <>
          <div className="hero-slider">
            {heroSlides.map((slide, index) => (
              <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})` }}>
                <div className="slide-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.subtitle}</p>
                  <button className="shop-now-btn" onClick={() => navigateTo('all')}>Shop Now →</button>
                </div>
              </div>
            ))}
            <div className="slider-dots">
              {heroSlides.map((_, index) => (
                <span key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></span>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="active-filters">
              <span>Active Filters:</span>
              {selectedType && <span className="filter-tag">{selectedType}s <button onClick={() => removeFilter('type')}>✕</button></span>}
              {selectedPriceRange && <span className="filter-tag">{selectedPriceRange} <button onClick={() => removeFilter('price')}>✕</button></span>}
              {selectedMaterial && <span className="filter-tag">{selectedMaterial} <button onClick={() => removeFilter('material')}>✕</button></span>}
              <button className="clear-filters" onClick={clearAllFilters}>Clear All</button>
            </div>
          )}

          <div className="category-tabs">
            <button className={!selectedMaterial && !selectedType && !selectedPriceRange ? 'active' : ''} onClick={clearAllFilters}>All Jewellery</button>
            <button className={selectedMaterial === 'Silver' ? 'active' : ''} onClick={() => handleMaterialFilter('Silver')}>925 Silver ✨</button>
            <button className={selectedMaterial === 'Copper' ? 'active' : ''} onClick={() => handleMaterialFilter('Copper')}>Copper 🔶</button>
            <button className={selectedMaterial === 'Crystal' ? 'active' : ''} onClick={() => handleMaterialFilter('Crystal')}>Crystals 💎</button>
            <button className={selectedMaterial === 'Gemstone' ? 'active' : ''} onClick={() => handleMaterialFilter('Gemstone')}>Gemstones 🌈</button>
          </div>

          <div className="products-grid-container">
            <div className="products-grid">
              {currentProducts.length === 0 ? (
                <div className="no-results">
                  <p>No products found.</p>
                  <button className="clear-filters-btn" onClick={clearAllFilters}>Clear Filters</button>
                </div>
              ) : (
                currentProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    isInWishlist={isInWishlist(product.id)}
                    onImageClick={openImageModal}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* CART PAGE */}
      {activePage === 'cart' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content cart-page">
          <button className="back-btn" onClick={() => navigateTo('home')}>← Continue Shopping</button>
          <h2 className="page-title">🛒 Your Shopping Cart</h2>
          {cart.length === 0 ? (
            <div className="empty-cart"><p>Your cart is empty</p><button className="shop-now-btn" onClick={() => navigateTo('home')}>Continue Shopping</button></div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item-row">
                    <img src={item.image_url} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>{item.material}</p>
                      <p className="cart-item-price">₹{item.price}</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">
                      <p>₹{item.price * item.quantity}</p>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <div className="cart-summary-row"><span>Subtotal:</span><span>₹{getTotal()}</span></div>
                <div className="cart-summary-row"><span>Shipping:</span><span>Free</span></div>
                <div className="cart-summary-row.total"><span>Total:</span><span>₹{getTotal()}</span></div>
                <button className="checkout-btn" onClick={placeOrder}>Proceed to Checkout →</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* WISHLIST PAGE */}
      {activePage === 'wishlist' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content wishlist-page">
          <button className="back-btn" onClick={() => navigateTo('home')}>← Back to Home</button>
          <h2 className="page-title">❤️ My Wishlist</h2>
          {wishlist.length === 0 ? (
            <div className="empty-wishlist"><p>Your wishlist is empty</p><button className="shop-now-btn" onClick={() => navigateTo('home')}>Start Shopping</button></div>
          ) : (
            <div className="products-grid">
              {wishlist.map(product => (
                <div key={product.id} className="product-card">
                  <img src={product.image_url} alt={product.name} onClick={() => openImageModal(product)} />
                  <h3>{product.name}</h3>
                  <p className="material">{product.material} | {product.category}</p>
                  <div className="price-row"><span className="price">₹{product.price}</span></div>
                  <div className="product-buttons">
                    <button onClick={() => addToCart(product)}>Add to Cart 🛒</button>
                    <WishlistHeart isActive={true} onClick={() => toggleWishlist(product)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW ARRIVALS PAGE */}
      {activePage === 'new' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <h2 className="page-title">✨ New Arrivals ✨</h2>
          <p className="page-subtitle">Discover our latest handmade jewellery collection</p>
          <div className="products-grid">
            {getNonZodiacProducts().slice(0, 8).map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ALL JEWELLERY PAGE */}
      {activePage === 'all' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <h2 className="page-title">All Jewellery Collection</h2>
          <p className="page-subtitle">Browse our complete collection</p>
          <div className="products-grid">
            {getNonZodiacProducts().map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* GIFTING PAGE */}
      {activePage === 'gifting' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <h2 className="page-title">🎁 Gifting Collection</h2>
          <p className="page-subtitle">Perfect gifts for your loved ones</p>
          <div className="gifting-banners">
            <div className="gift-banner" onClick={() => navigateTo('anniversary')}><h3>💝 Anniversary Gifts</h3><p>Silver & Gemstone sets</p><button className="small-btn">Shop Now →</button></div>
            <div className="gift-banner" onClick={() => navigateTo('birthday')}><h3>🎂 Birthday Special</h3><p>Personalized birthday gifts</p><button className="small-btn">Shop Now →</button></div>
            <div className="gift-banner" onClick={() => navigateTo('weddinggift')}><h3>💒 Wedding Collection</h3><p>Traditional Tibetan designs</p><button className="small-btn">Shop Now →</button></div>
          </div>
          <h3 className="section-title">Premium Gifts</h3>
          <div className="products-grid">
            {getGiftingProducts().slice(0, 6).map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ZODIAC PAGE */}
      {activePage === 'zodiac' && !selectedZodiac && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <h2 className="page-title">🔮 Zodiac Jewellery</h2>
          <p className="page-subtitle">Find your zodiac sign</p>
          <div className="zodiac-grid">
            {zodiacSigns.map(sign => (
              <div key={sign.name} className="zodiac-card" onClick={() => setSelectedZodiac(sign)}>
                <div className="zodiac-icon">{sign.emoji}</div>
                <h3>{sign.name}</h3>
                <button className="small-btn">Shop Now</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZODIAC PRODUCT PAGE */}
      {activePage === 'zodiac' && selectedZodiac && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <button className="back-btn" onClick={() => setSelectedZodiac(null)}>← Back to Zodiac Signs</button>
          <h2 className="page-title">{selectedZodiac.emoji} {selectedZodiac.name} Collection</h2>
          <p className="page-subtitle">Your lucky gemstone: {selectedZodiac.stone}</p>
          <div className="products-grid">
            {getZodiacProduct(selectedZodiac) && (
              <ProductCard 
                product={getZodiacProduct(selectedZodiac)}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(getZodiacProduct(selectedZodiac).id)}
                onImageClick={openImageModal}
              />
            )}
          </div>
        </div>
      )}

      {/* WEDDING PAGE */}
      {activePage === 'wedding' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <h2 className="page-title">💍 Wedding Collection</h2>
          <p className="page-subtitle">Traditional wedding jewellery</p>
          <div className="products-grid">
            {getWeddingProducts().map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* BLOG PAGE */}
      {activePage === 'blog' && !selectedBlog && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <h2 className="page-title">📝 Our Blog</h2>
          <p className="page-subtitle">Latest news, tips, and stories from Siddhi Jewells</p>
          <div className="blog-grid">
            {blogPosts.length > 0 ? (
              blogPosts.map(blog => (
                <div key={blog.id} className="blog-card" onClick={() => setSelectedBlog(blog)}>
                  <div className="blog-image">📄</div>
                  <h3>{blog.title}</h3>
                  <p>{blog.content?.substring(0, 100)}...</p>
                  <button className="read-more">Read More →</button>
                </div>
              ))
            ) : (
              <p style={{textAlign: 'center', width: '100%'}}>No blog posts yet. Check back soon!</p>
            )}
          </div>
        </div>
      )}

      {/* INDIVIDUAL BLOG POST */}
      {activePage === 'blog' && selectedBlog && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content blog-post-page">
          <button className="back-btn" onClick={() => setSelectedBlog(null)}>← Back to All Posts</button>
          <div className="blog-post-container">
            <div className="blog-post-header">
              <div className="blog-post-icon">📄</div>
              <h1 className="blog-post-title">{selectedBlog.title}</h1>
              <p className="blog-date">{selectedBlog.date ? new Date(selectedBlog.date).toLocaleDateString() : 'Recent'}</p>
            </div>
            <div className="blog-post-content">
              {selectedBlog.content?.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            <div className="blog-post-footer">
              <button className="share-btn">📤 Share this post</button>
              <button className="back-to-blog-btn" onClick={() => setSelectedBlog(null)}>← Back to Blog</button>
            </div>
          </div>
        </div>
      )}

      {/* SALE PAGE */}
      {activePage === 'sale' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <div className="sale-header"><h2 className="page-title">🔥 SALE 🔥</h2><p className="page-subtitle">Up to 50% off!</p></div>
          <div className="products-grid">
            {getNonZodiacProducts().filter(product => saleProductNames.includes(product.name)).map(product => (
              <div key={product.id} className="product-card sale-card">
                <div className="sale-badge">SALE 50% OFF</div>
                <img src={product.image_url} alt={product.name} onClick={() => openImageModal(product)} />
                <h3>{product.name}</h3>
                <p className="material">{product.material}</p>
                <div className="price-row">
                  <span className="price">₹{Math.round(product.price * 0.5)}</span>
                  <span className="original-price">₹{product.price}</span>
                  <span className="discount">-50%</span>
                </div>
                <div className="product-buttons">
                  <button onClick={() => addToCart(product)}>Grab Deal →</button>
                  <WishlistHeart isActive={isInWishlist(product.id)} onClick={() => toggleWishlist(product)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNIVERSARY GIFTS PAGE */}
      {activePage === 'anniversary' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <button className="back-btn" onClick={() => navigateTo('gifting')}>← Back to Gifting</button>
          <h2 className="page-title">💝 Anniversary Gifts</h2>
          <p className="page-subtitle">Perfect silver & gemstone gifts</p>
          <div className="products-grid">
            {getNonZodiacProducts().filter(p => p.material === 'Silver' || p.material === 'Gemstone').slice(0, 8).map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* BIRTHDAY GIFTS PAGE */}
      {activePage === 'birthday' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <button className="back-btn" onClick={() => navigateTo('gifting')}>← Back to Gifting</button>
          <h2 className="page-title">🎂 Birthday Special Gifts</h2>
          <p className="page-subtitle">Personalized birthday gifts</p>
          <div className="products-grid">
            {getBirthdayGiftProducts().map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* WEDDING GIFT PAGE */}
      {activePage === 'weddinggift' && !(activePage === 'admin' && !isPublicView) && (
        <div className="page-content">
          <button className="back-btn" onClick={() => navigateTo('gifting')}>← Back to Gifting</button>
          <h2 className="page-title">💒 Wedding Gift Collection</h2>
          <p className="page-subtitle">Traditional wedding gifts</p>
          <div className="products-grid">
            {getWeddingProducts().map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                onImageClick={openImageModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ADMIN PANEL - No navigation bar, only admin menu */}
      {activePage === 'admin' && user?.role === 'admin' && !isPublicView && (
        <AdminPanel 
          products={products}
          setProducts={setProducts}
          onClose={() => setActivePage('home')}
          onLogout={handleLogout}
          user={user}
          onGoToPublicView={goToPublicView}
        />
      )}

      {/* USER DASHBOARD - Full page - No header/footer */}
      {activePage === 'dashboard' && user && user.role !== 'admin' && (
        <UserDashboard 
          user={user}
          wishlist={wishlist}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          onLogout={handleLogout}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getTotal={getTotal}
          onNavigate={navigateTo}
          placeOrder={placeOrder}
        />
      )}

      {/* IMAGE MODAL */}
      {selectedProduct && (
        <div className="modal image-modal" onClick={closeImageModal}>
          <div className="modal-content image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeImageModal}>✕</button>
            <img src={selectedProduct.image_url} alt={selectedProduct.name} className="enlarged-image" />
            <h3>{selectedProduct.name}</h3>
            <p className="material">{selectedProduct.material} | {selectedProduct.category}</p>
            <p className="price">₹{selectedProduct.price}</p>
            <p className="description">{selectedProduct.description}</p>
            <button className="add-to-cart-modal" onClick={() => { addToCart(selectedProduct); closeImageModal(); }}>Add to Cart 🛒</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default App