import './AdminPanel.css'
import { useState, useEffect } from 'react'

function AdminPanel({ products, setProducts, onClose, onLogout, user, onGoToPublicView }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [statsModalData, setStatsModalData] = useState({ title: '', data: [], type: '' })
  const [viewingPaymentOrder, setViewingPaymentOrder] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    codRevenue: 0,
    khaltiRevenue: 0,
    monthlyRevenue: 0,
    monthlyCodRevenue: 0,
    monthlyKhaltiRevenue: 0,
    weeklyOrders: 0
  })
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [news, setNews] = useState([])
  const [newNews, setNewNews] = useState({ title: '', content: '', date: '' })
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [monthlyData, setMonthlyData] = useState([])
  const [monthlyOrdersData, setMonthlyOrdersData] = useState({})
  
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', material: '', price: '', description: '', image_url: '', stock: ''
  })

  // Helper function to ensure data is always an array
  const ensureArray = (data) => {
    return Array.isArray(data) ? data : []
  }

  // Format date to Nepal time (UTC+5:45)
  const formatNepalTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kathmandu'
    })
  }

  // Format date for month grouping (Nepal time)
  const getMonthYear = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('default', { 
      month: 'long',
      timeZone: 'Asia/Kathmandu'
    }) + ' ' + date.toLocaleString('default', { 
      year: 'numeric',
      timeZone: 'Asia/Kathmandu'
    })
  }

  const getMonthYearShort = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('default', { 
      month: 'short',
      timeZone: 'Asia/Kathmandu'
    }) + ' ' + date.toLocaleString('default', { 
      year: 'numeric',
      timeZone: 'Asia/Kathmandu'
    })
  }

  // Fetch stats
  useEffect(() => {
    fetchStats()
    fetchOrders()
    fetchUsers()
    fetchNews()
    fetchMonthlyData()
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
      
      // Calculate order status counts
      const pendingOrders = safeOrders.filter(o => o && o.status === 'pending').length
      const processingOrders = safeOrders.filter(o => o && o.status === 'processing').length
      const shippedOrders = safeOrders.filter(o => o && o.status === 'shipped').length
      const deliveredOrders = safeOrders.filter(o => o && o.status === 'delivered').length
      const cancelledOrders = safeOrders.filter(o => o && o.status === 'cancelled').length
      
      // TOTAL REVENUE = COD orders that are delivered  +  Khalti orders that are paid (any status)
      // (a khalti order is counted once it's paid, not counted twice if it later becomes delivered)
      const codRevenue = safeOrders
        .filter(o => o && o.status === 'delivered' && o.payment_method !== 'khalti')
        .reduce((sum, o) => sum + parseFloat(o?.total_amount || 0), 0)

      const khaltiRevenue = safeOrders
        .filter(o => o && o.payment_method === 'khalti' && o.payment_status === 'paid' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o?.total_amount || 0), 0)

      const totalRevenue = codRevenue + khaltiRevenue
      
      // Get current month in Nepal time
      const now = new Date()
      const nowNepal = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))
      const currentMonth = nowNepal.getMonth()
      const currentYear = nowNepal.getFullYear()

      const isInCurrentMonth = (o) => {
        if (!o || !o.created_at) return false
        const orderDate = new Date(o.created_at)
        const orderNepal = new Date(orderDate.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))
        return orderNepal.getMonth() === currentMonth && orderNepal.getFullYear() === currentYear
      }

      // MONTHLY REVENUE = same COD-delivered + Khalti-paid logic, scoped to this month's orders
      const monthlyCodRevenue = safeOrders
        .filter(o => o && isInCurrentMonth(o) && o.status === 'delivered' && o.payment_method !== 'khalti')
        .reduce((sum, o) => sum + parseFloat(o?.total_amount || 0), 0)

      const monthlyKhaltiRevenue = safeOrders
        .filter(o => o && isInCurrentMonth(o) && o.payment_method === 'khalti' && o.payment_status === 'paid' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o?.total_amount || 0), 0)

      const monthlyRevenue = monthlyCodRevenue + monthlyKhaltiRevenue
      
      // Calculate monthly orders (ALL orders in current month)
      const monthlyOrders = safeOrders
        .filter(o => {
          if (!o || !o.created_at) return false
          const orderDate = new Date(o.created_at)
          const orderNepal = new Date(orderDate.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))
          return orderNepal.getMonth() === currentMonth && orderNepal.getFullYear() === currentYear
        }).length
      
      // Get weekly orders in Nepal time
      const weekAgo = new Date(nowNepal)
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const weeklyOrders = safeOrders.filter(o => {
        if (!o || !o.created_at) return false
        const orderDate = new Date(o.created_at)
        const orderNepal = new Date(orderDate.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))
        return orderNepal >= weekAgo
      }).length
      
      setStats({
        totalUsers: safeUsers.length,
        totalProducts: safeProducts.length,
        totalOrders: safeOrders.length,
        monthlyOrders: monthlyOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        codRevenue,
        khaltiRevenue,
        monthlyRevenue,
        monthlyCodRevenue,
        monthlyKhaltiRevenue,
        weeklyOrders
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        monthlyOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        codRevenue: 0,
        khaltiRevenue: 0,
        monthlyRevenue: 0,
        monthlyCodRevenue: 0,
        monthlyKhaltiRevenue: 0,
        weeklyOrders: 0
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

  const fetchMonthlyData = async () => {
    try {
      const ordersRes = await fetch('http://localhost:5001/api/orders')
      const ordersData = await ordersRes.json()
      const safeOrders = ensureArray(ordersData)
      
      // Group orders by month for DELIVERED orders only (for revenue)
      const monthlyMap = {}
      // Group orders by month with full details (for monthly orders view)
      const monthlyOrdersMap = {}
      
      safeOrders.forEach(order => {
        if (order && order.created_at) {
          const monthYear = getMonthYear(order.created_at) // e.g., "June 2026"
          const monthYearShort = getMonthYearShort(order.created_at) // e.g., "Jun 2026"
          
          // For revenue chart - COD orders delivered + Khalti orders paid (excluding cancelled)
          const countsForRevenue = (order.status === 'delivered' && order.payment_method !== 'khalti')
            || (order.payment_method === 'khalti' && order.payment_status === 'paid' && order.status !== 'cancelled')
          if (countsForRevenue) {
            if (!monthlyMap[monthYearShort]) {
              monthlyMap[monthYearShort] = 0
            }
            monthlyMap[monthYearShort] += parseFloat(order.total_amount || 0)
          }
          
          // For monthly orders detail - ALL orders with details
          if (!monthlyOrdersMap[monthYear]) {
            monthlyOrdersMap[monthYear] = []
          }
          monthlyOrdersMap[monthYear].push({
            id: order.id,
            user_id: order.user_id,
            amount: order.total_amount,
            status: order.status,
            date: order.created_at
          })
        }
      })
      
      const monthlyArray = Object.entries(monthlyMap).map(([month, revenue]) => ({
        month,
        revenue
      }))
      
      // Sort by month order
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      monthlyArray.sort((a, b) => {
        const aMonth = a.month.split(' ')[0]
        const bMonth = b.month.split(' ')[0]
        return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth)
      })
      
      setMonthlyData(monthlyArray.slice(-6)) // Last 6 months
      setMonthlyOrdersData(monthlyOrdersMap)
    } catch (error) {
      console.error('Error fetching monthly data:', error)
      setMonthlyData([])
      setMonthlyOrdersData({})
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

  // Handle stat card click
  const handleStatClick = (type) => {
    let title = ''
    let data = []
    
    switch(type) {
      case 'users':
        title = 'All Users'
        data = users.map(u => ({ id: u.id, name: u.name || 'N/A', email: u.email || 'N/A', role: u.role || 'user' }))
        break
      case 'products':
        title = 'All Products'
        data = products.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, material: p.material }))
        break
      case 'orders':
        title = 'All Orders'
        data = orders.map(o => ({ id: o.id, user_id: o.user_id, total: o.total_amount, status: o.status, date: formatNepalTime(o.created_at) }))
        break
      case 'revenue':
        title = 'Revenue Details (COD Delivered + Khalti Paid, excluding cancelled)'
        data = orders
          .filter(o => (o.status === 'delivered' && o.payment_method !== 'khalti') || (o.payment_method === 'khalti' && o.payment_status === 'paid' && o.status !== 'cancelled'))
          .map(o => ({ id: o.id, user_id: o.user_id, amount: o.total_amount, payment_method: o.payment_method || 'cod', status: o.status, date: formatNepalTime(o.created_at) }))
        break
      case 'monthly':
        title = 'Monthly Revenue Details (COD Delivered + Khalti Paid)'
        data = monthlyData.map(m => ({ month: m.month, revenue: m.revenue }))
        break
      case 'pending':
        title = 'Pending Orders'
        data = orders.filter(o => o.status === 'pending').map(o => ({ id: o.id, user_id: o.user_id, total: o.total_amount, date: formatNepalTime(o.created_at) }))
        break
      case 'monthlyorders':
        const now = new Date()
        const currentMonthName = now.toLocaleString('default', { month: 'long', timeZone: 'Asia/Kathmandu' })
        const currentYearNum = now.toLocaleString('default', { year: 'numeric', timeZone: 'Asia/Kathmandu' })
        const currentMonthNum = parseInt(now.toLocaleString('default', { month: 'numeric', timeZone: 'Asia/Kathmandu' })) - 1
        
        title = `Monthly Orders (${currentMonthName} ${currentYearNum})`
        data = orders
          .filter(o => {
            if (!o || !o.created_at) return false
            const orderDate = new Date(o.created_at)
            const orderNepal = new Date(orderDate.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))
            return orderNepal.getMonth() === currentMonthNum && orderNepal.getFullYear() === parseInt(currentYearNum)
          })
          .map(o => ({ 
            id: o.id, 
            user_id: o.user_id, 
            total: o.total_amount, 
            status: o.status, 
            date: formatNepalTime(o.created_at) 
          }))
        break
      default:
        return
    }
    
    setStatsModalData({ title, data, type })
    setShowStatsModal(true)
  }

  // Handle monthly order click - show details for that month
  const handleMonthlyOrderClick = (month) => {
    // Try to find the month in monthlyOrdersData
    let ordersForMonth = []
    let foundKey = ''
    
    // First try: exact match with the month as-is
    if (monthlyOrdersData[month]) {
      ordersForMonth = monthlyOrdersData[month]
      foundKey = month
    } else {
      // Second try: map short month to full month
      const parts = month.split(' ')
      const shortMonth = parts[0]
      const year = parts[1] || ''
      
      const monthMap = {
        'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 
        'Apr': 'April', 'May': 'May', 'Jun': 'June',
        'Jul': 'July', 'Aug': 'August', 'Sep': 'September',
        'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
      }
      
      const fullMonth = monthMap[shortMonth] || shortMonth
      const fullMonthKey = `${fullMonth} ${year}`
      
      if (monthlyOrdersData[fullMonthKey]) {
        ordersForMonth = monthlyOrdersData[fullMonthKey]
        foundKey = fullMonthKey
      } else {
        // Third try: find by partial match (just the month name)
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December']
        const monthName = monthNames[Object.keys(monthMap).indexOf(shortMonth)]
        
        for (const key of Object.keys(monthlyOrdersData)) {
          if (key.startsWith(monthName) && key.endsWith(year)) {
            ordersForMonth = monthlyOrdersData[key]
            foundKey = key
            break
          }
        }
      }
    }
    
    const title = `Orders for ${month}`
    const data = ordersForMonth.map(o => ({ 
      id: o.id, 
      user_id: o.user_id, 
      amount: o.amount, 
      status: o.status, 
      date: formatNepalTime(o.date) 
    }))
    
    setStatsModalData({ title, data, type: 'monthlyorders' })
    setShowStatsModal(true)
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
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>👑 Admin Panel</h1>
          <p>Welcome, {user?.name || 'Admin'}</p>
        </div>
        <div className="admin-header-right">
          <button className="public-site-btn" onClick={onGoToPublicView}>
            🌐 View Public Site
          </button>
          <button className="admin-logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

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
        <button className={activeTab === 'statistics' ? 'active' : ''} onClick={() => setActiveTab('statistics')}>
          📈 Statistics
        </button>
      </div>

      <div className="admin-main">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <h2>Dashboard Overview</h2>
            
            <div className="stats-grid">
              <div className="stat-card clickable" onClick={() => handleStatClick('users')}>
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card clickable" onClick={() => handleStatClick('products')}>
                <div className="stat-icon">🛍️</div>
                <div className="stat-info">
                  <h3>{stats.totalProducts || 0}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card clickable" onClick={() => handleStatClick('orders')}>
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders || 0}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card clickable" onClick={() => handleStatClick('revenue')}>
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Rs. {(stats.totalRevenue || 0).toLocaleString()}</h3>
                  <p>Total Revenue</p>
                  <p className="revenue-breakdown-dash">
                    COD: Rs. {(stats.codRevenue || 0).toLocaleString()} · Khalti: Rs. {(stats.khaltiRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="quick-stat-card clickable" onClick={() => handleStatClick('monthly')}>
                <h4>📈 Monthly Revenue</h4>
                <p className="quick-stat-value">Rs. {(stats.monthlyRevenue || 0).toLocaleString()}</p>
                <p className="quick-stat-breakdown-dash">
                  COD: Rs. {(stats.monthlyCodRevenue || 0).toLocaleString()} · Khalti: Rs. {(stats.monthlyKhaltiRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="quick-stat-card clickable" onClick={() => handleStatClick('monthlyorders')}>
                <h4>📊 Monthly Orders</h4>
                <p className="quick-stat-value">{stats.monthlyOrders || 0}</p>
              </div>
              <div className="quick-stat-card clickable" onClick={() => handleStatClick('pending')}>
                <h4>⏳ Pending Orders</h4>
                <p className="quick-stat-value">{stats.pendingOrders || 0}</p>
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
                  <tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {safeOrders.length > 0 ? (
                    safeOrders.slice(0, 5).map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{formatNepalTime(order.created_at)}</td>
                        <td>Rs. {order.total_amount || 0}</td>
                        <td>
                          {order.payment_method === 'khalti' ? (
                            <button className="payment-badge payment-badge-khalti" onClick={() => setViewingPaymentOrder(order)} title="View Khalti transaction details">
                              📱 Khalti
                            </button>
                          ) : (
                            <span className="payment-badge payment-badge-cod">💵 COD</span>
                          )}
                        </td>
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
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="admin-orders">
            <h2>All Orders</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {safeOrders.length > 0 ? (
                  safeOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>User #{order.user_id}</td>
                      <td>{formatNepalTime(order.created_at)}</td>
                      <td>Rs. {order.total_amount || 0}</td>
                      <td>
                        {order.payment_method === 'khalti' ? (
                          <button className="payment-badge payment-badge-khalti" onClick={() => setViewingPaymentOrder(order)} title="View Khalti transaction details">
                            📱 Khalti
                          </button>
                        ) : (
                          <span className="payment-badge payment-badge-cod">💵 COD</span>
                        )}
                      </td>
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
                  <tr><td colSpan="7" style={{textAlign: 'center'}}>No orders found</td></tr>
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
                    <input type="number" placeholder="Price (Rs.)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
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
                      <p>Rs. {product.price} | Stock: {product.stock || 0}</p>
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
                      <td>{formatNepalTime(user.created_at)}</td>
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
                      <span className="news-date">📅 {formatNepalTime(item.date)}</span>
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

        {/* STATISTICS TAB */}
        {activeTab === 'statistics' && (
          <div className="admin-statistics">
            <h2>📊 Statistics & Analytics</h2>
            
            <div className="stats-summary">
              <div className="summary-card clickable" onClick={() => handleStatClick('revenue')}>
                <h3>💰 Total Revenue</h3>
                <p className="summary-value">Rs. {(stats.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="summary-card clickable" onClick={() => handleStatClick('monthly')}>
                <h3>📈 This Month</h3>
                <p className="summary-value">Rs. {(stats.monthlyRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="summary-card clickable" onClick={() => handleStatClick('orders')}>
                <h3>📦 Total Orders</h3>
                <p className="summary-value">{stats.totalOrders || 0}</p>
              </div>
              <div className="summary-card clickable" onClick={() => handleStatClick('users')}>
                <h3>👥 Total Users</h3>
                <p className="summary-value">{stats.totalUsers || 0}</p>
              </div>
            </div>

            {/* Monthly Revenue Chart with Clickable Bars */}
            <div className="stats-chart-card full-width">
              <h3>Monthly Revenue Trend (Click on a month to view orders)</h3>
              {monthlyData.length > 0 ? (
                <div className="line-chart">
                  {monthlyData.map((item, index) => {
                    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)
                    const height = (item.revenue / maxRevenue) * 150
                    const monthName = item.month
                    return (
                      <div key={index} className="bar-chart-column clickable" onClick={() => handleMonthlyOrderClick(monthName)}>
                        <div className="bar-chart-bar" style={{ height: `${height}px` }}></div>
                        <span className="bar-chart-label">{item.month}</span>
                        <span className="bar-chart-value">Rs. {(item.revenue / 1000).toFixed(0)}k</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '40px' }}>No order data available yet</p>
              )}
            </div>

            <div className="stats-charts-row">
              <div className="stats-chart-card">
                <h3>Order Status Distribution</h3>
                <div className="status-distribution">
                  <div className="status-bars">
                    <div className="status-bar-item">
                      <span className="status-label">Pending</span>
                      <div className="status-bar-bg">
                        <div className="status-bar-fill" style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100 || 0}%`, background: '#ff9800' }}></div>
                      </div>
                      <span className="status-count">{stats.pendingOrders}</span>
                    </div>
                    <div className="status-bar-item">
                      <span className="status-label">Processing</span>
                      <div className="status-bar-bg">
                        <div className="status-bar-fill" style={{ width: `${(stats.processingOrders / stats.totalOrders) * 100 || 0}%`, background: '#2196f3' }}></div>
                      </div>
                      <span className="status-count">{stats.processingOrders}</span>
                    </div>
                    <div className="status-bar-item">
                      <span className="status-label">Shipped</span>
                      <div className="status-bar-bg">
                        <div className="status-bar-fill" style={{ width: `${(stats.shippedOrders / stats.totalOrders) * 100 || 0}%`, background: '#4caf50' }}></div>
                      </div>
                      <span className="status-count">{stats.shippedOrders}</span>
                    </div>
                    <div className="status-bar-item">
                      <span className="status-label">Delivered</span>
                      <div className="status-bar-bg">
                        <div className="status-bar-fill" style={{ width: `${(stats.deliveredOrders / stats.totalOrders) * 100 || 0}%`, background: '#2e7d32' }}></div>
                      </div>
                      <span className="status-count">{stats.deliveredOrders}</span>
                    </div>
                    <div className="status-bar-item">
                      <span className="status-label">Cancelled</span>
                      <div className="status-bar-bg">
                        <div className="status-bar-fill" style={{ width: `${(stats.cancelledOrders / stats.totalOrders) * 100 || 0}%`, background: '#f44336' }}></div>
                      </div>
                      <span className="status-count">{stats.cancelledOrders}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-chart-card">
                <h3>Products by Category</h3>
                <div className="pie-chart-simple">
                  {Object.entries(salesByCategory).map(([category, count], index) => {
                    const percentage = (count / safeProducts.length) * 100
                    const colors = ['#8B4513', '#CD853F', '#D2691E', '#A0522D', '#FFD700']
                    return (
                      <div key={category} className="pie-segment-label">
                        <span className="pie-color" style={{ background: colors[index % colors.length] }}></span>
                        <span className="pie-name">{category}</span>
                        <span className="pie-percent">{percentage.toFixed(1)}%</span>
                        <span className="pie-count">({count})</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="quick-insights">
              <h3>Quick Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">🔄</div>
                  <div className="insight-info">
                    <p className="insight-label">Avg Order Value</p>
                    <p className="insight-value">Rs. {(stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">✅</div>
                  <div className="insight-info">
                    <p className="insight-label">Completion Rate</p>
                    <p className="insight-value">{stats.totalOrders ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">📊</div>
                  <div className="insight-info">
                    <p className="insight-label">Products/User</p>
                    <p className="insight-value">{stats.totalUsers ? (stats.totalProducts / stats.totalUsers).toFixed(1) : 0}</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">💰</div>
                  <div className="insight-info">
                    <p className="insight-label">Revenue/User</p>
                    <p className="insight-value">Rs. {stats.totalUsers ? (stats.totalRevenue / stats.totalUsers).toFixed(0) : 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Detail Modal */}
      {showStatsModal && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal-content stats-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{statsModalData.title}</h2>
              <button className="close-modal-btn" onClick={() => setShowStatsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {statsModalData.data.length === 0 ? (
                <p className="no-data-msg">No data available</p>
              ) : (
                <div className="stats-table-wrap">
                  <table className="stats-detail-table">
                    <thead>
                      <tr>
                        {Object.keys(statsModalData.data[0]).map(key => (
                          <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {statsModalData.data.map((item, index) => (
                        <tr key={index}>
                          {Object.values(item).map((value, i) => {
                            const key = Object.keys(item)[i]
                            const isIdField = key === 'id' || key === 'user_id' || key === 'status' || key === 'month'
                            const isNumericPrice = typeof value === 'number' && (key === 'amount' || key === 'revenue' || key === 'price' || key === 'total')
                            return (
                              <td key={i}>
                                {isNumericPrice && !isIdField ? `Rs. ${value.toLocaleString()}` :
                                 value || 'N/A'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-footer-btn" onClick={() => setShowStatsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Khalti Payment Detail Modal */}
      {viewingPaymentOrder && (
        <div className="modal-overlay" onClick={() => setViewingPaymentOrder(null)}>
          <div className="modal-content payment-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📱 Khalti Payment Details</h2>
              <button className="close-modal-btn" onClick={() => setViewingPaymentOrder(null)}>✕</button>
            </div>
            <div className="payment-detail-body">
              <div className="payment-detail-row">
                <span>Order ID</span>
                <strong>#{viewingPaymentOrder.id}</strong>
              </div>
              <div className="payment-detail-row">
                <span>Transaction ID</span>
                <strong>{viewingPaymentOrder.transaction_id || 'N/A'}</strong>
              </div>
              <div className="payment-detail-row">
                <span>Date</span>
                <strong>{formatNepalTime(viewingPaymentOrder.created_at)}</strong>
              </div>
              <div className="payment-detail-row">
                <span>Amount</span>
                <strong>Rs. {viewingPaymentOrder.total_amount || 0}</strong>
              </div>
              <div className="payment-detail-row">
                <span>Payment Status</span>
                <strong className={viewingPaymentOrder.payment_status === 'paid' ? 'payment-status-paid' : 'payment-status-pending'}>
                  {viewingPaymentOrder.payment_status === 'paid' ? '✅ Paid' : (viewingPaymentOrder.payment_status || 'pending')}
                </strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-footer-btn" onClick={() => setViewingPaymentOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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