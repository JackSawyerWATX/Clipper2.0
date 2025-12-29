import React, { useState } from 'react'

function Customers() {
  // Mock data - will be replaced with database data later
  const [clients] = useState([
    { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-0100', status: 'Active' },
    { id: 2, name: 'Tech Solutions Inc', email: 'info@techsolutions.com', phone: '555-0101', status: 'Active' },
    { id: 3, name: 'Global Enterprises', email: 'hello@global.com', phone: '555-0102', status: 'Inactive' },
  ])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Customers</h1>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#61dafb', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#282c34'
        }}>
          + Add New Customer
        </button>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search customers..." 
          style={{ 
            padding: '0.75rem', 
            width: '100%', 
            maxWidth: '400px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
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
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Company Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>{client.id}</td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{client.name}</td>
                <td style={{ padding: '1rem' }}>{client.email}</td>
                <td style={{ padding: '1rem' }}>{client.phone}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    background: client.status === 'Active' ? '#d4edda' : '#f8d7da',
                    color: client.status === 'Active' ? '#155724' : '#721c24'
                  }}>
                    {client.status}
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
                    Edit
                  </button>
                  <button style={{ 
                    padding: '0.5rem 1rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', color: '#6c757d', fontSize: '0.875rem' }}>
        Showing {clients.length} customers (Database integration pending)
      </div>
    </div>
  )
}

export default Customers
