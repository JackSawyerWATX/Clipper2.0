import React, { useState } from 'react'

function PlaceOrder() {
  // Mock data - will be replaced with database data later
  const [existingCustomers] = useState([
    { id: 1, name: 'Acme Corporation', email: 'contact@acme.com' },
    { id: 2, name: 'Tech Solutions Inc', email: 'info@techsolutions.com' },
    { id: 3, name: 'Global Enterprises', email: 'hello@global.com' },
  ])

  const [availableItems] = useState([
    { id: 1, name: 'Product A', price: 25.00, stock: 100 },
    { id: 2, name: 'Product B', price: 45.00, stock: 50 },
    { id: 3, name: 'Product C', price: 15.00, stock: 200 },
    { id: 4, name: 'Product D', price: 60.00, stock: 30 },
  ])

  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  const addItemToOrder = (item) => {
    const existing = orderItems.find(i => i.id === item.id)
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }])
    }
  }

  const removeItemFromOrder = (itemId) => {
    setOrderItems(orderItems.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId)
    } else {
      setOrderItems(orderItems.map(i => 
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      ))
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
  }

  return (
    <div className="page">
      <h1>Place Order</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem' }}>Create and manage orders for customers</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Customer Selection Section */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>1. Select or Add Customer</h2>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Existing Customer:
            </label>
            <select 
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            >
              <option value="">-- Select a customer --</option>
              {existingCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>

            <button 
              onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                background: showNewCustomerForm ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {showNewCustomerForm ? 'Cancel' : '+ Add New Customer'}
            </button>

            {showNewCustomerForm && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
                <input 
                  type="text" 
                  placeholder="Company Name"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}
                />
                <input 
                  type="email" 
                  placeholder="Email"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}
                />
                <input 
                  type="tel" 
                  placeholder="Phone"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}
                />
                <button style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  background: '#61dafb',
                  color: '#282c34',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  Save Customer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>3. Payment Information</h2>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Payment Method:
            </label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            <div style={{ 
              padding: '1rem',
              background: 'white',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '500' }}>${calculateTotal()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tax (8%):</span>
                <span style={{ fontWeight: '500' }}>${(calculateTotal() * 0.08).toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '2px solid #dee2e6',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span>${(parseFloat(calculateTotal()) * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <button style={{ 
              width: '100%',
              padding: '1rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              Process Payment & Complete Order
            </button>
          </div>
        </div>
      </div>

      {/* Add Items Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>2. Add Items to Order</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Available Items */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Available Inventory</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {availableItems.map(item => (
                <div 
                  key={item.id}
                  style={{ 
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
                    ${item.price.toFixed(2)}
                  </p>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#6c757d' }}>
                    Stock: {item.stock}
                  </p>
                  <button 
                    onClick={() => addItemToOrder(item)}
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      background: '#61dafb',
                      color: '#282c34',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Order */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Current Order</h3>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', minHeight: '200px' }}>
              {orderItems.length === 0 ? (
                <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>
                  No items added yet
                </p>
              ) : (
                orderItems.map(item => (
                  <div 
                    key={item.id}
                    style={{ 
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{item.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        min="1"
                        max={item.stock}
                        style={{ 
                          width: '60px',
                          padding: '0.25rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}
                      />
                      <button 
                        onClick={() => removeItemFromOrder(item.id)}
                        style={{ 
                          padding: '0.25rem 0.5rem',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#d1ecf1', borderRadius: '4px', color: '#0c5460' }}>
        <strong>Note:</strong> Database integration pending. Orders will be tracked and stored once connected.
      </div>
    </div>
  )
}

export default PlaceOrder
