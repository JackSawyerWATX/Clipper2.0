import React, { useState, useEffect } from 'react'
import '../styles/PlaceOrder.css'

function PlaceOrder() {
  const [existingCustomers, setExistingCustomers] = useState([])
  const [availableItems, setAvailableItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [orderItems, setOrderItems] = useState([])

  // Payment states
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Credit Card', last4: '4242', default: true },
    { id: 2, type: 'Debit Card', last4: '5555', default: false }
  ])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('1')
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false)

  // Inventory search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState('')

  // Shipping states
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [shippingService, setShippingService] = useState('')
  const [shippingRate, setShippingRate] = useState(0)

  const shippingOptions = {
    fedex: [
      { service: 'FedEx Ground', rate: 12.50 },
      { service: 'FedEx 2Day', rate: 25.00 },
      { service: 'FedEx Overnight', rate: 45.00 }
    ],
    ups: [
      { service: 'UPS Ground', rate: 11.00 },
      { service: 'UPS 3-Day Select', rate: 22.00 },
      { service: 'UPS Next Day Air', rate: 42.00 }
    ],
    usps: [
      { service: 'USPS Priority Mail', rate: 8.50 },
      { service: 'USPS Priority Mail Express', rate: 28.00 },
      { service: 'USPS First-Class Package', rate: 5.00 }
    ],
    dhl: [
      { service: 'DHL Express Worldwide', rate: 35.00 },
      { service: 'DHL Express 12:00', rate: 48.00 },
      { service: 'DHL Economy Select', rate: 18.00 }
    ]
  }

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setExistingCustomers([
        { customer_id: 1, company_name: 'Acme Corp' },
        { customer_id: 2, company_name: 'TechCo' },
        { customer_id: 3, company_name: 'Global Industries' }
      ])
      setAvailableItems([
        { item_id: 1, item_name: 'Widget A', unit_price: '15.99', quantity_in_stock: 50 },
        { item_id: 2, item_name: 'Widget B', unit_price: '24.99', quantity_in_stock: 30 },
        { item_id: 3, item_name: 'Gadget X', unit_price: '49.99', quantity_in_stock: 15 },
        { item_id: 4, item_name: 'Gadget Y', unit_price: '39.99', quantity_in_stock: 8 },
        { item_id: 5, item_name: 'Component Z', unit_price: '9.99', quantity_in_stock: 0 }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const addItemToOrder = (item) => {
    const existing = orderItems.find(i => i.item_id === item.item_id)
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setOrderItems([...orderItems, {
        ...item,
        quantity: 1,
        price: parseFloat(item.unit_price)
      }])
    }
  }

  const handleCarrierChange = (carrier) => {
    setShippingCarrier(carrier)
    setShippingService('')
    setShippingRate(0)
  }

  const handleServiceChange = (service) => {
    setShippingService(service)
    const carrier = shippingOptions[shippingCarrier]
    const selectedService = carrier?.find(s => s.service === service)
    if (selectedService) {
      setShippingRate(selectedService.rate)
    }
  }

  const filteredItems = availableItems.filter(item =>
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08
  }

  const calculateTotal = () => {
    return (calculateSubtotal() + calculateTax() + shippingRate).toFixed(2)
  }

  const removeItemFromOrder = (itemId) => {
    setOrderItems(orderItems.filter(i => i.item_id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId)
    } else {
      setOrderItems(orderItems.map(i =>
        i.item_id === itemId ? { ...i, quantity: newQuantity } : i
      ))
    }
  }



  return (
    <div className="place-order-page">
      <h1 className="place-order-title">
        Place Order
      </h1>
      <p className="place-order-description">
        Create and manage orders for customers
      </p>

      {/* 1. Customer Selection */}
      <div className="order-section">
        <div className="section-header">1. Select Customer</div>
        <div className="section-content">
          <div className="customer-selection-row">
            <div className="customer-select-container">
              <label className="order-label">
                Customer:
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                disabled={loading}
                className="order-input order-input-full"
              >
                <option value="">{loading ? '-- Loading... --' : '-- Select customer --'}</option>
                {existingCustomers.map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
              className="order-button new-button"
            >
              {showNewCustomerForm ? 'Cancel' : '+ New'}
            </button>
          </div>
          {showNewCustomerForm && (
            <div className="new-customer-form">
              <div className="new-customer-grid">
                <input type="text" placeholder="Company Name" className="order-input" />
                <input type="email" placeholder="Email" className="order-input" />
                <input type="tel" placeholder="Phone" className="order-input" />
                <button className="order-button">Save Customer</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Payment Method */}
      <div className="order-section">
        <div className="section-header">2. Payment Method</div>
        <div className="section-content">
          <div className="payment-selection-row">
            <div className="payment-select-container">
              <label className="order-label">
                Select Payment Method:
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="order-input order-input-full"
              >
                <option value="">-- Select payment method --</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.type} ending in {method.last4} {method.default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNewPaymentForm(!showNewPaymentForm)}
              className="order-button new-button"
            >
              {showNewPaymentForm ? 'Cancel' : '+ New'}
            </button>
          </div>
          {showNewPaymentForm && (
            <div className="new-payment-form">
              <div className="new-payment-grid">
                <select className="order-input">
                  <option value="">Payment Type</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="check">Check</option>
                </select>
                <input type="text" placeholder="Card/Account Number" className="order-input" />
                <input type="text" placeholder="Expiration (MM/YY)" className="order-input" />
                <button className="order-button">Save Payment</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Add Items to Order */}
      <div className="order-section">
        <div className="section-header">3. Add Items to Order</div>
        <div className="section-content">
          <div className="search-container">
            <label className="order-label">
              Search Inventory:
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="order-input order-input-full"
            />
          </div>

          <div className="inventory-grid">
            {filteredItems.map(item => (
              <button
                key={item.item_id}
                onClick={() => addItemToOrder(item)}
                disabled={item.quantity_in_stock === 0}
                className="item-card"
              >
                <div className="item-name">{item.item_name}</div>
                <div>${parseFloat(item.unit_price).toFixed(2)}</div>
                <div className={`item-stock ${item.quantity_in_stock < 10 ? 'stock-low' : 'stock-normal'}`}>
                  Stock: {item.quantity_in_stock}
                </div>
              </button>
            ))}
          </div>

          <div className="order-items-container">
            <div className="order-items-header">
              Order Items ({orderItems.length}):
            </div>
            {orderItems.length === 0 ? (
              <p className="no-items-text">No items added</p>
            ) : (
              orderItems.map(item => (
                <div key={item.item_id} className="order-item">
                  <div className="order-item-details">
                    <div className="order-item-name">{item.item_name}</div>
                    <div className="order-item-price">${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.item_id, parseInt(e.target.value))}
                    min="1"
                    className="order-input quantity-input"
                  />
                  <button onClick={() => removeItemFromOrder(item.item_id)} className="order-button remove-button">×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Shipping Method */}
      <div className="order-section">
        <div className="section-header">4. Shipping Method</div>
        <div className="section-content">
          <div className="shipping-grid">
            <div>
              <label className="order-label">Carrier:</label>
              <select
                value={shippingCarrier}
                onChange={(e) => handleCarrierChange(e.target.value)}
                className="order-input order-input-full"
              >
                <option value="">-- Select carrier --</option>
                <option value="fedex">FedEx</option>
                <option value="ups">UPS</option>
                <option value="usps">USPS</option>
                <option value="dhl">DHL</option>
              </select>
            </div>
            <div>
              <label className="order-label">Service:</label>
              <select
                value={shippingService}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={!shippingCarrier}
                className="order-input order-input-full"
              >
                <option value="">-- Select service --</option>
                {shippingCarrier && shippingOptions[shippingCarrier]?.map(option => (
                  <option key={option.service} value={option.service}>
                    {option.service} - ${option.rate.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {shippingService && (
            <div className="shipping-info">
              <strong>Selected:</strong> {shippingService} - ${shippingRate.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* 5. Order Summary */}
      <div className="order-section">
        <div className="section-header">5. Order Summary</div>
        <div className="section-content">
          <div className="summary-info">
            <div className="summary-row">
              <span><strong>Customer:</strong></span>
              <span>{existingCustomers.find(c => c.customer_id === parseInt(selectedCustomer))?.company_name || 'Not selected'}</span>
            </div>
            <div className="summary-row">
              <span><strong>Shipping:</strong></span>
              <span>{shippingService || 'Not selected'}</span>
            </div>
          </div>

          <div className="summary-totals">
            <div className="summary-total-row">
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-total-row">
              <span>Tax (8%):</span>
              <span style={{ fontWeight: 'bold' }}>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="summary-total-row">
              <span>Shipping:</span>
              <span style={{ fontWeight: 'bold' }}>${shippingRate.toFixed(2)}</span>
            </div>
            <div className="summary-grand-total">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>

          <button
            disabled={orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService}
            className="order-button order-button-full"
          >
            Complete Order
          </button>
          {(orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService) && (
            <p className="error-message">
              {!selectedCustomer ? 'Select a customer' :
                !selectedPaymentMethod ? 'Select payment method' :
                  !shippingService ? 'Select shipping method' :
                    'Add items to order'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder