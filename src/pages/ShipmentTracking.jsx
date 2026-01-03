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

  useEffect(() => {
    fetchShipments()
  }, [searchTerm, statusFilter, carrierFilter, sortColumn, sortDirection])

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
    </div>
  )
}

export default ShipmentTracking
