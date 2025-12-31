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
    <div className="page" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
      <h1 style={{ 
        color: '#000080', 
        marginBottom: '0.5rem',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Place Order
      </h1>
      <p style={{ color: '#808080', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Create and manage orders for customers
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Customer Selection Section */}
        <div>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              1. Select or Add Customer
            </div>
            <div style={{ padding: '1rem', background: 'white' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                Existing Customer:
              </label>
              <select 
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
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
                  padding: '0.5rem 1rem',
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
                onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
              >
                {showNewCustomerForm ? 'Cancel' : '+ Add New Customer'}
              </button>

              {showNewCustomerForm && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #c0c0c0' }}>
                  <input 
                    type="text" 
                    placeholder="Company Name"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      marginBottom: '0.5rem',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                  <input 
                    type="email" 
                    placeholder="Email"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      marginBottom: '0.5rem',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone"
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      marginBottom: '0.5rem',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button 
                    style={{ 
                      width: '100%',
                      padding: '0.5rem 1rem',
                      background: '#c0c0c0',
                      border: '2px solid',
                      borderColor: '#ffffff #000000 #000000 #ffffff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                    onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                    onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                  >
                    Save Customer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              3. Payment Information
            </div>
            <div style={{ padding: '1rem', background: 'white' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                Payment Method:
              </label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
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
                background: '#f0f0f0',
                border: '2px solid',
                borderColor: '#808080 #ffffff #ffffff #808080',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 'bold' }}>${calculateTotal()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Tax (8%):</span>
                  <span style={{ fontWeight: 'bold' }}>${(calculateTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  marginTop: '0.5rem',
                  borderTop: '2px solid #000080',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#000080'
                }}>
                  <span>Total:</span>
                  <span>${(parseFloat(calculateTotal()) * 1.08).toFixed(2)}</span>
                </div>
              </div>

              <button 
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
                onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
              >
                Process Payment & Complete Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Items Section */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Available Items */}
          <div>
            <div style={{
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ffffff #000000 #000000 #ffffff'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #000080, #0000aa)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                2. Available Inventory
              </div>
              <div style={{ padding: '1rem', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {availableItems.map(item => (
                    <div 
                      key={item.id}
                      style={{ 
                        padding: '0.75rem',
                        background: '#f0f0f0',
                        border: '2px solid',
                        borderColor: '#ffffff #808080 #808080 #ffffff'
                      }}
                    >
                      <h4 style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#000080'
                      }}>
                        {item.name}
                      </h4>
                      <p style={{ 
                        margin: '0 0 0.25rem 0', 
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        ${item.price.toFixed(2)}
                      </p>
                      <p style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '0.75rem', 
                        color: '#808080' 
                      }}>
                        Stock: {item.stock}
                      </p>
                      <button 
                        onClick={() => addItemToOrder(item)}
                        style={{ 
                          width: '100%',
                          padding: '0.4rem',
                          background: '#c0c0c0',
                          border: '2px solid',
                          borderColor: '#ffffff #000000 #000000 #ffffff',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          fontFamily: 'MS Sans Serif, sans-serif'
                        }}
                        onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                        onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Order */}
          <div>
            <div style={{
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ffffff #000000 #000000 #ffffff'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #000080, #0000aa)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                Current Order
              </div>
              <div style={{ 
                padding: '1rem', 
                background: 'white',
                minHeight: '300px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {orderItems.length === 0 ? (
                  <p style={{ 
                    color: '#808080', 
                    textAlign: 'center', 
                    padding: '2rem',
                    fontSize: '0.875rem'
                  }}>
                    No items added yet
                  </p>
                ) : (
                  orderItems.map(item => (
                    <div 
                      key={item.id}
                      style={{ 
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem'
                      }}>
                        {item.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#808080',
                        marginBottom: '0.5rem'
                      }}>
                        ${item.price.toFixed(2)} each
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          min="1"
                          max={item.stock}
                          style={{ 
                            width: '50px',
                            padding: '0.25rem',
                            border: '2px solid',
                            borderColor: '#808080 #ffffff #ffffff #808080',
                            textAlign: 'center',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.75rem'
                          }}
                        />
                        <button 
                          onClick={() => removeItemFromOrder(item.id)}
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            background: '#c0c0c0',
                            border: '2px solid',
                            borderColor: '#ffffff #000000 #000000 #ffffff',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            lineHeight: '1'
                          }}
                          onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                          onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
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
      </div>

      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ffffff #000000 #000000 #ffffff',
        fontSize: '0.875rem'
      }}>
        <div style={{
          background: 'linear-gradient(to right, #000080, #0000aa)',
          color: 'white',
          padding: '0.25rem 0.5rem',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          marginBottom: '0.5rem'
        }}>
          Note
        </div>
        <div style={{ padding: '0.5rem', background: 'white' }}>
          <strong>Database integration pending.</strong> Orders will be tracked and stored once connected.
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder
