import './AdminPanel.css'
import { useState, useEffect } from 'react'

function AdminPanel({ products, setProducts, onClose, onLogout, user, onGoToPublicView }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  })
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [news, setNews] = useState([])
  const [newNews, setNewNews] = useState({ title: '', content: '', date: '' })
  const [showNewsForm, setShowNewsForm] = useState(false)
  
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', material: '', price: '', description: '', image_url: '', stock: ''
  })

  // Helper function to ensure data is always an array
  const ensureArray = (data) => {
    return Array.isArray(data) ? data : []
  }

  // Fetch stats
  useEffect(() => {
    fetchStats()
    fetchOrders()
    fetchUsers()
    fetchNews()
  }, [])

  const fetchStats = async () => {
    try {
      const productsRes = await fetch('http://localhost:5001/api/products')
      const productsData = await productsRes.json()
      const safeProducts = ensureArray(productsData)
      
      const usersRes = await fetch('http://localhost:5001/api/users')
      const usersData = await usersRes.json()
      const safeUsers = ensureArray(usersData)
      
      const ordersRes = await fetch('http://localhost:5001/api/orders')
      const ordersData = await ordersRes.json()
      const safeOrders = ensureArray(ordersData)
      
      setStats({
        totalUsers: safeUsers.length,
        totalProducts: safeProducts.length,
        totalOrders: safeOrders.length,
        pendingOrders: safeOrders.filter(o => o && o.status === 'pending').length,
        totalRevenue: safeOrders.reduce((sum, o) => sum + (o?.total_amount || 0), 0)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      })
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/orders')
      const data = await response.json()
      setOrders(ensureArray(data))
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users')
      const data = await response.json()
      setUsers(ensureArray(data))
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const fetchNews = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/news')
      const data = await response.json()
      setNews(ensureArray(data))
    } catch (error) {
      console.error('Error fetching news:', error)
      setNews([])
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      alert(`Order ${orderId} marked as ${status}`)
      await fetchOrders()
      await fetchStats()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const addNews = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5001/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newNews, 
          date: new Date().toISOString(), 
          status: 'published' 
        })
      })
      if (response.ok) {
        alert('News/Blog added successfully!')
        setShowNewsForm(false)
        setNewNews({ title: '', content: '', date: '' })
        await fetchNews()
      } else {
        const error = await response.json()
        alert('Failed to add news: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding news:', error)
      alert('Error adding news. Make sure backend is running.')
    }
  }

  const deleteNews = async (id) => {
    if (window.confirm('Delete this news/blog?')) {
      try {
        await fetch(`http://localhost:5001/api/news/${id}`, { method: 'DELETE' })
        alert('News/Blog deleted!')
        await fetchNews()
      } catch (error) {
        console.error('Error deleting news:', error)
        alert('Error deleting news')
      }
    }
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await fetch(`http://localhost:5001/api/products/${id}`, { method: 'DELETE' })
        const updated = ensureArray(products).filter(p => p.id !== id)
        setProducts(updated)
        alert('Product deleted!')
        await fetchStats()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product')
      }
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, price: parseInt(newProduct.price), stock: parseInt(newProduct.stock) })
      })
      if (response.ok) {
        alert('Product added!')
        setShowAddForm(false)
        const res = await fetch('http://localhost:5001/api/products')
        const fresh = await res.json()
        setProducts(ensureArray(fresh))
        setNewProduct({ name: '', category: '', material: '', price: '', description: '', image_url: '', stock: '' })
        await fetchStats()
      } else {
        alert('Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product')
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      await fetch(`http://localhost:5001/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      })
      alert('Product updated!')
      setEditingProduct(null)
      const res = await fetch('http://localhost:5001/api/products')
      const fresh = await res.json()
      setProducts(ensureArray(fresh))
      await fetchStats()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error updating product')
    }
  }

  // Calculate chart data
  const getSalesByCategory = () => {
    const categories = {}
    ensureArray(products).forEach(product => {
      const cat = product.category || 'Other'
      categories[cat] = (categories[cat] || 0) + 1
    })
    return categories
  }

  const getSalesByMaterial = () => {
    const materials = {}
    ensureArray(products).forEach(product => {
      const mat = product.material || 'Other'
      materials[mat] = (materials[mat] || 0) + 1
    })
    return materials
  }

  // Safe arrays for rendering
  const safeOrders = ensureArray(orders)
  const safeProducts = ensureArray(products)
  const safeUsers = ensureArray(users)
  const safeNews = ensureArray(news)
  const salesByCategory = getSalesByCategory()
  const salesByMaterial = getSalesByMaterial()

  return (
    <div className="admin-panel">
      {/* Admin Header with Logout and View Public Site button */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>👑 Admin Panel</h1>
          <p>Welcome, {user?.name || 'Admin'}</p>
        </div>
        <div className="admin-header-right">
          <button className="public-site-btn" onClick={onGoToPublicView}>
             View Public Site
          </button>
          <button className="admin-logout-btn" onClick={onLogout}>
             Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="admin-navbar">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          📋 Orders
        </button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          🛍️ Products
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          👥 Users
        </button>
        <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>
          📰 News & Blog
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          ⚙️ Settings
        </button>
      </div>

      <div className="admin-main">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <h2>Dashboard Overview</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛍️</div>
                <div className="stat-info">
                  <h3>{stats.totalProducts || 0}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders || 0}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingOrders || 0}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-card">
                <h3>Products by Category</h3>
                <div className="simple-chart">
                  {Object.entries(salesByCategory).map(([category, count]) => (
                    <div key={category} className="chart-bar">
                      <span className="chart-label">{category}</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: `${(count / safeProducts.length) * 100}%` }}></div>
                        <span className="bar-value">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Products by Material</h3>
                <div className="simple-chart">
                  {Object.entries(salesByMaterial).map(([material, count]) => (
                    <div key={material} className="chart-bar">
                      <span className="chart-label">{material}</span>
                      <div className="bar-container">
                        <div className="bar" style={{ width: `${(count / safeProducts.length) * 100}%`, background: '#8B4513' }}></div>
                        <span className="bar-value">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recent-orders">
              <h3>Recent Orders</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {safeOrders.length > 0 ? (
                    safeOrders.slice(0, 5).map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>₹{order.total_amount || 0}</td>
                        <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status || 'pending'}</span></td>
                        <td>
                          <select onChange={(e) => updateOrderStatus(order.id, e.target.value)} value={order.status || 'pending'}>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{textAlign: 'center'}}>No orders found</td>
                    </tr>
                                      )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="admin-orders">
            <h2>All Orders</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {safeOrders.length > 0 ? (
                  safeOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>User #{order.user_id}</td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                      <td>₹{order.total_amount || 0}</td>
                      <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status || 'pending'}</span></td>
                      <td>
                        <select onChange={(e) => updateOrderStatus(order.id, e.target.value)} value={order.status || 'pending'}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="admin-products">
            <div className="section-header">
              <h2>Manage Products</h2>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>+ Add Product</button>
            </div>
            
            {showAddForm && (
              <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h3>Add New Product</h3>
                  <form onSubmit={handleAddProduct}>
                    <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      <option value="Ring">Ring</option>
                      <option value="Necklace">Necklace</option>
                      <option value="Earrings">Earrings</option>
                      <option value="Bracelet">Bracelet</option>
                      <option value="Pendant">Pendant</option>
                    </select>
                    <select value={newProduct.material} onChange={(e) => setNewProduct({...newProduct, material: e.target.value})} required>
                      <option value="">Select Material</option>
                      <option value="Silver">Silver</option>
                      <option value="Copper">Copper</option>
                      <option value="Crystal">Crystal</option>
                      <option value="Gemstone">Gemstone</option>
                    </select>
                    <input type="number" placeholder="Price (₹)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
                    <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows="2"></textarea>
                    <input type="text" placeholder="Image URL" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} />
                    <input type="number" placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} />
                    <div className="modal-buttons">
                      <button type="submit">Add Product</button>
                      <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="products-grid-admin">
              {safeProducts.length > 0 ? (
                safeProducts.map(product => (
                  <div key={product.id} className="admin-product-card">
                    <img src={product.image_url} alt={product.name} onError={(e) => e.target.src = 'https://via.placeholder.com/100'} />
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>₹{product.price} | Stock: {product.stock || 0}</p>
                      <p className="product-meta">{product.material} | {product.category}</p>
                    </div>
                    <div className="product-actions">
                      <button className="edit-btn" onClick={() => setEditingProduct(product)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{textAlign: 'center', width: '100%'}}>No products found</p>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>All Users</h2>
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined Date</th></tr>
              </thead>
              <tbody>
                {safeUsers.length > 0 ? (
                  safeUsers.map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td><span className={`role-badge ${user.role || 'user'}`}>{user.role || 'user'}</span></td>
                      <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{textAlign: 'center'}}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* NEWS & BLOG TAB */}
        {activeTab === 'news' && (
          <div className="admin-news">
            <div className="section-header">
              <h2>📰 News & Blog Posts</h2>
              <button className="add-btn" onClick={() => setShowNewsForm(true)}>+ Add New Post</button>
            </div>
            
            {showNewsForm && (
              <div className="modal-overlay" onClick={() => setShowNewsForm(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h3>📝 Add New Blog Post / News</h3>
                  <form onSubmit={addNews}>
                    <input 
                      type="text" 
                      placeholder="Post Title" 
                      value={newNews.title} 
                      onChange={(e) => setNewNews({...newNews, title: e.target.value})} 
                      required 
                    />
                    <textarea 
                      placeholder="Post Content (Full article text)" 
                      value={newNews.content} 
                      onChange={(e) => setNewNews({...newNews, content: e.target.value})} 
                      rows="6" 
                      required
                    ></textarea>
                    <div className="modal-buttons">
                      <button type="submit">📤 Publish Post</button>
                      <button type="button" onClick={() => setShowNewsForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="news-list">
              {safeNews.length > 0 ? (
                safeNews.map(item => (
                  <div key={item.id} className="news-card">
                    <div className="news-header">
                      <h3>📄 {item.title}</h3>
                      <span className="news-date">📅 {item.date ? new Date(item.date).toLocaleDateString() : 'New'}</span>
                    </div>
                    <p>{item.content?.substring(0, 200)}...</p>
                    <div className="news-actions">
                      <span className="status-badge published">✅ Published</span>
                      <button className="delete-news-btn" onClick={() => deleteNews(item.id)}>🗑️ Delete Post</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-news">
                  <p>📭 No news or blog posts yet.</p>
                  <p>Click "Add New Post" to create your first blog post!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="admin-settings">
            <h2>Admin Settings</h2>
            <div className="settings-card">
              <h3>Site Settings</h3>
              <p>Site Name: Siddhi Jewells</p>
              <p>Admin Email: {user?.email || 'admin@siddhijewells.com'}</p>
              <p>Total Products: {stats.totalProducts || 0}</p>
              <p>Total Users: {stats.totalUsers || 0}</p>
            </div>
            <div className="settings-card">
              <h3>Actions</h3>
              <button className="backup-btn">📥 Backup Database</button>
              <button className="clear-cache-btn">🗑️ Clear Cache</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <input type="text" value={editingProduct.name || ''} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} required />
              <select value={editingProduct.category || 'Ring'} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}>
                <option value="Ring">Ring</option>
                <option value="Necklace">Necklace</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelet">Bracelet</option>
                <option value="Pendant">Pendant</option>
              </select>
              <select value={editingProduct.material || 'Silver'} onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}>
                <option value="Silver">Silver</option>
                <option value="Copper">Copper</option>
                <option value="Crystal">Crystal</option>
                <option value="Gemstone">Gemstone</option>
              </select>
              <input type="number" value={editingProduct.price || 0} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} required />
              <textarea value={editingProduct.description || ''} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} rows="2"></textarea>
              <input type="text" value={editingProduct.image_url || ''} onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})} />
              <input type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} />
              <div className="modal-buttons">
                <button type="submit">Update</button>
                <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel