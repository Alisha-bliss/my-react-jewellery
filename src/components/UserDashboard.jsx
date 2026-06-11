import './UserDashboard.css'
import { useState } from 'react'

function UserDashboard({ user, wishlist, addToCart, toggleWishlist, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="user-avatar">
            <div className="avatar-icon">👤</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
          <nav className="dashboard-nav">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              👤 My Profile
            </button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              📋 My Orders
            </button>
            <button className={activeTab === 'wishlist' ? 'active' : ''} onClick={() => setActiveTab('wishlist')}>
              ❤️ Wishlist ({wishlist.length})
            </button>
            <button className="logout-btn" onClick={onLogout}>
              🚪 Logout
            </button>
          </nav>
        </div>
        <div className="dashboard-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>My Profile</h2>
              <div className="profile-info">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                <p><strong>Member Since:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>My Orders</h2>
              <p>No orders yet. Start shopping!</p>
            </div>
          )}
          {activeTab === 'wishlist' && (
            <div className="wishlist-section">
              <h2>My Wishlist ({wishlist.length} items)</h2>
              {wishlist.length === 0 ? (
                <div className="empty-wishlist">
                  <p>Your wishlist is empty.</p>
                  <button onClick={() => window.location.href = '/'}>Start Shopping</button>
                </div>
              ) : (
                <div className="products-grid">
                  {wishlist.map(product => (
                    <div key={product.id} className="product-card">
                      <img src={product.image_url} alt={product.name} />
                      <h3>{product.name}</h3>
                      <p className="material">{product.material}</p>
                      <p className="price">₹{product.price}</p>
                      <button onClick={() => addToCart(product)}>Add to Cart 🛒</button>
                      <button className="wishlist-btn active" onClick={() => toggleWishlist(product)}>❤️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard