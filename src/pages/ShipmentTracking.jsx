import React, { useState } from 'react'

function ShipmentTracking() {
  // Mock data - will be replaced with database data later
  const [shipments] = useState([
    { 
      id: 'SHIP-001', 
      orderId: 'ORD-001', 
      customer: 'Acme Corporation', 
      carrier: 'FedEx',
      trackingNumber: '1Z999AA10123456784',
      date: '2025-12-28',
      status: 'Delivered',
      destination: 'New York, NY'
    },
    { 
      id: 'SHIP-002', 
      orderId: 'ORD-002', 
      customer: 'Tech Solutions Inc', 
      carrier: 'UPS',
      trackingNumber: '1Z999AA10123456785',
      date: '2025-12-27',
      status: 'In Transit',
      destination: 'Los Angeles, CA'
    },
    { 
      id: 'SHIP-003', 
      orderId: 'ORD-003', 
      customer: 'Global Enterprises', 
      carrier: 'USPS',
      trackingNumber: '9400111899562843952301',
      date: '2025-12-26',
      status: 'Shipped',
      destination: 'Chicago, IL'
    },
    { 
      id: 'SHIP-004', 
      orderId: 'ORD-004', 
      customer: 'Acme Corporation', 
      carrier: 'DHL',
      trackingNumber: '8765432109876543',
      date: '2025-12-25',
      status: 'Waiting for Carrier Pick Up',
      destination: 'Houston, TX'
    },
    { 
      id: 'SHIP-005', 
      orderId: 'ORD-006', 
      customer: 'Tech Solutions Inc', 
      carrier: 'FedEx',
      trackingNumber: '1Z999AA10123456786',
      date: '2025-12-24',
      status: 'Processing',
      destination: 'Phoenix, AZ'
    },
    { 
      id: 'SHIP-006', 
      orderId: 'ORD-007', 
      customer: 'Global Enterprises', 
      carrier: 'UPS',
      trackingNumber: '1Z999AA10123456787',
      date: '2025-12-23',
      status: 'Pending',
      destination: 'Philadelphia, PA'
    },
  ])

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
        <select style={{ 
          padding: '0.5rem',
          border: '2px solid',
          borderColor: '#808080 #ebebeb #ebebeb #808080',
          fontSize: '1rem',
          fontFamily: 'MS Sans Serif, sans-serif',
          background: '#ffffff',
          cursor: 'pointer'
        }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="waiting">Waiting for Carrier Pick Up</option>
          <option value="transit">In Transit</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
        <select style={{ 
          padding: '0.5rem',
          border: '2px solid',
          borderColor: '#808080 #ebebeb #ebebeb #808080',
          fontSize: '1rem',
          fontFamily: 'MS Sans Serif, sans-serif',
          background: '#ffffff',
          cursor: 'pointer'
        }}>
          <option value="">All Carriers</option>
          <option value="fedex">FedEx</option>
          <option value="ups">UPS</option>
          <option value="usps">USPS</option>
          <option value="dhl">DHL</option>
        </select>
      </div>

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
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Shipment ID</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Order ID</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Customer</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Carrier</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Tracking Number</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Destination</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Date</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Status</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment, index) => {
              const statusColors = getStatusColor(shipment.status)
              const progress = getStatusProgress(shipment.status)
              const isEvenRow = index % 2 === 0
              return (
                <tr key={shipment.id} style={{ 
                  background: isEvenRow ? 'white' : '#f0f0f0',
                  borderBottom: '1px solid #c0c0c0'
                }}>
                  <td style={{ 
                    padding: '0.5rem',
                    fontWeight: 'bold',
                    color: '#000080',
                    borderRight: '1px solid #c0c0c0'
                  }}>
                    {shipment.id}
                  </td>
                  <td style={{ 
                    padding: '0.5rem',
                    fontWeight: 'bold',
                    borderRight: '1px solid #c0c0c0'
                  }}>
                    {shipment.orderId}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    {shipment.customer}
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
                      {shipment.carrier}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '0.5rem',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.75rem',
                    borderRight: '1px solid #c0c0c0'
                  }}>
                    {shipment.trackingNumber}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    {shipment.destination}
                  </td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                    {shipment.date}
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

      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem',
        color: '#000000',
        fontFamily: 'MS Sans Serif, sans-serif',
        fontSize: '0.875rem'
      }}>
        Showing {shipments.length} shipments (Database integration pending)
      </div>
    </div>
  )
}

export default ShipmentTracking
