import React, { useState, useEffect } from 'react'

function PlaceOrder() {
  const [existingCustomers, setExistingCustomers] = useState([])
  const [availableItems, setAvailableItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  useEffect(() => {
    fetchCustomers()
    fetchInventory()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers')
      const data = await response.json()
      setExistingCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory')
      const data = await response.json()
      setAvailableItems(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setLoading(false)
    }
  }

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Customer Selection Section */}
        <div style={{ width: '100%' }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
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
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  fontFamily: 'MS Sans Serif, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <option value="">{loading ? '-- Loading customers... --' : '-- Select a customer --'}</option>
                {existingCustomers.map(customer => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.company_name} ({customer.email})
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
                  borderColor: '#ebebeb #000000 #000000 #ebebeb',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
                onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
                onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
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
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
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
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
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
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
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
                      borderColor: '#ebebeb #000000 #000000 #ebebeb',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                    onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
                    onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
                  >
                    Save Customer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div style={{ width: '100%' }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              2. Payment Information
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
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
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
                borderColor: '#808080 #ebebeb #ebebeb #808080',
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
                  borderColor: '#ebebeb #000000 #000000 #ebebeb',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
                onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
                onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
              >
                Process Payment & Complete Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Items Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Available Items */}
        <div style={{ width: '100%' }}>
            <div style={{
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ebebeb #000000 #000000 #ebebeb'
            }}>
              <div style={{
                background: 'linear-gradient(to right, #000080, #0000aa)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                3. Available Inventory
              </div>
              <div style={{ padding: '1rem', background: 'white' }}>
                {loading ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#808080', fontSize: '0.875rem' }}>
                    Loading inventory...
                  </p>
                ) : availableItems.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#808080', fontSize: '0.875rem' }}>
                    No inventory items available
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {availableItems.map(item => (
                      <div 
                        key={item.item_id}
                        style={{ 
                          padding: '0.75rem',
                          background: '#f0f0f0',
                          border: '2px solid',
                          borderColor: '#ebebeb #808080 #808080 #ebebeb'
                        }}
                      >
                        <h4 style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#000080'
                        }}>
                          {item.item_name}
                        </h4>
                        <p style={{ 
                          margin: '0 0 0.25rem 0', 
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          ${parseFloat(item.unit_price).toFixed(2)}
                        </p>
                        <p style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '0.75rem', 
                          color: '#808080' 
                        }}>
                          Stock: {item.quantity_in_stock}
                        </p>
                        <button 
                          onClick={() => addItemToOrder(item)}
                          style={{ 
                            width: '100%',
                            padding: '0.4rem',
                            background: '#c0c0c0',
                            border: '2px solid',
                            borderColor: '#ebebeb #000000 #000000 #ebebeb',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            fontFamily: 'MS Sans Serif, sans-serif'
                          }}
                          onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
                          onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Current Order */}
        <div style={{ width: '100%' }}>
            <div style={{
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ebebeb #000000 #000000 #ebebeb'
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
                      key={item.item_id}
                      style={{ 
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        border: '2px solid',
                        borderColor: '#808080 #ebebeb #ebebeb #808080',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem'
                      }}>
                        {item.item_name}
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
                          onChange={(e) => updateQuantity(item.item_id, parseInt(e.target.value))}
                          min="1"
                          max={item.quantity_in_stock}
                          style={{ 
                            width: '50px',
                            padding: '0.25rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            textAlign: 'center',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.75rem'
                          }}
                        />
                        <button 
                          onClick={() => removeItemFromOrder(item.item_id)}
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            background: '#c0c0c0',
                            border: '2px solid',
                            borderColor: '#ebebeb #000000 #000000 #ebebeb',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            lineHeight: '1'
                          }}
                          onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
                          onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
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

      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ebebeb #000000 #000000 #ebebeb',
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
