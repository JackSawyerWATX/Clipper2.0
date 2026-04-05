import React, { useState, useEffect } from 'react'
import '../styles/Suppliers.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://clipper-backend-prod.eba-cg2igaaf.us-west-2.elasticbeanstalk.com';






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
      const response = await fetch(`${API_URL}/api/suppliers`)
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
      <div className="suppliers-header">
        <h1>Suppliers</h1>
      </div>

      <div className="suppliers-search-container">
        <input 
          type="text" 
          placeholder="Search suppliers by name, contact, or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="suppliers-search-input"
        />
        <button className="suppliers-add-button">
          + Add New Supplier
        </button>
      </div>

      {loading && (
        <div className="suppliers-loading">
          Loading suppliers...
        </div>
      )}

      {error && (
        <div className="suppliers-error">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="suppliers-table-container">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('supplier_id')}
                >
                  ID {sortColumn === 'supplier_id' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('company_name')}
                >
                  Company Name {sortColumn === 'company_name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('address_city')}
                >
                  Address {sortColumn === 'address_city' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('phone')}
                >
                  Phone {sortColumn === 'phone' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('contact_person')}
                >
                  Contact Person {sortColumn === 'contact_person' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  onClick={() => handleSort('email')}
                >
                  Email {sortColumn === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="suppliers-empty-row">
                    {suppliers.length === 0 ? 'No suppliers found' : 'No suppliers match your search'}
                  </td>
                </tr>
              ) : (
                sortedSuppliers.map((supplier, index) => {
                  const isEvenRow = index % 2 === 0
                  const statusColors = getStatusColors(supplier.status)
                  
                  return (
                    <tr key={supplier.supplier_id} className={isEvenRow ? 'suppliers-table-row-even' : 'suppliers-table-row-odd'}>
                      <td className="suppliers-table-cell-id">
                        {supplier.supplier_id}
                      </td>
                      <td className="suppliers-table-cell-company">
                        {supplier.company_name}
                      </td>
                      <td className="suppliers-table-cell">
                        <div>{supplier.address_street}</div>
                        <div className="suppliers-address-secondary">
                          {supplier.address_city}, {supplier.address_state} {supplier.address_zip}
                        </div>
                      </td>
                      <td className="suppliers-table-cell">
                        {supplier.phone}
                      </td>
                      <td className="suppliers-table-cell">
                        {supplier.contact_person}
                      </td>
                      <td className="suppliers-table-cell-email">
                        {supplier.email}
                      </td>
                      <td className="suppliers-table-cell">
                        <span 
                          className="suppliers-status-badge"
                          style={{ 
                            background: statusColors.bg,
                            color: statusColors.text,
                            borderColor: statusColors.text
                          }}
                        >
                          {supplier.status}
                        </span>
                      </td>
                      <td className="suppliers-actions-cell">
                        <button className="suppliers-action-button">
                          Edit
                        </button>
                        <button className="suppliers-action-button">
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
        <div className="suppliers-results-counter">
          Showing {sortedSuppliers.length} of {suppliers.length} suppliers
        </div>
      )}
    </div>
  )
}

export default Suppliers
