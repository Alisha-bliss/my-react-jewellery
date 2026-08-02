import './Receipt.css'

function Receipt({ order, transactionId, onContinue, onViewOrders }) {
  if (!order) {
    return (
      <div className="receipt-page">
        <div className="receipt-container">
          <p>No receipt data available.</p>
          <button className="continue-shopping-btn" onClick={onContinue}>Continue Shopping →</button>
        </div>
      </div>
    )
  }

  const items = order.items || []
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="receipt-page">
      <div className="receipt-container">
        <div className="receipt-success-header">
          <div className="success-icon">✅</div>
          <h1>Payment Successful</h1>
          <p>Thank you! Your order has been paid for via Khalti.</p>
        </div>

        <div className="receipt-meta">
          <div>
            <span className="meta-label">Order #</span>
            <span className="meta-value">{order.id}</span>
          </div>
          <div>
            <span className="meta-label">Transaction ID</span>
            <span className="meta-value">{transactionId || order.transaction_id || 'N/A'}</span>
          </div>
          <div>
            <span className="meta-label">Date</span>
            <span className="meta-value">
              {order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <span className="meta-value paid-status">Paid</span>
          </div>
        </div>

        <div className="receipt-billed-to">
          <h3>Billed To</h3>
          <p>{order.customer_name}</p>
          <p>{order.phone}</p>
          <p>{order.shipping_address}</p>
        </div>

        <div className="receipt-items">
          <h3>Order Items</h3>
          {items.length > 0 ? (
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name || 'Item'}</td>
                    <td>{item.quantity}</td>
                    <td>Rs. {item.price}</td>
                    <td>Rs. {item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Rs. {order.total_amount}</p>
          )}
        </div>

        <div className="receipt-totals">
          {items.length > 0 && (
            <div className="receipt-total-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
          )}
          <div className="receipt-total-row grand">
            <span>Total Paid</span>
            <span>Rs. {order.total_amount}</span>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="view-orders-btn" onClick={onViewOrders}>View My Orders</button>
          <button className="continue-shopping-btn" onClick={onContinue}>Continue Shopping →</button>
        </div>
      </div>
    </div>
  )
}

export default Receipt
