import React, { useState, useEffect } from 'react'
import '../styles/ShipmentTracking.css'

const API_URL = import.meta.env.VITE_API_URL ?? '';






function ShipmentTracking() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' or 'desc'
  const [showModal, setShowModal] = useState(false)
  const [customers, setCustomers] = useState([])
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    email: '',
    phone: ''
  })
  const [formData, setFormData] = useState({
    customer_id: '',
    carrier: '',
    status: 'Pending',
    shipped_date: '',
    estimated_delivery: '',
    from_location: '',
    to_location: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchShipments()
  }, [searchTerm, statusFilter, carrierFilter, sortColumn, sortDirection])

  useEffect(() => {
    if (showModal) {
      fetchCustomers()
    }
  }, [showModal])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/shipments`)
      if (!response.ok) throw new Error('Failed to fetch shipments')
      const data = await response.json()
      setShipments(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching shipments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customers`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  // Filter shipments based on search and filters
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = !searchTerm || 
      shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || shipment.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchesCarrier = !carrierFilter || shipment.carrier?.toLowerCase() === carrierFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesCarrier
  })

  // Apply sorting to filtered shipments
  const sortedShipments = [...filteredShipments]
  if (sortColumn) {
    sortedShipments.sort((a, b) => {
      let aVal, bVal
      
      // Get values based on column
      switch(sortColumn) {
        case 'shipment_id':
          aVal = a.shipment_id || 0
          bVal = b.shipment_id || 0
          break
        case 'order_number':
          aVal = (a.order_number || '').toLowerCase()
          bVal = (b.order_number || '').toLowerCase()
          break
        case 'customer_name':
          aVal = (a.customer_name || '').toLowerCase()
          bVal = (b.customer_name || '').toLowerCase()
          break
        case 'carrier':
          aVal = (a.carrier || '').toLowerCase()
          bVal = (b.carrier || '').toLowerCase()
          break
        case 'tracking_number':
          aVal = (a.tracking_number || '').toLowerCase()
          bVal = (b.tracking_number || '').toLowerCase()
          break
        case 'to_location':
          aVal = (a.to_location || '').toLowerCase()
          bVal = (b.to_location || '').toLowerCase()
          break
        case 'shipped_date':
          aVal = a.shipped_date ? new Date(a.shipped_date).getTime() : 0
          bVal = b.shipped_date ? new Date(b.shipped_date).getTime() : 0
          break
        case 'status':
          aVal = (a.status || '').toLowerCase()
          bVal = (b.status || '').toLowerCase()
          break
        default:
          return 0
      }
      
      // Compare values
      let comparison = 0
      if (typeof aVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateShipment = async (e) => {
    e.preventDefault()
    
    // Validate: either select existing customer or fill new customer form
    if (!formData.customer_id && !showNewCustomerForm) {
      alert('Please select a company or add a new one')
      return
    }
    
    if (showNewCustomerForm && (!newCustomer.company_name || !newCustomer.email)) {
      alert('Please fill in Company Name and Email for the new customer')
      return
    }
    
    if (!formData.carrier) {
      alert('Please select a carrier')
      return
    }

    try {
      setSubmitting(true)
      
      let customerId = formData.customer_id
      
      // Create new customer if needed
      if (showNewCustomerForm) {
        const customerResponse = await fetch(`${API_URL}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCustomer)
        })
        
        if (!customerResponse.ok) throw new Error('Failed to create customer')
        const customerData = await customerResponse.json()
        customerId = customerData.customer_id
      }
      
      // Create shipment with auto-generated order and tracking
      const response = await fetch(`${API_URL}/api/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId,
          ...formData
        })
      })

      if (!response.ok) throw new Error('Failed to create shipment')
      
      // Reset form and close modal
      setFormData({
        customer_id: '',
        carrier: '',
        status: 'Pending',
        shipped_date: '',
        estimated_delivery: '',
        from_location: '',
        to_location: '',
        notes: ''
      })
      setNewCustomer({
        company_name: '',
        email: '',
        phone: ''
      })
      setShowNewCustomerForm(false)
      setShowModal(false)
      
      // Refresh shipments list
      await fetchShipments()
      
      alert('Shipment created successfully!')
    } catch (err) {
      console.error('Error creating shipment:', err)
      alert('Failed to create shipment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': { bg: '#00ff00', text: '#000000' },
      'Shipped': { bg: '#00ffff', text: '#000000' },
      'In Transit': { bg: '#0000ff', text: '#ffffff' },
      'Waiting for Carrier Pick Up': { bg: '#ffff00', text: '#000000' },
      'Processing': { bg: '#ff00ff', text: '#000000' },
      'Pending': { bg: '#c0c0c0', text: '#000000' }
    }
    return colors[status] || { bg: '#c0c0c0', text: '#000000' }
  }

  const getStatusProgress = (status) => {
    const progressMap = {
      'Pending': 15,
      'Processing': 30,
      'Waiting for Carrier Pick Up': 45,
      'In Transit': 65,
      'Shipped': 85,
      'Delivered': 100
    }
    return progressMap[status] || 0
  }

  return (
    <div className="page">
      <div className="shipment-header">
        <h1>Shipment Tracking</h1>
      </div>

      <div className="shipment-filters">
        <input 
          type="text" 
          placeholder="Search by tracking number, order ID, or customer..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shipment-search-input"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="shipment-filter-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="waiting">Waiting for Carrier Pick Up</option>
          <option value="transit">In Transit</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
        <select 
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="shipment-filter-select"
        >
          <option value="">All Carriers</option>
          <option value="fedex">FedEx</option>
          <option value="ups">UPS</option>
          <option value="usps">USPS</option>
          <option value="dhl">DHL</option>
        </select>
        <button 
          onClick={() => setShowModal(true)}
          className="shipment-add-button"
        >
          + Create New Shipment
        </button>
      </div>

      {loading && (
        <div className="shipment-loading">
          Loading shipments...
        </div>
      )}

      {error && (
        <div className="shipment-error">
          Error: {error}
          <button 
            onClick={fetchShipments}
            className="shipment-error-button"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && sortedShipments.length === 0 && (
        <div className="shipment-empty">
          No shipments found
        </div>
      )}

      {!loading && !error && sortedShipments.length > 0 && (
      <div className="shipment-table-container">
        <table className="shipment-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('shipment_id')}>
                Shipment ID {sortColumn === 'shipment_id' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('order_number')}>
                Order ID {sortColumn === 'order_number' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('customer_name')}>
                Customer {sortColumn === 'customer_name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('carrier')}>
                Carrier {sortColumn === 'carrier' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('tracking_number')}>
                Tracking Number {sortColumn === 'tracking_number' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('to_location')}>
                Destination {sortColumn === 'to_location' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('shipped_date')}>
                Date {sortColumn === 'shipped_date' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedShipments.map((shipment, index) => {
              const statusColors = getStatusColor(shipment.status)
              const progress = getStatusProgress(shipment.status)
              const isEvenRow = index % 2 === 0
              return (
                <tr key={shipment.shipment_id} className={isEvenRow ? 'shipment-table-row-even' : 'shipment-table-row-odd'}>
                  <td className="shipment-table-cell-id">
                    {shipment.shipment_id}
                  </td>
                  <td className="shipment-table-cell-order">
                    {shipment.order_number || 'N/A'}
                  </td>
                  <td className="shipment-table-cell">
                    {shipment.customer_name || 'N/A'}
                  </td>
                  <td className="shipment-table-cell">
                    <span className="shipment-carrier-badge">
                      {shipment.carrier || 'N/A'}
                    </span>
                  </td>
                  <td className="shipment-tracking-number">
                    {shipment.tracking_number || 'N/A'}
                  </td>
                  <td className="shipment-table-cell">
                    {shipment.to_location || 'N/A'}
                  </td>
                  <td className="shipment-table-cell">
                    {shipment.shipped_date ? new Date(shipment.shipped_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="shipment-status-container">
                    <div>
                      <span className="shipment-status-badge" style={{ 
                        background: statusColors.bg,
                        color: statusColors.text,
                        borderColor: statusColors.text
                      }}>
                        {shipment.status}
                      </span>
                      <div className="shipment-status-progress-bar">
                        <div className="shipment-status-progress-fill" style={{ 
                          width: `${progress}%`,
                          background: statusColors.text
                        }} />
                      </div>
                    </div>
                  </td>
                  <td className="shipment-actions-cell">
                    <button className="shipment-action-button">
                      Track
                    </button>
                    <button className="shipment-action-button">
                      Details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}

      {!loading && !error && (
      <div className="shipment-results-counter">
        Showing {sortedShipments.length} of {shipments.length} shipments
      </div>
      )}

      {/* Create Shipment Modal */}
      {showModal && (
        <div className="shipment-modal-overlay">
          <div className="shipment-modal-container">
            {/* Modal Header */}
            <div className="shipment-modal-header">
              <span>Create New Shipment</span>
              <button
                onClick={() => setShowModal(false)}
                className="shipment-modal-close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="shipment-modal-body">
              <form onSubmit={handleCreateShipment}>
                {/* Company Selection */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    Company Name: <span className="shipment-form-required">*</span>
                  </label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    disabled={showNewCustomerForm}
                    className={showNewCustomerForm ? 'shipment-form-select-disabled' : 'shipment-form-select'}
                  >
                    <option value="">-- Select a company --</option>
                    {customers.map(customer => (
                      <option key={customer.customer_id} value={customer.customer_id}>
                        {customer.company_name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                    className="shipment-form-toggle-button"
                  >
                    {showNewCustomerForm ? 'Cancel' : '+ Add New Company'}
                  </button>

                  {/* New Customer Form */}
                  {showNewCustomerForm && (
                    <div className="shipment-new-customer-section">
                      <input
                        type="text"
                        placeholder="Company Name *"
                        value={newCustomer.company_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                        className="shipment-form-input-spacing"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        className="shipment-form-input-spacing"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="shipment-form-input"
                      />
                    </div>
                  )}
                </div>

                {/* Carrier */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    Carrier: <span className="shipment-form-required">*</span>
                  </label>
                  <select
                    name="carrier"
                    value={formData.carrier}
                    onChange={handleInputChange}
                    required
                    className="shipment-form-select"
                  >
                    <option value="">-- Select carrier --</option>
                    <option value="FedEx">FedEx</option>
                    <option value="UPS">UPS</option>
                    <option value="USPS">USPS</option>
                    <option value="DHL">DHL</option>
                  </select>
                </div>

                {/* Status */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    Status:
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="shipment-form-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Waiting for Carrier Pick Up">Waiting for Carrier Pick Up</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                {/* Shipped Date */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    Shipped Date:
                  </label>
                  <input
                    type="date"
                    name="shipped_date"
                    value={formData.shipped_date}
                    onChange={handleInputChange}
                    className="shipment-form-input"
                  />
                </div>

                {/* Estimated Delivery */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    Estimated Delivery:
                  </label>
                  <input
                    type="date"
                    name="estimated_delivery"
                    value={formData.estimated_delivery}
                    onChange={handleInputChange}
                    className="shipment-form-input"
                  />
                </div>

                {/* From Location */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    From Location:
                  </label>
                  <input
                    type="text"
                    name="from_location"
                    value={formData.from_location}
                    onChange={handleInputChange}
                    placeholder="Origin address"
                    className="shipment-form-input"
                  />
                </div>

                {/* To Location */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    To Location:
                  </label>
                  <input
                    type="text"
                    name="to_location"
                    value={formData.to_location}
                    onChange={handleInputChange}
                    placeholder="Destination address"
                    className="shipment-form-input"
                  />
                </div>

                {/* Notes */}
                <div className="shipment-form-group">
                  <label className="shipment-form-label">
                    Notes:
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes or special instructions"
                    className="shipment-form-textarea"
                  />
                </div>

                {/* Action Buttons */}
                <div className="shipment-form-actions">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={submitting ? 'shipment-form-submit-button-disabled' : 'shipment-form-submit-button'}
                  >
                    {submitting ? 'Creating...' : 'Create Shipment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className={submitting ? 'shipment-form-cancel-button-disabled' : 'shipment-form-cancel-button'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShipmentTracking
