import './UserDashboard.css'
import { useState, useEffect } from 'react'

function UserDashboard({ user, wishlist, addToCart, toggleWishlist, onLogout, cart, updateQuantity, removeFromCart, getTotal, onNavigate, placeOrder }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchOrders()
    loadSavedProfile()
  }, [])

  const loadSavedProfile = () => {
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile))
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/orders')
      const allOrders = await response.json()
      const userOrders = allOrders.filter(order => order.user_id === user?.id)
      setOrders(userOrders.reverse())
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData))
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  const getOrderStatusInfo = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return { icon: '⏳', color: '#ff9800', text: 'Pending', bg: '#fff3e0' }
      case 'processing': return { icon: '🔄', color: '#2196f3', text: 'Processing', bg: '#e3f2fd' }
      case 'shipped': return { icon: '🚚', color: '#4caf50', text: 'Shipped', bg: '#e8f5e9' }
      case 'delivered': return { icon: '✅', color: '#2e7d32', text: 'Delivered', bg: '#e8f5e9' }
      case 'cancelled': return { icon: '❌', color: '#f44336', text: 'Cancelled', bg: '#ffebee' }
      default: return { icon: '📦', color: '#999', text: 'Placed', bg: '#f5f5f5' }
    }
  }

  const cancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await fetch(`http://localhost:5001/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        })
        alert('Order cancelled successfully!')
        fetchOrders()
      } catch (error) {
        console.error('Error cancelling order:', error)
        alert('Failed to cancel order')
      }
    }
  }

  const stats = {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const cartTotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0

  // Handle go to public site (stay logged in)
  const goToPublicSite = () => {
    onNavigate('home')
  }

  // Handle checkout
  const handleCheckout = async () => {
    const success = await placeOrder()
    if (success) {
      await fetchOrders()
      setActiveTab('orders')
    }
  }

  return (
    <div className="user-dashboard-fullpage">
      <div className="dashboard-full-container">
        {/* Left Sidebar */}
        <div className="dashboard-left-sidebar">
          <div className="sidebar-logo">
            <h2>SIDDHI</h2>
            <p>JEWELLS</p>
          </div>
          
          <div className="sidebar-user-info">
            <div className="sidebar-avatar-large">👤</div>
            <h3>{user?.name || 'Customer'}</h3>
            <p>{user?.email || 'user@example.com'}</p>
          </div>
          
          <nav className="sidebar-nav-menu">
            <button onClick={goToPublicSite}>
              <span className="nav-icon-dash">🏠</span>
              <span>Home</span>
            </button>
            <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <span className="nav-icon-dash">📊</span>
              <span>Dashboard</span>
            </button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <span className="nav-icon-dash">📋</span>
              <span>My Orders</span>
              {stats.pending > 0 && <span className="nav-badge-dash">{stats.pending}</span>}
            </button>
            <button className={activeTab === 'wishlist' ? 'active' : ''} onClick={() => setActiveTab('wishlist')}>
              <span className="nav-icon-dash">❤️</span>
              <span>Wishlist</span>
              {wishlist?.length > 0 && <span className="nav-badge-dash">{wishlist.length}</span>}
            </button>
            <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>
              <span className="nav-icon-dash">🛒</span>
              <span>My Cart</span>
              {cart?.length > 0 && <span className="nav-badge-dash">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
            </button>
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              <span className="nav-icon-dash">👤</span>
              <span>My Profile</span>
            </button>
            <button className="logout-btn-dash" onClick={onLogout}>
              <span className="nav-icon-dash">🚪</span>
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="dashboard-right-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab-content">
              <div className="welcome-header">
                <h1>Welcome back, {user?.name?.split(' ')[0] || 'Customer'}! 👋</h1>
                <p>Here's what's happening with your account today.</p>
              </div>

              <div className="stats-grid-dash">
                <div className="stat-card-dash">
                  <div className="stat-icon-dash">📦</div>
                  <div className="stat-info-dash">
                    <h3>{stats.totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
                <div className="stat-card-dash pending">
                  <div className="stat-icon-dash">⏳</div>
                  <div className="stat-info-dash">
                    <h3>{stats.pending}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className="stat-card-dash delivered">
                  <div className="stat-icon-dash">✅</div>
                  <div className="stat-info-dash">
                    <h3>{stats.delivered}</h3>
                    <p>Delivered</p>
                  </div>
                </div>
                <div className="stat-card-dash cancelled">
                  <div className="stat-icon-dash">❌</div>
                  <div className="stat-info-dash">
                    <h3>{stats.cancelled}</h3>
                    <p>Cancelled</p>
                  </div>
                </div>
              </div>

              <div className="recent-orders-dash">
                <div className="section-header-dash">
                  <h3>Recent Orders</h3>
                  <button className="view-all-dash" onClick={() => setActiveTab('orders')}>View All →</button>
                </div>
                {orders.slice(0, 5).map(order => {
                  const statusInfo = getOrderStatusInfo(order.status)
                  return (
                    <div key={order.id} className="recent-order-item-dash">
                      <div className="recent-order-info">
                        <span className="order-id">Order #{order.id}</span>
                        <span className="order-date">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="recent-order-status" style={{ color: statusInfo.color }}>
                        {statusInfo.icon} {statusInfo.text}
                      </div>
                      <div className="recent-order-amount">₹{order.total_amount || 0}</div>
                    </div>
                  )
                })}
                {orders.length === 0 && <p className="no-data-dash">No orders yet. Start shopping!</p>}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-tab-content">
              <h2>My Orders</h2>
              {loading ? (
                <p>Loading your orders...</p>
              ) : orders.length === 0 ? (
                <div className="empty-state-dash">
                  <span>📦</span>
                  <h3>No orders yet</h3>
                  <p>You haven't placed any orders yet.</p>
                  <button className="shop-now-dash" onClick={goToPublicSite}>Start Shopping</button>
                </div>
              ) : (
                <div className="orders-list-dash">
                  {orders.map(order => {
                    const statusInfo = getOrderStatusInfo(order.status)
                    const canCancel = order.status === 'pending' || order.status === 'processing'
                    return (
                      <div key={order.id} className="order-card-dash">
                        <div className="order-header-dash">
                          <div>
                            <span className="order-number">Order #{order.id}</span>
                            <span className="order-date">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="order-status" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                            {statusInfo.icon} {statusInfo.text}
                          </div>
                        </div>
                        <div className="order-items-dash">
                          <div className="order-item-simple">
                            <div className="item-icon">💍</div>
                            <div className="item-details">
                              <h4>Jewellery Item</h4>
                              <p>Quantity: 1</p>
                            </div>
                            <div className="item-price">₹{order.total_amount || 0}</div>
                          </div>
                        </div>
                        <div className="order-footer-dash">
                          <div className="order-total">
                            <span>Total:</span>
                            <strong>₹{order.total_amount || 0}</strong>
                          </div>
                          <div className="order-actions-dash">
                            {canCancel && (
                              <button className="cancel-order-dash" onClick={() => cancelOrder(order.id)}>Cancel Order</button>
                            )}
                            <button className="reorder-dash" onClick={goToPublicSite}>Buy Again</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="wishlist-tab-content">
              <h2>My Wishlist ({wishlist?.length || 0} items)</h2>
              {!wishlist || wishlist.length === 0 ? (
                <div className="empty-state-dash">
                  <span>❤️</span>
                  <h3>Your wishlist is empty</h3>
                  <p>Save your favorite items here!</p>
                  <button className="shop-now-dash" onClick={goToPublicSite}>Start Shopping</button>
                </div>
              ) : (
                <div className="wishlist-grid-dash">
                  {wishlist.map(product => (
                    <div key={product.id} className="wishlist-card-dash">
                      <img src={product.image_url} alt={product.name} />
                      <div className="wishlist-info-dash">
                        <h4>{product.name}</h4>
                        <p className="material-dash">{product.material}</p>
                        <p className="price-dash">₹{product.price}</p>
                        <div className="wishlist-buttons-dash">
                          <button className="add-to-cart-dash" onClick={() => {
                            addToCart(product)
                            alert('Added to cart!')
                          }}>Add to Cart</button>
                          <button className="remove-wishlist-dash" onClick={() => toggleWishlist(product)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div className="cart-tab-content">
              <h2>My Cart ({cart?.reduce((sum, item) => sum + item.quantity, 0) || 0} items)</h2>
              {!cart || cart.length === 0 ? (
                <div className="empty-state-dash">
                  <span>🛒</span>
                  <h3>Your cart is empty</h3>
                  <p>Add some items to your cart!</p>
                  <button className="shop-now-dash" onClick={goToPublicSite}>Start Shopping</button>
                </div>
              ) : (
                <>
                  <div className="cart-items-list-dash">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item-dash">
                        <img src={item.image_url} alt={item.name} />
                        <div className="cart-item-info-dash">
                          <h4>{item.name}</h4>
                          <p>{item.material}</p>
                          <p className="cart-item-price-dash">₹{item.price}</p>
                        </div>
                        <div className="cart-item-quantity-dash">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <div className="cart-item-total-dash">
                          <p>₹{item.price * item.quantity}</p>
                          <button className="remove-item-dash" onClick={() => removeFromCart(item.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary-dash">
                    <div className="cart-summary-row">
                      <span>Subtotal:</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div className="cart-summary-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="cart-summary-row total">
                      <span>Total:</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <button className="checkout-dash" onClick={handleCheckout}>Proceed to Checkout →</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-tab-content">
              <h2>My Profile</h2>
              {isEditing ? (
                <div className="profile-edit-form-dash">
                  <div className="form-group-dash">
                    <label>Full Name</label>
                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  <div className="form-group-dash">
                    <label>Email</label>
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
                  </div>
                  <div className="form-group-dash">
                    <label>Phone Number</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                  <div className="form-group-dash">
                    <label>Delivery Address</label>
                    <textarea value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} rows="3"></textarea>
                  </div>
                  <div className="form-row-dash">
                    <div className="form-group-dash">
                      <label>City</label>
                      <input type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} />
                    </div>
                    <div className="form-group-dash">
                      <label>Postal Code</label>
                      <input type="text" value={profileData.postalCode} onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-actions-dash">
                    <button className="save-btn-dash" onClick={handleProfileUpdate}>Save Changes</button>
                    <button className="cancel-btn-dash" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="profile-view-dash">
                  <div className="profile-avatar-section-dash">
                    <div className="profile-avatar-dash">👤</div>
                    <h3>{profileData.name || 'Not set'}</h3>
                    <p className="member-since-dash">Member since {new Date().getFullYear()}</p>
                  </div>
                  <div className="profile-info-grid-dash">
                    <div className="info-item-dash">
                      <label>Full Name</label>
                      <p>{profileData.name || 'Not provided'}</p>
                    </div>
                    <div className="info-item-dash">
                      <label>Email</label>
                      <p>{profileData.email || 'Not provided'}</p>
                    </div>
                    <div className="info-item-dash">
                      <label>Phone</label>
                      <p>{profileData.phone || 'Not provided'}</p>
                    </div>
                    <div className="info-item-dash full-width">
                      <label>Delivery Address</label>
                      <p>{profileData.address || 'Not provided'}</p>
                    </div>
                    <div className="info-item-dash">
                      <label>City</label>
                      <p>{profileData.city || 'Not provided'}</p>
                    </div>
                    <div className="info-item-dash">
                      <label>Postal Code</label>
                      <p>{profileData.postalCode || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="profile-buttons">
                    <button className="edit-profile-dash" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    <button className="logout-from-profile" onClick={onLogout}>🚪 Logout</button>
                  </div>
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