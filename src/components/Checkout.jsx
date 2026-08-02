import './Checkout.css'
import { useState, useEffect } from 'react'

function Checkout({ cart, getTotal, getShippingFee, getGrandTotal, user, onClose, clearCart }) {
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    deliveryNote: ''
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [orderMessage, setOrderMessage] = useState('')

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setOrderMessage('')

    // Validate form
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      alert('Please fill in all required fields!')
      setLoading(false)
      return
    }

    if (!user) {
      alert('Please login first to place an order!')
      setLoading(false)
      return
    }

    try {
      const orderResponse = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: getGrandTotal(),
          shipping_fee: getShippingFee(),
          payment_method: paymentMethod,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.district}`,
          phone: formData.phone,
          fullName: formData.fullName
        })
      })

      const orderData = await orderResponse.json()

      if (orderResponse.ok) {
        setOrderId(orderData.orderId)
        
        if (paymentMethod === 'cod') {
          setOrderMessage('Order placed successfully! You will pay cash on delivery.')
          setOrderPlaced(true)
          clearCart()
          setLoading(false)
        } else if (paymentMethod === 'khalti') {
          setLoading(false)
          initiateKhaltiPayment(orderData.orderId, getGrandTotal())
        }
      } else {
        alert('Failed to place order: ' + orderData.error)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  const initiateKhaltiPayment = async (orderId, amount) => {
    // Khalti's old in-page widget (khalti-checkout.iffe.js / KPG-1) is
    // discontinued. The current flow (KPG-2) requires the backend to call
    // Khalti's initiate API with a secret key, then we redirect the user
    // to the payment_url Khalti gives back. See backend/server.js.
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/payment/khalti/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (response.ok && data.payment_url) {
        // Full redirect to Khalti's hosted payment page.
        // The user is sent back to FRONTEND_URL afterwards with ?pidx=...
        // which App.jsx picks up to verify the payment.
        window.location.href = data.payment_url
      } else {
        console.error('Khalti initiate failed:', data)
        alert('Failed to start Khalti payment: ' + (data.error || 'Unknown error'))
        setLoading(false)
      }
    } catch (error) {
      console.error('Khalti initiate error:', error)
      alert('Failed to start Khalti payment. Please try again.')
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>{orderMessage || 'Thank you for your order. We\'ll process it soon.'}</p>
            <p className="order-number">Order #: {orderId}</p>
            <button className="continue-shopping-btn" onClick={onClose}>
              Continue Shopping →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="back-to-cart" onClick={onClose}>← Back to Cart</button>
        <h1>Checkout</h1>

        <div className="checkout-grid">
          {/* Left - Shipping Information */}
          <div className="shipping-section">
            <h2>Shipping Address</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="98XXXXXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Address *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street, House number, Landmark"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Delivery Note (Optional)</label>
                <textarea
                  name="deliveryNote"
                  rows="3"
                  placeholder="Any special instructions for delivery"
                  value={formData.deliveryNote}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* Payment Methods */}
              <div className="payment-section">
                <h2>Payment Method</h2>
                
                <div className="payment-options">
                  <div
                    className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input type="radio" className="payment-option-radio" checked={paymentMethod === 'cod'} readOnly />
                    <div className="payment-icon payment-icon-cod">💵</div>
                    <span className="payment-label">Cash on Delivery</span>
                  </div>

                  <div
                    className={`payment-option ${paymentMethod === 'khalti' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('khalti')}
                  >
                    <input type="radio" className="payment-option-radio" checked={paymentMethod === 'khalti'} readOnly />
                    <div className="payment-icon payment-icon-khalti">K</div>
                    <span className="payment-label">Khalti</span>
                  </div>
                </div>

                <button type="submit" className="place-order-btn" disabled={loading}>
                  {loading ? 'Processing...' : `Place Order (Rs. ${getGrandTotal().toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>

          {/* Right - Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image_url} alt={item.name} />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">Rs. {item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs. {getTotal().toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{getShippingFee() === 0 ? 'Free' : `Rs. ${getShippingFee()}`}</span>
              </div>
              {getShippingFee() > 0 && (
                <p className="free-shipping-hint">Add Rs. {(10000 - getTotal()).toLocaleString()} more for free shipping!</p>
              )}
              <div className="total-row grand-total">
                <span>Total</span>
                <span>Rs. {getGrandTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout