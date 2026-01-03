import React, { useState, useEffect } from 'react'

function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' or 'desc'

  useEffect(() => {
    fetchSuppliers()
  }, [searchTerm, sortColumn, sortDirection])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/suppliers')
      if (!response.ok) throw new Error('Failed to fetch suppliers')
      const data = await response.json()
      setSuppliers(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      supplier.company_name?.toLowerCase().includes(term) ||
      supplier.contact_person?.toLowerCase().includes(term) ||
      supplier.address_city?.toLowerCase().includes(term) ||
      supplier.address_state?.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term)
    )
  })

  // Apply sorting to filtered suppliers
  const sortedSuppliers = [...filteredSuppliers]
  if (sortColumn) {
    sortedSuppliers.sort((a, b) => {
      let aVal, bVal
      
      // Get values based on column
      switch(sortColumn) {
        case 'supplier_id':
          aVal = a.supplier_id || 0
          bVal = b.supplier_id || 0
          break
        case 'company_name':
          aVal = (a.company_name || '').toLowerCase()
          bVal = (b.company_name || '').toLowerCase()
          break
        case 'contact_person':
          aVal = (a.contact_person || '').toLowerCase()
          bVal = (b.contact_person || '').toLowerCase()
          break
        case 'email':
          aVal = (a.email || '').toLowerCase()
          bVal = (b.email || '').toLowerCase()
          break
        case 'phone':
          aVal = (a.phone || '').toLowerCase()
          bVal = (b.phone || '').toLowerCase()
          break
        case 'address_city':
          aVal = (a.address_city || '').toLowerCase()
          bVal = (b.address_city || '').toLowerCase()
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

  const getStatusColors = (status) => {
    switch(status) {
      case 'Active':
        return { bg: '#00ff00', text: '#000000' }
      case 'Inactive':
        return { bg: '#ff0000', text: '#ffffff' }
      default:
        return { bg: '#ffff00', text: '#000000' }
    }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Suppliers</h1>
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
          + Add New Supplier
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search suppliers by name, contact, or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '0.5rem', 
            width: '100%', 
            maxWidth: '500px',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            fontSize: '1rem',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#808080' }}>
          Loading suppliers...
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: '#ff0000', 
          color: '#ffffff', 
          border: '2px solid',
          borderColor: '#ffffff #000000 #000000 #ffffff',
          marginBottom: '1rem',
          fontFamily: 'MS Sans Serif, sans-serif'
        }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ 
          overflowX: 'auto',
          border: '2px solid',
          borderColor: '#808080 #ebebeb #ebebeb #808080',
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
                  onClick={() => handleSort('supplier_id')}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    borderRight: '1px solid #808080',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  ID {sortColumn === 'supplier_id' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('company_name')}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    borderRight: '1px solid #808080',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Company Name {sortColumn === 'company_name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('address_city')}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    borderRight: '1px solid #808080',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Address {sortColumn === 'address_city' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('phone')}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    borderRight: '1px solid #808080',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Phone {sortColumn === 'phone' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('contact_person')}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    borderRight: '1px solid #808080',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Contact Person {sortColumn === 'contact_person' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold', 
                    borderRight: '1px solid #808080',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Email {sortColumn === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ 
                    padding: '2rem', 
                    textAlign: 'center',
                    color: '#808080'
                  }}>
                    {suppliers.length === 0 ? 'No suppliers found' : 'No suppliers match your search'}
                  </td>
                </tr>
              ) : (
                sortedSuppliers.map((supplier, index) => {
                  const isEvenRow = index % 2 === 0
                  const statusColors = getStatusColors(supplier.status)
                  
                  return (
                    <tr key={supplier.supplier_id} style={{ 
                      background: isEvenRow ? 'white' : '#f0f0f0',
                      borderBottom: '1px solid #c0c0c0'
                    }}>
                      <td style={{ 
                        padding: '0.5rem',
                        fontWeight: 'bold',
                        color: '#000080',
                        borderRight: '1px solid #c0c0c0'
                      }}>
                        {supplier.supplier_id}
                      </td>
                      <td style={{ 
                        padding: '0.5rem',
                        fontWeight: 'bold',
                        borderRight: '1px solid #c0c0c0'
                      }}>
                        {supplier.company_name}
                      </td>
                      <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                        <div>{supplier.address_street}</div>
                        <div style={{ fontSize: '0.75rem', color: '#808080' }}>
                          {supplier.address_city}, {supplier.address_state} {supplier.address_zip}
                        </div>
                      </td>
                      <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                        {supplier.phone}
                      </td>
                      <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                        {supplier.contact_person}
                      </td>
                      <td style={{ 
                        padding: '0.5rem',
                        borderRight: '1px solid #c0c0c0',
                        color: '#000080'
                      }}>
                        {supplier.email}
                      </td>
                      <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: statusColors.bg,
                          color: statusColors.text,
                          border: '1px solid',
                          borderColor: statusColors.text
                        }}>
                          {supplier.status}
                        </span>
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
                          Edit
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
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
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
          Showing {sortedSuppliers.length} of {suppliers.length} suppliers
        </div>
      )}
    </div>
  )
}

export default Suppliers
