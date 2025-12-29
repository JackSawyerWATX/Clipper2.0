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
      'Delivered': { bg: '#d4edda', text: '#155724' },
      'Shipped': { bg: '#d1ecf1', text: '#0c5460' },
      'In Transit': { bg: '#cfe2ff', text: '#084298' },
      'Waiting for Carrier Pick Up': { bg: '#fff3cd', text: '#856404' },
      'Processing': { bg: '#f8d7da', text: '#721c24' },
      'Pending': { bg: '#e2e3e5', text: '#383d41' }
    }
    return colors[status] || { bg: '#f8f9fa', text: '#212529' }
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
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#61dafb', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#282c34'
        }}>
          + Create New Shipment
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by tracking number, order ID, or customer..." 
          style={{ 
            padding: '0.75rem', 
            flex: '1',
            minWidth: '300px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
        <select style={{ 
          padding: '0.75rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '1rem',
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
          padding: '0.75rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          <option value="">All Carriers</option>
          <option value="fedex">FedEx</option>
          <option value="ups">UPS</option>
          <option value="usps">USPS</option>
          <option value="dhl">DHL</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Shipment ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Carrier</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Tracking Number</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Destination</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => {
              const statusColors = getStatusColor(shipment.status)
              const progress = getStatusProgress(shipment.status)
              return (
                <tr key={shipment.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{shipment.id}</td>
                  <td style={{ padding: '1rem', color: '#0d6efd' }}>{shipment.orderId}</td>
                  <td style={{ padding: '1rem' }}>{shipment.customer}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      background: '#f8f9fa',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {shipment.carrier}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {shipment.trackingNumber}
                  </td>
                  <td style={{ padding: '1rem' }}>{shipment.destination}</td>
                  <td style={{ padding: '1rem' }}>{shipment.date}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        background: statusColors.bg,
                        color: statusColors.text,
                        marginBottom: '0.25rem'
                      }}>
                        {shipment.status}
                      </span>
                      <div style={{ 
                        width: '100%',
                        height: '4px',
                        background: '#e9ecef',
                        borderRadius: '2px',
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
                  <td style={{ padding: '1rem' }}>
                    <button style={{ 
                      padding: '0.5rem 1rem', 
                      marginRight: '0.5rem',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>
                      Track
                    </button>
                    <button style={{ 
                      padding: '0.5rem 1rem',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>
                      Details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', color: '#6c757d', fontSize: '0.875rem' }}>
        Showing {shipments.length} shipments (Database integration pending)
      </div>
    </div>
  )
}

export default ShipmentTracking
