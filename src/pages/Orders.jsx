import React, { useState, useEffect } from 'react'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState(null)
  const [editOrderItems, setEditOrderItems] = useState([])
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('Fetching orders from:', 'http://localhost:3000/api/orders')
      const response = await fetch('http://localhost:3000/api/orders')
      console.log('Response status:', response.status)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      console.log('Orders fetched:', data)
      console.log('Orders length:', Array.isArray(data) ? data.length : 'not an array')
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Failed to load orders. Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleViewOrder = async (order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
    setLoadingDetails(true)
    
    try {
      // Fetch order items for this specific order
      const response = await fetch(`http://localhost:3000/api/customer-orders/order/${order.order_id}`)
      if (response.ok) {
        const items = await response.json()
        setOrderDetails(items)
      } else {
        console.error('Failed to fetch order items')
        setOrderDetails([])
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setOrderDetails([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedOrder(null)
    setOrderDetails(null)
  }

  const handleEditOrder = async (order) => {
    setSelectedOrder(order)
    setShowEditModal(true)
    setLoadingDetails(true)
    
    // Set initial form data
    setEditFormData({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      shipping_address_street: order.shipping_address_street,
      shipping_address_city: order.shipping_address_city,
      shipping_address_state: order.shipping_address_state,
      shipping_address_zip: order.shipping_address_zip,
      shipping_address_country: order.shipping_address_country || 'USA',
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      tax_amount: order.tax_amount,
      notes: order.notes || ''
    })
    
    try {
      // Fetch order items
      const response = await fetch(`http://localhost:3000/api/customer-orders/order/${order.order_id}`)
      if (response.ok) {
        const items = await response.json()
        setEditOrderItems(items)
      } else {
        setEditOrderItems([])
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setEditOrderItems([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (index, field, value) => {
    setEditOrderItems(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
        subtotal: field === 'quantity' || field === 'unit_price' 
          ? (field === 'quantity' ? value : updated[index].quantity) * (field === 'unit_price' ? value : updated[index].unit_price)
          : updated[index].subtotal
      }
      return updated
    })
  }

  const calculateTotals = () => {
    const subtotal = editOrderItems.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0)
    const tax = parseFloat(editFormData?.tax_amount || 0)
    const grandTotal = subtotal + tax
    return { subtotal, tax, grandTotal }
  }

  const handleSaveClick = () => {
    setShowSaveConfirm(true)
  }

  const handleCancelClick = () => {
    setShowCancelConfirm(true)
  }

  const handleConfirmSave = async () => {
    setSaving(true)
    try {
      const { subtotal, grandTotal } = calculateTotals()
      
      // Update order
      const orderResponse = await fetch(`http://localhost:3000/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          total_amount: subtotal,
          grand_total: grandTotal
        })
      })

      if (!orderResponse.ok) throw new Error('Failed to update order')

      // Update order items
      for (const item of editOrderItems) {
        const itemResponse = await fetch(`http://localhost:3000/api/customer-orders/${item.order_item_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal
          })
        })
        if (!itemResponse.ok) throw new Error('Failed to update order item')
      }

      alert('Order updated successfully!')
      setShowSaveConfirm(false)
      setShowEditModal(false)
      setEditFormData(null)
      setEditOrderItems([])
      fetchOrders() // Refresh orders list
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Failed to save order: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSave = () => {
    setShowSaveConfirm(false)
  }

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false)
    setShowEditModal(false)
    setEditFormData(null)
    setEditOrderItems([])
    setSelectedOrder(null)
  }

  const handleCancelCancel = () => {
    setShowCancelConfirm(false)
  }

  // Extract state code from order number (ORD-XXYYZ format)
  const getStateFromOrderNumber = (orderNumber) => {
    if (!orderNumber || !orderNumber.startsWith('ORD-')) return 'N/A'
    const stateCode = orderNumber.substring(4, 6)
    const stateMap = {
      '01': 'AL', '02': 'AK', '03': 'AZ', '04': 'AR', '05': 'CA',
      '06': 'CO', '07': 'CT', '08': 'DE', '09': 'FL', '10': 'GA',
      '11': 'HI', '12': 'ID', '13': 'IL', '14': 'IN', '15': 'IA',
      '16': 'KS', '17': 'KY', '18': 'LA', '19': 'ME', '20': 'MD',
      '21': 'MA', '22': 'MI', '23': 'MN', '24': 'MS', '25': 'MO',
      '26': 'MT', '27': 'NE', '28': 'NV', '29': 'NH', '30': 'NJ',
      '31': 'NM', '32': 'NY', '33': 'NC', '34': 'ND', '35': 'OH',
      '36': 'OK', '37': 'OR', '38': 'PA', '39': 'RI', '40': 'SC',
      '41': 'SD', '42': 'TN', '43': 'TX', '44': 'UT', '45': 'VT',
      '46': 'VA', '47': 'WA', '48': 'WV', '49': 'WI', '50': 'WY',
      '51': 'PR'
    }
    return stateMap[stateCode] || stateCode
  }

  const getStatusColor = (status) => {
    const colors = {
      'Completed': { bg: '#d4edda', text: '#155724' },
      'Processing': { bg: '#fff3cd', text: '#856404' },
      'Shipped': { bg: '#d1ecf1', text: '#0c5460' },
      'Pending': { bg: '#f8d7da', text: '#721c24' },
      'Cancelled': { bg: '#e2e3e5', text: '#383d41' }
    }
    return colors[status] || { bg: '#f8f9fa', text: '#212529' }
  }

  if (loading) {
    return (
      <div className="page">
        <h1 style={{ color: '#000080' }}>Orders</h1>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#808080' }}>
          Loading orders...
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        padding: '0.5rem'
      }}>
        <h1 style={{ 
          color: '#000080',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: 0
        }}>Orders</h1>
        <button style={{ 
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
          + Create New Order
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        padding: '0.5rem',
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#808080 #ffffff #ffffff #808080'
      }}>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search orders..." 
          style={{ 
            padding: '0.4rem 0.5rem',
            flex: '1',
            minWidth: '200px',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            background: 'white',
            fontSize: '0.875rem',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ 
            padding: '0.4rem 0.5rem',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            background: 'white',
            fontSize: '0.875rem',
            fontFamily: 'MS Sans Serif, sans-serif',
            cursor: 'pointer'
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div style={{ 
        overflowX: 'auto',
        border: '2px solid',
        borderColor: '#808080 #ffffff #ffffff #808080',
        background: 'white'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          fontFamily: 'MS Sans Serif, sans-serif',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ 
              background: '#000080',
              color: 'white'
            }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Order ID</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>State</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Customer</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Date</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Total</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Status</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  color: '#808080'
                }}>
                  {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => {
                const statusColors = getStatusColor(order.status)
                const isEvenRow = index % 2 === 0
                return (
                  <tr key={order.order_id} style={{ 
                    background: isEvenRow ? 'white' : '#f0f0f0',
                    borderBottom: '1px solid #c0c0c0'
                  }}>
                    <td style={{ 
                      padding: '0.5rem',
                      fontWeight: 'bold',
                      color: '#000080',
                      borderRight: '1px solid #c0c0c0'
                    }}>
                      {order.order_number}
                    </td>
                    <td style={{ 
                      padding: '0.5rem',
                      fontWeight: 'bold',
                      borderRight: '1px solid #c0c0c0'
                    }}>
                      {getStateFromOrderNumber(order.order_number)}
                    </td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                      {order.customer_name || 'N/A'}
                    </td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ 
                      padding: '0.5rem',
                      fontWeight: 'bold',
                      borderRight: '1px solid #c0c0c0'
                    }}>
                      ${parseFloat(order.grand_total || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: statusColors.bg,
                        color: statusColors.text,
                        border: '1px solid',
                        borderColor: statusColors.text
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button style={{ 
                        padding: '0.25rem 0.75rem',
                        marginRight: '0.25rem',
                        background: '#c0c0c0',
                        border: '2px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'MS Sans Serif, sans-serif'
                      }}
                      onClick={() => handleViewOrder(order)}
                      onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                      onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      >
                        View
                      </button>
                      <button style={{ 
                        padding: '0.25rem 0.75rem',
                        background: '#c0c0c0',
                        border: '2px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'MS Sans Serif, sans-serif'
                      }}
                      onClick={() => handleEditOrder(order)}
                      onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                      onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem',
        color: '#000000',
        fontSize: '0.875rem',
        fontFamily: 'MS Sans Serif, sans-serif',
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ffffff #808080 #808080 #ffffff'
      }}>
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Order Details - {selectedOrder.order_number}</span>
              <button
                onClick={closeViewModal}
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
                onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '1rem',
              overflowY: 'auto',
              flex: 1,
              background: 'white'
            }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#808080' }}>
                  Loading order details...
                </div>
              ) : (
                <>
                  {/* Invoice Header */}
                  <div style={{
                    borderBottom: '2px solid #000080',
                    paddingBottom: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: '#000080', fontSize: '1.5rem' }}>
                      INVOICE
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                          Bill To:
                        </h3>
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                          <div style={{ fontWeight: 'bold' }}>{selectedOrder.customer_name || 'N/A'}</div>
                          <div>{selectedOrder.shipping_address_street || 'N/A'}</div>
                          <div>
                            {selectedOrder.shipping_address_city}, {selectedOrder.shipping_address_state} {selectedOrder.shipping_address_zip}
                          </div>
                          <div>{selectedOrder.shipping_address_country || 'USA'}</div>
                          <div style={{ marginTop: '0.5rem' }}>
                            <div>Email: {selectedOrder.customer_email || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                          Order Information:
                        </h3>
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                          <div><strong>Order Number:</strong> {selectedOrder.order_number}</div>
                          <div><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</div>
                          <div><strong>Status:</strong> <span style={{
                            padding: '0.2rem 0.5rem',
                            background: getStatusColor(selectedOrder.status).bg,
                            color: getStatusColor(selectedOrder.status).text,
                            fontWeight: 'bold'
                          }}>{selectedOrder.status}</span></div>
                          <div><strong>Payment Method:</strong> {selectedOrder.payment_method}</div>
                          <div><strong>Payment Status:</strong> {selectedOrder.payment_status}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                      Order Items:
                    </h3>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      fontSize: '0.875rem'
                    }}>
                      <thead>
                        <tr style={{ background: '#000080', color: 'white' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderRight: '1px solid #c0c0c0' }}>Item</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid #c0c0c0' }}>Quantity</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', borderRight: '1px solid #c0c0c0' }}>Unit Price</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails && orderDetails.length > 0 ? (
                          orderDetails.map((item, index) => (
                            <tr key={index} style={{
                              background: index % 2 === 0 ? 'white' : '#f0f0f0',
                              borderBottom: '1px solid #c0c0c0'
                            }}>
                              <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                                Item #{item.item_id}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid #c0c0c0' }}>
                                {item.quantity}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', borderRight: '1px solid #c0c0c0' }}>
                                ${parseFloat(item.unit_price || 0).toFixed(2)}
                              </td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                ${parseFloat(item.subtotal || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#808080' }}>
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Totals */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '2px solid #000080'
                  }}>
                    <div style={{ width: '300px', fontSize: '0.875rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        marginBottom: '0.25rem'
                      }}>
                        <span>Subtotal:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          ${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        marginBottom: '0.25rem'
                      }}>
                        <span>Tax:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          ${parseFloat(selectedOrder.tax_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        marginBottom: '0.25rem'
                      }}>
                        <span>Shipping:</span>
                        <span style={{ fontWeight: 'bold', color: '#808080' }}>
                          TBD
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.5rem',
                        background: '#000080',
                        color: 'white',
                        fontSize: '1.1rem'
                      }}>
                        <span style={{ fontWeight: 'bold' }}>GRAND TOTAL:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          ${parseFloat(selectedOrder.grand_total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {selectedOrder.notes && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: '#ffffcc',
                      border: '1px solid #e0e000',
                      fontSize: '0.875rem'
                    }}>
                      <strong>Notes:</strong> {selectedOrder.notes}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.75rem',
              background: '#c0c0c0',
              borderTop: '2px solid',
              borderColor: '#ffffff #000000',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem'
            }}>
              <button
                onClick={closeViewModal}
                style={{
                  padding: '0.5rem 1.5rem',
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && editFormData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              Edit Order - {selectedOrder.order_number}
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '1rem',
              overflowY: 'auto',
              flex: 1,
              background: 'white'
            }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#808080' }}>
                  Loading order details...
                </div>
              ) : (
                <>
                  {/* Customer Information */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                      Customer Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Company Name:
                        </label>
                        <input
                          type="text"
                          value={editFormData.customer_name}
                          onChange={(e) => handleEditFormChange('customer_name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Email:
                        </label>
                        <input
                          type="email"
                          value={editFormData.customer_email}
                          onChange={(e) => handleEditFormChange('customer_email', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                      Shipping Address
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Street:
                        </label>
                        <input
                          type="text"
                          value={editFormData.shipping_address_street}
                          onChange={(e) => handleEditFormChange('shipping_address_street', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            City:
                          </label>
                          <input
                            type="text"
                            value={editFormData.shipping_address_city}
                            onChange={(e) => handleEditFormChange('shipping_address_city', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.4rem',
                              border: '2px solid',
                              borderColor: '#808080 #ebebeb #ebebeb #808080',
                              fontFamily: 'MS Sans Serif, sans-serif',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            State:
                          </label>
                          <input
                            type="text"
                            value={editFormData.shipping_address_state}
                            onChange={(e) => handleEditFormChange('shipping_address_state', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.4rem',
                              border: '2px solid',
                              borderColor: '#808080 #ebebeb #ebebeb #808080',
                              fontFamily: 'MS Sans Serif, sans-serif',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            ZIP:
                          </label>
                          <input
                            type="text"
                            value={editFormData.shipping_address_zip}
                            onChange={(e) => handleEditFormChange('shipping_address_zip', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.4rem',
                              border: '2px solid',
                              borderColor: '#808080 #ebebeb #ebebeb #808080',
                              fontFamily: 'MS Sans Serif, sans-serif',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                      Order Status & Payment
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Status:
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Payment Method:
                        </label>
                        <select
                          value={editFormData.payment_method}
                          onChange={(e) => handleEditFormChange('payment_method', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value="Credit Card">Credit Card</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Wire Transfer">Wire Transfer</option>
                          <option value="Purchase Order">Purchase Order</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Payment Status:
                        </label>
                        <select
                          value={editFormData.payment_status}
                          onChange={(e) => handleEditFormChange('payment_status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#000080' }}>
                      Order Items
                    </h3>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      fontSize: '0.875rem'
                    }}>
                      <thead>
                        <tr style={{ background: '#000080', color: 'white' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center' }}>Quantity</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Unit Price</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editOrderItems.map((item, index) => (
                          <tr key={index} style={{
                            background: index % 2 === 0 ? 'white' : '#f0f0f0',
                            borderBottom: '1px solid #c0c0c0'
                          }}>
                            <td style={{ padding: '0.5rem' }}>
                              Item #{item.item_id}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                style={{
                                  width: '60px',
                                  padding: '0.25rem',
                                  border: '2px solid',
                                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                                  fontFamily: 'MS Sans Serif, sans-serif',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                              <input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                style={{
                                  width: '80px',
                                  padding: '0.25rem',
                                  border: '2px solid',
                                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                                  fontFamily: 'MS Sans Serif, sans-serif',
                                  fontSize: '0.875rem',
                                  textAlign: 'right'
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                              ${parseFloat(item.subtotal || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Display */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '2px solid #000080'
                  }}>
                    <div style={{ width: '300px', fontSize: '0.875rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: '#f0f0f0'
                      }}>
                        <span>Subtotal:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          ${calculateTotals().subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        alignItems: 'center',
                        marginTop: '0.25rem'
                      }}>
                        <span>Tax:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.tax_amount}
                          onChange={(e) => handleEditFormChange('tax_amount', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100px',
                            padding: '0.25rem',
                            border: '2px solid',
                            borderColor: '#808080 #ebebeb #ebebeb #808080',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '0.875rem',
                            textAlign: 'right',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.5rem',
                        background: '#000080',
                        color: 'white',
                        fontSize: '1.1rem',
                        marginTop: '0.25rem'
                      }}>
                        <span style={{ fontWeight: 'bold' }}>GRAND TOTAL:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          ${calculateTotals().grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      Notes:
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        fontFamily: 'MS Sans Serif, sans-serif',
                        fontSize: '0.875rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.75rem',
              background: '#c0c0c0',
              borderTop: '2px solid',
              borderColor: '#ffffff #000000',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif',
                  opacity: saving ? 0.6 : 1
                }}
                onMouseDown={(e) => !saving && (e.target.style.borderColor = '#000000 #ffffff #ffffff #000000')}
                onMouseUp={(e) => !saving && (e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff')}
              >
                {saving ? 'Saving...' : 'SAVE'}
              </button>
              <button
                onClick={handleCancelClick}
                disabled={saving}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif',
                  opacity: saving ? 0.6 : 1
                }}
                onMouseDown={(e) => !saving && (e.target.style.borderColor = '#000000 #ffffff #ffffff #000000')}
                onMouseUp={(e) => !saving && (e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff')}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Popup */}
      {showSaveConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '400px',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              Confirm Save
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'white',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              Are you sure you want to save the changes to this order?
            </div>
            <div style={{
              padding: '0.75rem',
              background: '#c0c0c0',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleConfirmSave}
                style={{
                  padding: '0.5rem 2rem',
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
                YES
              </button>
              <button
                onClick={handleCancelSave}
                style={{
                  padding: '0.5rem 2rem',
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
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Popup */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '400px',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              Confirm Cancel
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'white',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              Are you sure you want to cancel? All changes will be lost!
            </div>
            <div style={{
              padding: '0.75rem',
              background: '#c0c0c0',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleConfirmCancel}
                style={{
                  padding: '0.5rem 2rem',
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
                YES
              </button>
              <button
                onClick={handleCancelCancel}
                style={{
                  padding: '0.5rem 2rem',
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
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders

