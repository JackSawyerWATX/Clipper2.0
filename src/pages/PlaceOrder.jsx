import React, { useState, useEffect } from 'react'

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

  const sectionStyle = {
    background: '#c0c0c0',
    border: '2px solid',
    borderColor: '#ebebeb #000000 #000000 #ebebeb',
    marginBottom: '1rem'
  }

  const headerStyle = {
    background: 'linear-gradient(to right, #000080, #0000aa)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    fontWeight: 'bold',
    fontSize: '0.875rem'
  }

  const contentStyle = {
    padding: '0.75rem',
    background: 'white'
  }

  const inputStyle = {
    padding: '0.4rem',
    border: '2px solid',
    borderColor: '#808080 #ebebeb #ebebeb #808080',
    fontSize: '0.75rem',
    fontFamily: 'MS Sans Serif, sans-serif'
  }

  const buttonStyle = {
    padding: '0.4rem 0.75rem',
    background: '#c0c0c0',
    border: '2px solid',
    borderColor: '#ebebeb #000000 #000000 #ebebeb',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    fontFamily: 'MS Sans Serif, sans-serif'
  }

  return (
    <div className="page" style={{ fontFamily: 'MS Sans Serif, sans-serif', padding: '1rem' }}>
      <h1 style={{
        color: '#000080',
        marginBottom: '0.5rem',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Place Order
      </h1>
      <p style={{ color: '#808080', marginBottom: '1rem', fontSize: '0.875rem' }}>
        Create and manage orders for customers
      </p>

      {/* 1. Customer Selection */}
      <div style={sectionStyle}>
        <div style={headerStyle}>1. Select Customer</div>
        <div style={contentStyle}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.75rem' }}>
                Customer:
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                disabled={loading}
                style={{ ...inputStyle, width: '100%', opacity: loading ? 0.6 : 1 }}
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
              style={{ ...buttonStyle, marginTop: '1.35rem', whiteSpace: 'nowrap' }}
              onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
              onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
            >
              {showNewCustomerForm ? 'Cancel' : '+ New'}
            </button>
          </div>
          {showNewCustomerForm && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid #808080' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input type="text" placeholder="Company Name" style={inputStyle} />
                <input type="email" placeholder="Email" style={inputStyle} />
                <input type="tel" placeholder="Phone" style={inputStyle} />
                <button style={buttonStyle} onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'} onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}>Save Customer</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Payment Method */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Payment Method</div>
        <div style={contentStyle}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.75rem' }}>
                Select Payment Method:
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                style={{ ...inputStyle, width: '100%' }}
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
              style={{ ...buttonStyle, marginTop: '1.35rem', whiteSpace: 'nowrap' }}
              onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
              onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
            >
              {showNewPaymentForm ? 'Cancel' : '+ New'}
            </button>
          </div>
          {showNewPaymentForm && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '2px solid #808080' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <select style={inputStyle}>
                  <option value="">Payment Type</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="check">Check</option>
                </select>
                <input type="text" placeholder="Card/Account Number" style={inputStyle} />
                <input type="text" placeholder="Expiration (MM/YY)" style={inputStyle} />
                <button style={buttonStyle} onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'} onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}>Save Payment</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Add Items to Order */}
      <div style={sectionStyle}>
        <div style={headerStyle}>3. Add Items to Order</div>
        <div style={contentStyle}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.75rem' }}>
              Search Inventory:
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {filteredItems.map(item => (
              <button
                key={item.item_id}
                onClick={() => addItemToOrder(item)}
                disabled={item.quantity_in_stock === 0}
                style={{
                  padding: '0.5rem',
                  background: item.quantity_in_stock === 0 ? '#808080' : '#f0f0f0',
                  border: '2px solid',
                  borderColor: '#ebebeb #808080 #808080 #ebebeb',
                  cursor: item.quantity_in_stock === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.7rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{item.item_name}</div>
                <div>${parseFloat(item.unit_price).toFixed(2)}</div>
                <div style={{ color: item.quantity_in_stock < 10 ? '#800000' : '#808080', fontSize: '0.65rem' }}>
                  Stock: {item.quantity_in_stock}
                </div>
              </button>
            ))}
          </div>

          <div style={{ padding: '0.5rem', background: '#f0f0f0', border: '2px solid', borderColor: '#808080 #ebebeb #ebebeb #808080', minHeight: '80px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.5rem', color: '#000080' }}>
              Order Items ({orderItems.length}):
            </div>
            {orderItems.length === 0 ? (
              <p style={{ color: '#808080', fontSize: '0.75rem', margin: 0 }}>No items added</p>
            ) : (
              orderItems.map(item => (
                <div key={item.item_id} style={{ padding: '0.35rem', background: 'white', border: '1px solid #808080', marginBottom: '0.25rem', display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.7rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{item.item_name}</div>
                    <div style={{ color: '#808080' }}>${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.item_id, parseInt(e.target.value))}
                    min="1"
                    style={{ width: '40px', ...inputStyle }}
                  />
                  <button onClick={() => removeItemFromOrder(item.item_id)} style={{ ...buttonStyle, padding: '0.2rem 0.4rem' }} onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'} onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}>×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Shipping Method */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Shipping Method</div>
        <div style={contentStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.75rem' }}>Carrier:</label>
              <select
                value={shippingCarrier}
                onChange={(e) => handleCarrierChange(e.target.value)}
                style={{ ...inputStyle, width: '100%' }}
              >
                <option value="">-- Select carrier --</option>
                <option value="fedex">FedEx</option>
                <option value="ups">UPS</option>
                <option value="usps">USPS</option>
                <option value="dhl">DHL</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 'bold', fontSize: '0.75rem' }}>Service:</label>
              <select
                value={shippingService}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={!shippingCarrier}
                style={{ ...inputStyle, width: '100%', opacity: shippingCarrier ? 1 : 0.6 }}
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
            <div style={{ marginTop: '0.5rem', padding: '0.35rem', background: '#f0f0f0', fontSize: '0.75rem' }}>
              <strong>Selected:</strong> {shippingService} - ${shippingRate.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* 5. Order Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Order Summary</div>
        <div style={contentStyle}>
          <div style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', paddingBottom: '0.35rem' }}>
              <span><strong>Customer:</strong></span>
              <span>{existingCustomers.find(c => c.customer_id === parseInt(selectedCustomer))?.company_name || 'Not selected'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', paddingBottom: '0.35rem' }}>
              <span><strong>Shipping:</strong></span>
              <span>{shippingService || 'Not selected'}</span>
            </div>
          </div>

          <div style={{ padding: '0.5rem', background: '#f0f0f0', border: '2px solid', borderColor: '#808080 #ebebeb #ebebeb #808080', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Tax (8%):</span>
              <span style={{ fontWeight: 'bold' }}>${calculateTax().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Shipping:</span>
              <span style={{ fontWeight: 'bold' }}>${shippingRate.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', marginTop: '0.35rem', borderTop: '2px solid #000080', fontSize: '0.9rem', fontWeight: 'bold', color: '#000080' }}>
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>

          <button
            disabled={orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService}
            style={{
              width: '100%',
              ...buttonStyle,
              background: (orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService) ? '#808080' : '#c0c0c0',
              cursor: (orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService) ? 'not-allowed' : 'pointer',
              color: (orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService) ? '#c0c0c0' : '#000000'
            }}
            onMouseDown={(e) => (orderItems.length > 0 && selectedCustomer && selectedPaymentMethod && shippingService) && (e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000')}
            onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
          >
            Complete Order
          </button>
          {(orderItems.length === 0 || !selectedCustomer || !selectedPaymentMethod || !shippingService) && (
            <p style={{ fontSize: '0.7rem', color: '#800000', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
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