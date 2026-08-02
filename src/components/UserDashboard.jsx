import './UserDashboard.css'
import { useState, useEffect } from 'react'
import { EyeIcon, EyeOffIcon } from './icons/EyeIcons'

function UserDashboard({ user, onUpdateUser, wishlist, addToCart, toggleWishlist, onLogout, cart, updateQuantity, removeFromCart, getTotal, onNavigate, placeOrder }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postal_code || ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)

  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  // Keep the profile form in sync whenever the logged-in user data changes
  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      postalCode: user?.postal_code || ''
    })
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/orders')
      const allOrders = await response.json()
      const userOrders = allOrders.filter(order => order.user_id === user?.id)
      setOrders(userOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!profileData.name || !profileData.name.trim()) {
      alert('Name is required')
      return
    }
    setSavingProfile(true)
    try {
      const response = await fetch(`http://localhost:5001/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          postal_code: profileData.postalCode
        })
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Could not update profile')
        return
      }
      // Update the logged-in user in App state so the sidebar, header, etc. reflect the change too
      if (onUpdateUser) onUpdateUser(data.user)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Could not update profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    setPasswordSaving(true)
    try {
      const response = await fetch(`http://localhost:5001/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      const data = await response.json()
      if (!response.ok) {
        setPasswordError(data.error || 'Could not change password')
        return
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('Could not change password. Please try again.')
    } finally {
      setPasswordSaving(false)
    }
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

  // Handle "Buy Again" - add this order's item(s) back to cart, then jump to cart
  const buyAgain = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        if (!item.product_id) return // product may have been deleted since
        addToCart({
          id: item.product_id,
          name: item.name,
          price: item.current_price ?? item.price,
          image_url: item.image_url,
          category: item.category,
          material: item.material,
          stock: item.stock
        })
      })
    }
    onNavigate('cart')
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
                      <div className="recent-order-amount">Rs. {order.total_amount || 0}</div>
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
                        {order.payment_method === 'khalti' && (
                          <div className="payment-info-dash">
                            <span className="payment-method-badge">📱 Paid via Khalti</span>
                            {order.transaction_id && (
                              <span className="transaction-id-dash">Txn ID: {order.transaction_id}</span>
                            )}
                            <span className="paid-badge-dash">✅ Paid</span>
                            <button className="view-receipt-dash" onClick={() => setReceiptOrder(order)}>🧾 View Receipt</button>
                          </div>
                        )}
                        <div className="order-items-dash">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div className="order-item-simple" key={idx}>
                                {item.image_url ? (
                                  <img className="item-icon-img" src={item.image_url} alt={item.name || 'Product'} />
                                ) : (
                                  <div className="item-icon">💍</div>
                                )}
                                <div className="item-details">
                                  <h4>{item.name || 'Jewellery Item'}</h4>
                                  <p>Quantity: {item.quantity || 1}</p>
                                </div>
                                <div className="item-price">Rs. {item.price || 0}</div>
                              </div>
                            ))
                          ) : (
                            <div className="order-item-simple">
                              <div className="item-icon">💍</div>
                              <div className="item-details">
                                <h4>Jewellery Item</h4>
                                <p>Quantity: 1</p>
                              </div>
                              <div className="item-price">Rs. {order.total_amount || 0}</div>
                            </div>
                          )}
                        </div>
                        <div className="order-footer-dash">
                          <div className="order-total">
                            <span>Total:</span>
                            <strong>Rs. {order.total_amount || 0}</strong>
                          </div>
                          <div className="order-actions-dash">
                            {canCancel && (
                              <button className="cancel-order-dash" onClick={() => cancelOrder(order.id)}>Cancel Order</button>
                            )}
                            <button className="reorder-dash" onClick={() => buyAgain(order)}>Buy Again</button>
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
                        <p className="price-dash">Rs. {product.price}</p>
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
                          <p className="cart-item-price-dash">Rs. {item.price}</p>
                        </div>
                        <div className="cart-item-quantity-dash">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <div className="cart-item-total-dash">
                          <p>Rs. {item.price * item.quantity}</p>
                          <button className="remove-item-dash" onClick={() => removeFromCart(item.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary-dash">
                    <div className="cart-summary-row">
                      <span>Subtotal:</span>
                      <span>Rs. {cartTotal}</span>
                    </div>
                    <div className="cart-summary-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="cart-summary-row total">
                      <span>Total:</span>
                      <span>Rs. {cartTotal}</span>
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
                    <input type="email" value={profileData.email} disabled readOnly title="Email can't be changed since it's used to log in" />
                    <p className="field-note-dash">Email is your login ID and can't be changed here.</p>
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
                      <input type="text" autoComplete="postal-code" value={profileData.postalCode} onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})} />
                    </div>
                  </div>
                  <div className="password-toggle-section-dash">
                    <button
                      type="button"
                      className="change-password-link-dash"
                      onClick={() => { setIsChangingPassword(!isChangingPassword); setPasswordError('') }}
                    >
                      🔒 {isChangingPassword ? 'Hide Change Password' : 'Change Password'}
                    </button>
                    {isChangingPassword && (
                      <div className="password-fields-inline-dash">
                        {passwordError && <p className="password-error-dash">{passwordError}</p>}
                        {/* Hidden username field so browsers correctly detect this as a password-change
                            form and don't guess a nearby field (like Postal Code) as the username. */}
                        <input
                          type="text"
                          name="username"
                          value={user?.email || ''}
                          autoComplete="username"
                          readOnly
                          style={{ display: 'none' }}
                        />
                        <div className="form-group-dash">
                          <label>Current Password</label>
                          <div className="password-container">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              autoComplete="current-password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              className="toggle-password"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                            >
                              {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>
                        <div className="form-group-dash">
                          <label>New Password</label>
                          <div className="password-container">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              autoComplete="new-password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              className="toggle-password"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                              {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>
                        <div className="form-group-dash">
                          <label>Confirm New Password</label>
                          <div className="password-container">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              className="toggle-password"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                        </div>
                        <div className="form-actions-dash">
                          <button type="button" className="save-btn-dash" onClick={handlePasswordChange} disabled={passwordSaving}>
                            {passwordSaving ? 'Saving...' : 'Update Password'}
                          </button>
                          <button
                            type="button"
                            className="cancel-btn-dash"
                            disabled={passwordSaving}
                            onClick={() => {
                              setIsChangingPassword(false)
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                              setPasswordError('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-actions-dash">
                    <button className="save-btn-dash" onClick={handleProfileUpdate} disabled={savingProfile}>
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="cancel-btn-dash" onClick={() => { setIsEditing(false); setIsChangingPassword(false); setPasswordError('') }} disabled={savingProfile}>Cancel</button>
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
                    <button className="logout-from-profile" onClick={onLogout}> Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="receipt-modal-overlay" onClick={() => setReceiptOrder(null)}>
          <div className="receipt-modal-dash" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header-dash">
              <h3>🧾 Payment Receipt</h3>
              <button className="receipt-close-dash" onClick={() => setReceiptOrder(null)}>✕</button>
            </div>
            <div className="receipt-body-dash">
              <div className="receipt-brand-dash">
                <h2>SIDDHI JEWELLS</h2>
                <p>Official Payment Receipt</p>
              </div>
              <div className="receipt-row-dash">
                <span>Order ID</span>
                <strong>#{receiptOrder.id}</strong>
              </div>
              <div className="receipt-row-dash">
                <span>Date</span>
                <strong>{receiptOrder.created_at ? new Date(receiptOrder.created_at).toLocaleString() : 'N/A'}</strong>
              </div>
              <div className="receipt-row-dash">
                <span>Payment Method</span>
                <strong>Khalti</strong>
              </div>
              <div className="receipt-row-dash">
                <span>Transaction ID</span>
                <strong>{receiptOrder.transaction_id || 'N/A'}</strong>
              </div>
              <div className="receipt-row-dash">
                <span>Payment Status</span>
                <strong className="paid-text-dash">✅ Paid</strong>
              </div>
              <hr />
              <div className="receipt-items-dash">
                {receiptOrder.items && receiptOrder.items.length > 0 ? (
                  receiptOrder.items.map((item, idx) => (
                    <div className="receipt-item-row-dash" key={idx}>
                      <span>{item.name || 'Jewellery Item'} × {item.quantity || 1}</span>
                      <span>Rs. {(item.price || 0) * (item.quantity || 1)}</span>
                    </div>
                  ))
                ) : (
                  <div className="receipt-item-row-dash">
                    <span>Jewellery Item</span>
                    <span>Rs. {receiptOrder.total_amount || 0}</span>
                  </div>
                )}
              </div>
              <hr />
              <div className="receipt-row-dash receipt-total-dash">
                <span>Total Paid</span>
                <strong>Rs. {receiptOrder.total_amount || 0}</strong>
              </div>
            </div>
            <div className="receipt-footer-dash">
              <button className="receipt-print-dash" onClick={() => window.print()}>🖨️ Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard