import React, { useState } from 'react'

function Orders() {
  // Mock data - will be replaced with database data later
  const [orders] = useState([
    { id: 'ORD-001', customer: 'Acme Corporation', date: '2025-12-28', total: '$1,250.00', status: 'Completed' },
    { id: 'ORD-002', customer: 'Tech Solutions Inc', date: '2025-12-27', total: '$850.00', status: 'Processing' },
    { id: 'ORD-003', customer: 'Global Enterprises', date: '2025-12-26', total: '$2,100.00', status: 'Shipped' },
    { id: 'ORD-004', customer: 'Acme Corporation', date: '2025-12-25', total: '$450.00', status: 'Pending' },
    { id: 'ORD-005', customer: 'Tech Solutions Inc', date: '2025-12-24', total: '$3,200.00', status: 'Cancelled' },
  ])

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

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Orders</h1>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#61dafb', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#282c34'
        }}>
          + Create New Order
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search orders..." 
          style={{ 
            padding: '0.75rem', 
            flex: '1',
            minWidth: '250px',
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
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Total</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusColors = getStatusColor(order.status)
              return (
                <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem', fontWeight: '500', color: '#0d6efd' }}>{order.id}</td>
                  <td style={{ padding: '1rem' }}>{order.customer}</td>
                  <td style={{ padding: '1rem' }}>{order.date}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{order.total}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: statusColors.bg,
                      color: statusColors.text
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ 
                      padding: '0.5rem 1rem', 
                      marginRight: '0.5rem',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      View
                    </button>
                    <button style={{ 
                      padding: '0.5rem 1rem',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', color: '#6c757d', fontSize: '0.875rem' }}>
        Showing {orders.length} orders (Database integration pending)
      </div>
    </div>
  )
}

export default Orders
