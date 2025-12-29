import React, { useState } from 'react'

function Suppliers() {
  // Mock data - will be replaced with database data later
  const [suppliers] = useState([
    { 
      id: 1, 
      companyName: 'Global Supply Co.',
      address: '123 Industrial Park Drive',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'USA',
      phone: '555-0100',
      contactPerson: 'John Smith',
      email: 'john.smith@globalsupply.com'
    },
    { 
      id: 2, 
      companyName: 'Premier Manufacturing Inc.',
      address: '456 Factory Lane',
      city: 'Detroit',
      state: 'MI',
      zip: '48201',
      country: 'USA',
      phone: '555-0200',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.johnson@premiermfg.com'
    },
    { 
      id: 3, 
      companyName: 'Pacific Imports LLC',
      address: '789 Harbor Boulevard',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'USA',
      phone: '555-0300',
      contactPerson: 'Michael Chen',
      email: 'michael.chen@pacificimports.com'
    },
    { 
      id: 4, 
      companyName: 'Atlantic Wholesale Group',
      address: '321 Commerce Street',
      city: 'Boston',
      state: 'MA',
      zip: '02101',
      country: 'USA',
      phone: '555-0400',
      contactPerson: 'Emily Davis',
      email: 'emily.davis@atlanticwholesale.com'
    },
  ])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Suppliers</h1>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#61dafb', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#282c34'
        }}>
          + Add New Supplier
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search suppliers by name, contact, or location..." 
          style={{ 
            padding: '0.75rem', 
            width: '100%', 
            maxWidth: '500px',
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
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Address</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Contact Person</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>{supplier.id}</td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{supplier.companyName}</td>
                <td style={{ padding: '1rem' }}>
                  <div>{supplier.address}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {supplier.city}, {supplier.state} {supplier.zip}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {supplier.country}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{supplier.phone}</td>
                <td style={{ padding: '1rem' }}>{supplier.contactPerson}</td>
                <td style={{ padding: '1rem' }}>
                  <a 
                    href={`mailto:${supplier.email}`} 
                    style={{ color: '#0d6efd', textDecoration: 'none' }}
                  >
                    {supplier.email}
                  </a>
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
        Showing {suppliers.length} suppliers (Database integration pending)
      </div>
    </div>
  )
}

export default Suppliers
