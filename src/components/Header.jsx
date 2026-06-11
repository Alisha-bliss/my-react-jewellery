import { useState } from 'react'

function Header({ user, cartCount, wishlistCount, onLoginClick, onNavigate, activePage, searchTerm, onSearchChange, onSearchSubmit, onSearchKeyPress, suggestions, onSuggestionClick, showSuggestions, isPublicView, onGoToPublicView, onGoBackToAdmin, onLogout }) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const categoryItems = {
    'Jewellery Types': ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Anklets'],
    'Price Range': ['Under ₹2000', '₹2000 - ₹5000', '₹5000 - ₹10000', '₹10000 - ₹15000', 'Above ₹15000'],
    'Collections': ['Silver', 'Copper', 'Crystal', 'Gemstone']
  }

  return (
    <header className="header">
      <div className="header-main">
        <div className="logo">
          <div className="logo-brand">
            <span className="siddhi">SIDDHI</span>
            <span className="jewells">JEWELLS</span>
          </div>
          <p>• Silver • Metal • Copper • Brass • Gemstones</p>
        </div>
        
        <div className="header-controls">
          <div className="search-container">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search for jewellery..." 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={onSearchKeyPress}
              />
              <button className="search-btn" onClick={onSearchSubmit}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                  <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((product, idx) => (
                  <div key={idx} className="suggestion-item" onClick={() => onSuggestionClick(product.name)}>
                    <span className="suggestion-icon">🔍</span>
                    <span className="suggestion-name">{product.name}</span>
                    <span className="suggestion-category">{product.material}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button className="action-icon" onClick={onLoginClick}>
              <svg className="icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              </svg>
              <span className="action-label">{user ? user.name : 'ACCOUNT'}</span>
            </button>
            
            <button className="action-icon" onClick={() => onNavigate('wishlist')}>
              <svg className="icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              </svg>
              <span className="action-label">WISHLIST</span>
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </button>
            
            <button className="action-icon" onClick={() => onNavigate('cart')}>
              <svg className="icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="21" r="1.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <circle cx="18" cy="21" r="1.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <path d="M2 2h4l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L22 6H5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              </svg>
              <span className="action-label">CART</span>
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
      
      <nav className="nav-menu">
        <button onClick={() => onNavigate('home')} className={activePage === 'home' ? 'active-nav' : ''}>HOME</button>
        <button onClick={() => onNavigate('new')} className={activePage === 'new' ? 'active-nav' : ''}>NEW ARRIVALS</button>
        <button onClick={() => onNavigate('all')} className={activePage === 'all' ? 'active-nav' : ''}>ALL JEWELLERY</button>
        
        <div className="dropdown-container" onMouseLeave={() => setShowCategoryDropdown(false)}>
          <button className="dropdown-trigger" onMouseEnter={() => setShowCategoryDropdown(true)}>
            SHOP BY CATEGORY ▼
          </button>
          {showCategoryDropdown && (
            <div className="dropdown-menu" onMouseEnter={() => setShowCategoryDropdown(true)}>
              {Object.entries(categoryItems).map(([section, items]) => (
                <div key={section} className="dropdown-section">
                  <h4>{section}</h4>
                  {items.map(item => (
                    <button key={item} className="dropdown-item">{item}</button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button onClick={() => onNavigate('gifting')} className={activePage === 'gifting' ? 'active-nav' : ''}>GIFTING</button>
        <button onClick={() => onNavigate('zodiac')} className={activePage === 'zodiac' ? 'active-nav' : ''}>ZODIAC</button>
        <button onClick={() => onNavigate('wedding')} className={activePage === 'wedding' ? 'active-nav' : ''}>WEDDING</button>
        <button onClick={() => onNavigate('blog')} className={activePage === 'blog' ? 'active-nav' : ''}>BLOG</button>
        <button onClick={() => onNavigate('sale')} className={activePage === 'sale' ? 'active-nav' : ''}>SALE</button>
        
        {/* If admin is viewing public site, show Admin Panel and Logout buttons side by side */}
        {user && user.role === 'admin' && isPublicView && (
          <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
            <button 
              onClick={onGoBackToAdmin} 
              style={{ background: '#8B4513', color: 'white', padding: '8px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              👑 ADMIN PANEL
            </button>
            <button 
              onClick={onLogout} 
              style={{ background: '#dc3545', color: 'white', padding: '8px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              LOGOUT
            </button>
          </div>
        )}
        
        {/* Show DASHBOARD button for regular users */}
        {user && user.role !== 'admin' && (
          <button onClick={() => onNavigate('dashboard')} className={activePage === 'dashboard' ? 'active-nav' : ''}>
            MY DASHBOARD
          </button>
        )}
      </nav>
    </header>
  )
}

export default Header