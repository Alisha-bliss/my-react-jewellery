import './Checkout.css'
import { useState, useEffect } from 'react'

function Checkout({ cart, getTotal, user, onClose, clearCart }) {
  // ========== PAYMENT CONFIGURATION ==========
  // Esewa TEST Configuration
  const ESEWA_MERCHANT_ID = 'EPAYTEST'
  const ESEWA_URL = 'https://uat.esewa.com.np/epay/main'
  
  // Khalti TEST Configuration - Using official public test key
 const KHALTI_PUBLIC_KEY = 'test_public_key_55f8c3c4d4e8b2a1f5c3d4e8b2a1f5c3'

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
          total: getTotal(),
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
        } else if (paymentMethod === 'esewa') {
          setLoading(false)
          initiateEsewaPayment(orderData.orderId, getTotal())
        } else if (paymentMethod === 'khalti') {
          setLoading(false)
          initiateKhaltiPayment(orderData.orderId, getTotal())
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

  const initiateEsewaPayment = (orderId, amount) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = ESEWA_URL
    form.target = '_blank'
    
    const params = {
      amt: amount,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: amount,
      pid: orderId,
      scd: ESEWA_MERCHANT_ID,
      su: `${window.location.origin}/payment-success`,
      fu: `${window.location.origin}/payment-failed`
    }

    Object.keys(params).forEach(key => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = params[key]
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    
    setTimeout(() => {
      document.body.removeChild(form)
    }, 1000)
  }

  const initiateKhaltiPayment = (orderId, amount) => {
    const khaltiConfig = {
      publicKey: KHALTI_PUBLIC_KEY,
      productIdentity: orderId,
      productName: 'Siddhi Jewells Order',
      productUrl: window.location.origin,
      eventHandler: {
        onSuccess(payload) {
          console.log('Payment Success:', payload)
          setOrderMessage('Payment successful! Your order has been confirmed.')
          setOrderPlaced(true)
          clearCart()
          setLoading(false)
        },
        onError(error) {
          console.error('Payment Error:', error)
          alert('Payment failed. Please try again.')
          setLoading(false)
        },
        onClose() {
          console.log('Widget closed')
          setLoading(false)
        }
      },
      paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
      amount: amount * 100
    }

    try {
      if (typeof window.KhaltiCheckout === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js'
        script.onload = () => {
          const checkout = new window.KhaltiCheckout(khaltiConfig)
          checkout.show({ amount: amount * 100 })
        }
        script.onerror = () => {
          alert('Failed to load Khalti payment. Please try again.')
          setLoading(false)
        }
        document.body.appendChild(script)
      } else {
        const checkout = new window.KhaltiCheckout(khaltiConfig)
        checkout.show({ amount: amount * 100 })
      }
    } catch (error) {
      console.error('Khalti error:', error)
      alert('Failed to initialize Khalti payment. Please try again.')
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
                    <div className="payment-radio">
                      <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                      <span className="payment-label">Cash on Delivery</span>
                    </div>
                    <div className="payment-icon">💰</div>
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'esewa' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('esewa')}
                  >
                    <div className="payment-radio">
                      <input type="radio" checked={paymentMethod === 'esewa'} readOnly />
                      <span className="payment-label">Esewa</span>
                    </div>
                    <div className="payment-icon">💳</div>
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'khalti' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('khalti')}
                  >
                    <div className="payment-radio">
                      <input type="radio" checked={paymentMethod === 'khalti'} readOnly />
                      <span className="payment-label">Khalti</span>
                    </div>
                    <div className="payment-icon">📱</div>
                  </div>
                </div>

                <button type="submit" className="place-order-btn" disabled={loading}>
                  {loading ? 'Processing...' : `Place Order (Rs. ${getTotal().toLocaleString()})`}
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
                <span>Free</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="total-row">
                  <span>COD Fee</span>
                  <span>Rs. 50</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total</span>
                <span>Rs. {(paymentMethod === 'cod' ? getTotal() + 50 : getTotal()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout