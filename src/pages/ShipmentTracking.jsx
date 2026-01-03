import React, { useState, useEffect } from 'react'

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
      const response = await fetch('http://localhost:5000/api/shipments')
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
      const response = await fetch('http://localhost:5000/api/customers')
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
        const customerResponse = await fetch('http://localhost:5000/api/customers', {
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
      const response = await fetch('http://localhost:5000/api/shipments', {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Shipment Tracking</h1>
        <button 
          onClick={() => setShowModal(true)}
          onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
          onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
          style={{ 
            padding: '0.5rem 1.5rem', 
            background: '#c0c0c0', 
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'MS Sans Serif, sans-serif',
            fontSize: '0.875rem'
          }}
        >
          + Create New Shipment
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by tracking number, order ID, or customer..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            flex: '1',
            minWidth: '300px',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            fontSize: '1rem',
            fontFamily: 'MS Sans Serif, sans-serif',
            background: '#ffffff'
          }}
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ 
            padding: '0.5rem',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            fontSize: '1rem',
            fontFamily: 'MS Sans Serif, sans-serif',
            background: '#ffffff',
            cursor: 'pointer'
          }}
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
          style={{ 
            padding: '0.5rem',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            fontSize: '1rem',
            fontFamily: 'MS Sans Serif, sans-serif',
            background: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="">All Carriers</option>
          <option value="fedex">FedEx</option>
          <option value="ups">UPS</option>
          <option value="usps">USPS</option>
          <option value="dhl">DHL</option>
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#808080' }}>
          Loading shipments...
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: '#f8d7da', 
          color: '#721c24', 
          border: '2px solid',
          borderColor: '#f5c6cb',
          marginBottom: '1rem',
          fontFamily: 'MS Sans Serif, sans-serif'
        }}>
          Error: {error}
          <button 
            onClick={fetchShipments}
            style={{ 
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#ffffff #000000 #000000 #ffffff',
              cursor: 'pointer',
              fontFamily: 'MS Sans Serif, sans-serif'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && sortedShipments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#808080' }}>
          No shipments found
        </div>
      )}

      {!loading && !error && sortedShipments.length > 0 && (
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
              <th 
                onClick={() => handleSort('shipment_id')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Shipment ID {sortColumn === 'shipment_id' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('order_number')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Order ID {sortColumn === 'order_number' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('customer_name')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Customer {sortColumn === 'customer_name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('carrier')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Carrier {sortColumn === 'carrier' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('tracking_number')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Tracking Number {sortColumn === 'tracking_number' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('to_location')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Destination {sortColumn === 'to_location' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('shipped_date')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Date {sortColumn === 'shipped_date' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th 
                onClick={() => handleSort('status')}
                style={{ 
                  padding: '0.5rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  borderRight: '1px solid #808080',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedShipments.map((shipment, index) => {
              const statusColors = getStatusColor(shipment.status)
              const progress = getStatusProgress(shipment.status)
              const isEvenRow = index % 2 === 0
              return (
                <tr key={shipment.shipment_id} style={{ 
                  background: isEvenRow ? 'white' : '#f0f0f0',
                  borderBottom: '1px solid #c0c0c0'
                }}>
                  <td style={{ 
                    padding: '0.5rem',
                    fontWeight: 'bold',
                    color: '#000080',
                    borderRight: '1px solid #c0c0c0'
                  }}>
                    {shipment.shipment_id}
                  </td>
                  <td style={{ 
                    padding: '0.5rem',
                    fontWeight: 'bold',
                    borderRight: '1px solid #c0c0c0'
                  }}>
                    {shipment.order_number || 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    {shipment.customer_name || 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem',
                      background: '#c0c0c0',
                      border: '1px solid',
                      borderColor: '#ffffff #000000 #000000 #ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {shipment.carrier || 'N/A'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '0.5rem',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.75rem',
                    borderRight: '1px solid #c0c0c0'
                  }}>
                    {shipment.tracking_number || 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    {shipment.to_location || 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    {shipment.shipped_date ? new Date(shipment.shipped_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    <div>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: statusColors.bg,
                        color: statusColors.text,
                        border: '1px solid',
                        borderColor: statusColors.text,
                        marginBottom: '0.25rem'
                      }}>
                        {shipment.status}
                      </span>
                      <div style={{ 
                        width: '100%',
                        height: '4px',
                        background: '#808080',
                        border: '1px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${progress}%`,
                          height: '100%',
                          background: statusColors.text,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button 
                      onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                      onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      style={{ 
                        padding: '0.25rem 0.75rem',
                        marginRight: '0.25rem',
                        background: '#c0c0c0',
                        border: '2px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'MS Sans Serif, sans-serif'
                      }}
                    >
                      Track
                    </button>
                    <button 
                      onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                      onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      style={{ 
                        padding: '0.25rem 0.75rem',
                        background: '#c0c0c0',
                        border: '2px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'MS Sans Serif, sans-serif'
                      }}
                    >
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
      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem',
        color: '#000000',
        fontFamily: 'MS Sans Serif, sans-serif',
        fontSize: '0.875rem'
      }}>
        Showing {sortedShipments.length} of {shipments.length} shipments
      </div>
      )}

      {/* Create Shipment Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: 'MS Sans Serif, sans-serif'
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(to right, #000080, #0000aa)',
              color: 'white',
              padding: '0.5rem',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Create New Shipment</span>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1rem', background: 'white' }}>
              <form onSubmit={handleCreateShipment}>
                {/* Company Selection */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Company Name: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    disabled={showNewCustomerForm}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      opacity: showNewCustomerForm ? 0.6 : 1
                    }}
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
                    onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
                    onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#c0c0c0',
                      border: '2px solid',
                      borderColor: '#ebebeb #000000 #000000 #ebebeb',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  >
                    {showNewCustomerForm ? 'Cancel' : '+ Add New Company'}
                  </button>

                  {/* New Customer Form */}
                  {showNewCustomerForm && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #c0c0c0' }}>
                      <input
                        type="text"
                        placeholder="Company Name *"
                        value={newCustomer.company_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
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
                        placeholder="Email *"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
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
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '2px solid',
                          borderColor: '#808080 #ebebeb #ebebeb #808080',
                          fontFamily: 'MS Sans Serif, sans-serif',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Carrier */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Carrier: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="carrier"
                    value={formData.carrier}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  >
                    <option value="">-- Select carrier --</option>
                    <option value="FedEx">FedEx</option>
                    <option value="UPS">UPS</option>
                    <option value="USPS">USPS</option>
                    <option value="DHL">DHL</option>
                  </select>
                </div>

                {/* Status */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Status:
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
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
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Shipped Date:
                  </label>
                  <input
                    type="date"
                    name="shipped_date"
                    value={formData.shipped_date}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  />
                </div>

                {/* Estimated Delivery */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Estimated Delivery:
                  </label>
                  <input
                    type="date"
                    name="estimated_delivery"
                    value={formData.estimated_delivery}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  />
                </div>

                {/* From Location */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    From Location:
                  </label>
                  <input
                    type="text"
                    name="from_location"
                    value={formData.from_location}
                    onChange={handleInputChange}
                    placeholder="Origin address"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  />
                </div>

                {/* To Location */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    To Location:
                  </label>
                  <input
                    type="text"
                    name="to_location"
                    value={formData.to_location}
                    onChange={handleInputChange}
                    placeholder="Destination address"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Notes:
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes or special instructions"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    onMouseDown={(e) => !submitting && (e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000')}
                    onMouseUp={(e) => !submitting && (e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: submitting ? '#808080' : '#c0c0c0',
                      border: '2px solid',
                      borderColor: '#ebebeb #000000 #000000 #ebebeb',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
                  >
                    {submitting ? 'Creating...' : 'Create Shipment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    onMouseDown={(e) => !submitting && (e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000')}
                    onMouseUp={(e) => !submitting && (e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: submitting ? '#808080' : '#c0c0c0',
                      border: '2px solid',
                      borderColor: '#ebebeb #000000 #000000 #ebebeb',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      fontFamily: 'MS Sans Serif, sans-serif'
                    }}
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
