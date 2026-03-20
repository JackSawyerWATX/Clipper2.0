import React, { useState, useEffect } from 'react'
import '../styles/Orders.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://clipper-backend-prod.eba-cg2igaaf.us-west-2.elasticbeanstalk.com';






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
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' or 'desc'

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('Fetching orders from:', `${API_URL}/api/orders`)
      const response = await fetch(`${API_URL}/api/orders`)
      console.log(`Response status:`, response.status)
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
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
      const response = await fetch(`${API_URL}/api/customer-orders/order/${order.order_id}`)
      if (response.ok) {
        const items = await response.json()
        setOrderDetails(items)
      } else {
        console.error(`Failed to fetch order items`)
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
      const response = await fetch(`${API_URL}/api/customer-orders/order/${order.order_id}`)
      if (response.ok) {
        const items = await response.json()
        setEditOrderItems(items)
      } else {
        setEditOrderItems([])
      }
    } catch (error) {
      console.error(`Error fetching order details:`, error)
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
      const orderResponse = await fetch(`${API_URL}/api/orders/${selectedOrder.order_id}`, {
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
        const itemResponse = await fetch(`${API_URL}/api/customer-orders/${item.order_item_id}`, {
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

  const getSortableValue = (order, column) => {
    switch (column) {
      case 'order_number':
        return (order.order_number || '').toLowerCase()
      case 'state':
        return (getStateFromOrderNumber(order.order_number) || '').toLowerCase()
      case 'customer_name':
        return (order.customer_name || '').toLowerCase()
      case 'order_date':
        return order.order_date ? new Date(order.order_date).getTime() : 0
      case 'grand_total':
        return parseFloat(order.grand_total || 0)
      case 'status':
        return (order.status || '').toLowerCase()
      default:
        return ''
    }
  }

  const sortedOrders = sortColumn
    ? [...filteredOrders].sort((a, b) => {
        const aVal = getSortableValue(a, sortColumn)
        const bVal = getSortableValue(b, sortColumn)

        let comparison = 0
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    : filteredOrders

  const getStatusColor = (status) => {
    const colors = {
      'Completed': { bg: '#00ff00', text: '#000000' },
      'Processing': { bg: '#ffff00', text: '#000000' },
      'Shipped': { bg: '#00ffff', text: '#000000' },
      'Pending': { bg: '#c0c0c0', text: '#000000' },
      'Cancelled': { bg: '#ff0000', text: '#ffffff' }
    }
    return colors[status] || { bg: '#c0c0c0', text: '#000000' }
  }

  if (loading) {
    return (
      <div className="page orders-page">
        <h1>Orders</h1>
        <div className="orders-loading">
          Loading orders...
        </div>
      </div>
    )
  }

  return (
    <div className="page orders-page">
      <div className="orders-header">
        <h1>Orders</h1>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search orders..." 
          className="orders-search-input"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="orders-status-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="orders-add-button">
          + Create New Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('order_number')}>
                Order ID {sortColumn === 'order_number' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('state')}>
                State {sortColumn === 'state' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('customer_name')}>
                Customer {sortColumn === 'customer_name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('order_date')}>
                Date {sortColumn === 'order_date' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('grand_total')}>
                Total {sortColumn === 'grand_total' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order, index) => {
                const statusColors = getStatusColor(order.status)
                const isEvenRow = index % 2 === 0
                return (
                  <tr key={order.order_id} className={isEvenRow ? 'even' : 'odd'}>
                    <td className="order-id-cell">
                      {order.order_number}
                    </td>
                    <td className="order-state-cell">
                      {getStateFromOrderNumber(order.order_number)}
                    </td>
                    <td>
                      {order.customer_name || 'N/A'}
                    </td>
                    <td>
                      {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="order-total-cell">
                      ${parseFloat(order.grand_total || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge ${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-button"
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => handleEditOrder(order)}
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

      <div className="orders-summary">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-window">
            {/* Modal Title Bar */}
            <div className="modal-titlebar">
              <span>Order Details - {selectedOrder.order_number}</span>
              <button
                onClick={closeViewModal}
                className="modal-close-button"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {loadingDetails ? (
                <div className="modal-loading">
                  Loading order details...
                </div>
              ) : (
                <>
                  {/* Invoice Header */}
                  <div className="invoice-header">
                    <h2 className="invoice-title">
                      INVOICE
                    </h2>
                    <div className="invoice-grid">
                      <div>
                        <h3 className="invoice-section-title">
                          Bill To:
                        </h3>
                        <div className="invoice-section-content">
                          <div className="invoice-customer-name">{selectedOrder.customer_name || 'N/A'}</div>
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
                        <h3 className="invoice-section-title">
                          Order Information:
                        </h3>
                        <div className="invoice-section-content">
                          <div><span className="invoice-info-label">Order Number:</span> {selectedOrder.order_number}</div>
                          <div><span className="invoice-info-label">Order Date:</span> {new Date(selectedOrder.order_date).toLocaleDateString()}</div>
                          <div><span className="invoice-info-label">Status:</span> <span className={`status-badge ${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span></div>
                          <div><span className="invoice-info-label">Payment Method:</span> {selectedOrder.payment_method}</div>
                          <div><span className="invoice-info-label">Payment Status:</span> {selectedOrder.payment_status}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="order-items-section">
                    <h3 className="edit-form-section-title">
                      Order Items:
                    </h3>
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th className="align-left">Item</th>
                          <th className="align-center">Quantity</th>
                          <th className="align-right">Unit Price</th>
                          <th className="align-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails && orderDetails.length > 0 ? (
                          orderDetails.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                              <td>
                                Item #{item.item_id}
                              </td>
                              <td className="align-center">
                                {item.quantity}
                              </td>
                              <td className="align-right">
                                ${parseFloat(item.unit_price || 0).toFixed(2)}
                              </td>
                              <td className="align-right bold">
                                ${parseFloat(item.subtotal || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="empty">
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Totals */}
                  <div className="order-totals-container">
                    <div className="order-totals">
                      <div className="order-total-row">
                        <span>Subtotal:</span>
                        <span className="order-total-value">
                          ${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="order-total-row">
                        <span>Tax:</span>
                        <span className="order-total-value">
                          ${parseFloat(selectedOrder.tax_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="order-total-row">
                        <span>Shipping:</span>
                        <span className="order-total-value tbd">
                          TBD
                        </span>
                      </div>
                      <div className="order-total-row grand-total">
                        <span className="order-total-label">GRAND TOTAL:</span>
                        <span className="order-total-value">
                          ${parseFloat(selectedOrder.grand_total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {selectedOrder.notes && (
                    <div className="order-notes">
                      <span className="order-notes-label">Notes:</span> {selectedOrder.notes}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                onClick={closeViewModal}
                className="modal-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && editFormData && (
        <div className="modal-overlay">
          <div className="modal-window edit-modal">
            {/* Modal Title Bar */}
            <div className="modal-titlebar">
              Edit Order - {selectedOrder.order_number}
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {loadingDetails ? (
                <div className="modal-loading">
                  Loading order details...
                </div>
              ) : (
                <>
                  {/* Customer Information */}
                  <div className="edit-form-section">
                    <h3 className="edit-form-section-title">
                      Customer Information
                    </h3>
                    <div className="form-grid-2col">
                      <div className="form-field">
                        <label className="form-label">
                          Company Name:
                        </label>
                        <input
                          type="text"
                          value={editFormData.customer_name}
                          onChange={(e) => handleEditFormChange('customer_name', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          Email:
                        </label>
                        <input
                          type="email"
                          value={editFormData.customer_email}
                          onChange={(e) => handleEditFormChange('customer_email', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="edit-form-section">
                    <h3 className="edit-form-section-title">
                      Shipping Address
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div className="form-field">
                        <label className="form-label">
                          Street:
                        </label>
                        <input
                          type="text"
                          value={editFormData.shipping_address_street}
                          onChange={(e) => handleEditFormChange('shipping_address_street', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-grid-city-state-zip">
                        <div className="form-field">
                          <label className="form-label">
                            City:
                          </label>
                          <input
                            type="text"
                            value={editFormData.shipping_address_city}
                            onChange={(e) => handleEditFormChange('shipping_address_city', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            State:
                          </label>
                          <input
                            type="text"
                            value={editFormData.shipping_address_state}
                            onChange={(e) => handleEditFormChange('shipping_address_state', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            ZIP:
                          </label>
                          <input
                            type="text"
                            value={editFormData.shipping_address_zip}
                            onChange={(e) => handleEditFormChange('shipping_address_zip', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="edit-form-section">
                    <h3 className="edit-form-section-title">
                      Order Status & Payment
                    </h3>
                    <div className="form-grid-3col">
                      <div className="form-field">
                        <label className="form-label">
                          Status:
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          className="form-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          Payment Method:
                        </label>
                        <select
                          value={editFormData.payment_method}
                          onChange={(e) => handleEditFormChange('payment_method', e.target.value)}
                          className="form-select"
                        >
                          <option value="Credit Card">Credit Card</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Wire Transfer">Wire Transfer</option>
                          <option value="Purchase Order">Purchase Order</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          Payment Status:
                        </label>
                        <select
                          value={editFormData.payment_status}
                          onChange={(e) => handleEditFormChange('payment_status', e.target.value)}
                          className="form-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="edit-form-section">
                    <h3 className="edit-form-section-title">
                      Order Items
                    </h3>
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th className="align-left">Item</th>
                          <th className="align-center">Quantity</th>
                          <th className="align-right">Unit Price</th>
                          <th className="align-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editOrderItems.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                            <td>
                              Item #{item.item_id}
                            </td>
                            <td className="align-center">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="form-input small"
                              />
                            </td>
                            <td className="align-right">
                              <input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="form-input medium"
                              />
                            </td>
                            <td className="align-right bold">
                              ${parseFloat(item.subtotal || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Display */}
                  <div className="order-totals-container">
                    <div className="order-totals">
                      <div className="order-total-row">
                        <span>Subtotal:</span>
                        <span className="order-total-value">
                          ${calculateTotals().subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="edit-totals-input-row">
                        <span>Tax:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.tax_amount}
                          onChange={(e) => handleEditFormChange('tax_amount', parseFloat(e.target.value) || 0)}
                          className="form-input large"
                        />
                      </div>
                      <div className="order-total-row grand-total">
                        <span className="order-total-label">GRAND TOTAL:</span>
                        <span className="order-total-value">
                          ${calculateTotals().grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginTop: '1rem' }}>
                    <label className="form-label">
                      Notes:
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className="modal-button"
              >
                {saving ? 'Saving...' : 'SAVE'}
              </button>
              <button
                onClick={handleCancelClick}
                disabled={saving}
                className="modal-button"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Popup */}
      {showSaveConfirm && (
        <div className="modal-overlay confirmation">
          <div className="modal-window confirm-modal">
            <div className="modal-titlebar">
              Confirm Save
            </div>
            <div className="confirm-message">
              Are you sure you want to save the changes to this order?
            </div>
            <div className="modal-footer center">
              <button
                onClick={handleConfirmSave}
                className="modal-button wide"
              >
                YES
              </button>
              <button
                onClick={handleCancelSave}
                className="modal-button wide"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Popup */}
      {showCancelConfirm && (
        <div className="modal-overlay confirmation">
          <div className="modal-window confirm-modal">
            <div className="modal-titlebar">
              Confirm Cancel
            </div>
            <div className="confirm-message">
              Are you sure you want to cancel? All changes will be lost!
            </div>
            <div className="modal-footer center">
              <button
                onClick={handleConfirmCancel}
                className="modal-button wide"
              >
                YES
              </button>
              <button
                onClick={handleCancelCancel}
                className="modal-button wide"
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

