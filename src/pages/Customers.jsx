import React, { useState, useEffect } from 'react'
import '../styles/Customers.css'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' or 'desc'
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null) // Track which customer is being edited
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState(null)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [deleteWarning, setDeleteWarning] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    address_country: 'USA',
    status: 'Active',
    customer_type: 'Regular'
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers()
  }, [page, searchTerm, sortColumn, sortDirection])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const url = new URL('http://localhost:5000/api/customers')
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      const data = await response.json()
      
      // Filter by search term on frontend if provided
      let filteredData = data
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredData = data.filter(customer => 
          customer.company_name?.toLowerCase().includes(term) ||
          customer.contact_name?.toLowerCase().includes(term) ||
          customer.email?.toLowerCase().includes(term) ||
          customer.phone?.toLowerCase().includes(term)
        )
      }
      
      // Apply sorting if a column is selected
      if (sortColumn) {
        filteredData.sort((a, b) => {
          let aVal, bVal
          
          // Get values based on column
          switch(sortColumn) {
            case 'customer_id':
              aVal = a.customer_id || 0
              bVal = b.customer_id || 0
              break
            case 'company_name':
              aVal = (a.company_name || '').toLowerCase()
              bVal = (b.company_name || '').toLowerCase()
              break
            case 'contact_name':
              aVal = (a.contact_name || '').toLowerCase()
              bVal = (b.contact_name || '').toLowerCase()
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
      
      // Calculate pagination on frontend
      const pageSize = 25
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      setCustomers(paginatedData)
      setTotal(filteredData.length)
      setTotalPages(Math.ceil(filteredData.length / pageSize))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1) // Reset to first page on search
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
    setPage(1) // Reset to first page on sort
  }

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10)
    
    // Format as (XXX) XXX-XXXX
    if (limited.length === 0) {
      return ''
    } else if (limited.length <= 3) {
      return `(${limited}`
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    // Format phone number
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value)
    }
    
    // Convert email to lowercase
    if (name === 'email') {
      processedValue = value.toLowerCase()
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address_street: '',
      address_city: '',
      address_state: '',
      address_zip: '',
      address_country: 'USA',
      status: 'Active',
      customer_type: 'Regular'
    })
    setFormError('')
    setEditingCustomer(null)
  }

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      company_name: customer.company_name || '',
      contact_name: customer.contact_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address_street: customer.address_street || '',
      address_city: customer.address_city || '',
      address_state: customer.address_state || '',
      address_zip: customer.address_zip || '',
      address_country: customer.address_country || 'USA',
      status: customer.status || 'Active',
      customer_type: customer.customer_type || 'Regular'
    })
    setShowAddModal(true)
  }

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer)
    setDeleteConfirmed(false)
    setDeleteWarning('')
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmed) {
      setDeleteWarning('Please confirm deletion by checking the box below.')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${deletingCustomer.customer_id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }

      // Success - close modal and refresh list
      setShowDeleteModal(false)
      setDeletingCustomer(null)
      setDeleteConfirmed(false)
      await fetchCustomers()
    } catch (err) {
      setDeleteWarning(`Error: ${err.message}`)
      console.error('Error deleting customer:', err)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeletingCustomer(null)
    setDeleteConfirmed(false)
    setDeleteWarning('')
  }

  const handleSubmitCustomer = async (e) => {
    e.preventDefault()
    setFormError('')
    
    // Validation
    if (!formData.company_name.trim()) {
      setFormError('Company name is required')
      return
    }

    try {
      setSubmitting(true)
      
      let response
      if (editingCustomer) {
        // Update existing customer
        response = await fetch(`http://localhost:5000/api/customers/${editingCustomer.customer_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
      } else {
        // Create new customer
        response = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to ${editingCustomer ? 'update' : 'add'} customer`)
      }

      // Success - close modal, reset form, and refresh list
      setShowAddModal(false)
      resetForm()
      if (!editingCustomer) {
        setPage(1) // Go to first page to see new customer
      }
      await fetchCustomers()
    } catch (err) {
      setFormError(err.message)
      console.error(`Error ${editingCustomer ? 'updating' : 'adding'} customer:`, err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Customers</h1>
        <div className="customers-loading">
          Loading customers...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h1>Customers</h1>
        <div className="customers-error-container">
          <strong>Error:</strong> {error}
          <br />
          <button 
            onClick={fetchCustomers}
            className="customers-error-retry"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="customers-header">
        <h1>Customers</h1>
      </div>
      
      <div className="customers-search-container">
        <input 
          type="text" 
          placeholder="Search Customers..." 
          value={searchTerm}
          onChange={handleSearch}
          className="customers-search-input"
        />
        <button 
          onClick={() => setShowAddModal(true)}
          className="customers-add-button"
          onMouseDown={(e) => e.target.style.borderColor = '#000000 #ebebeb #ebebeb #000000'}
          onMouseUp={(e) => e.target.style.borderColor = '#ebebeb #000000 #000000 #ebebeb'}
        >
          + Add New Customer
        </button>
      </div>

      {loading && (
        <div className="customers-loading">
          Loading customers...
        </div>
      )}

      {error && (
        <div className="customers-inline-error">
          Error: {error}
        </div>
      )}

      {!loading && !error && customers && customers.length === 0 && (
        <div className="customers-empty-state">
          No customers found
        </div>
      )}

      {!loading && !error && customers && customers.length > 0 && (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('customer_id')}>
                  ID {sortColumn === 'customer_id' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('company_name')}>
                  Company Name {sortColumn === 'company_name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('contact_name')}>
                  Contact {sortColumn === 'contact_name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email {sortColumn === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('phone')}>
                  Phone {sortColumn === 'phone' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('address_city')}>
                  City {sortColumn === 'address_city' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {customers.map((customer, index) => {
              const isEvenRow = index % 2 === 0
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
              const statusColors = getStatusColors(customer.status)
              
              return (
                <tr key={customer.customer_id}>
                  <td className="customers-table-id">
                    {customer.customer_id}
                  </td>
                  <td className="customers-table-company">
                    {customer.company_name}
                  </td>
                  <td>
                    {customer.contact_name || 'N/A'}
                  </td>
                  <td>
                    {customer.email || 'N/A'}
                  </td>
                  <td>
                    {customer.phone || 'N/A'}
                  </td>
                  <td>
                    {customer.address_city || 'N/A'}
                  </td>
                  <td>
                    <span className={`customers-status-badge ${
                      customer.status === 'Active' ? 'customers-status-active' :
                      customer.status === 'Inactive' ? 'customers-status-inactive' :
                      'customers-status-suspended'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                      onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      className="customers-action-button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(customer)}
                      onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                      onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                      className="customers-action-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination and Info */}
      {!loading && !error && customers && customers.length > 0 && (
        <div className="customers-pagination-container">
          <div className="customers-pagination-info">
            Showing {customers.length} of {total} customers
          </div>
        
        <div className="customers-pagination-controls">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            onMouseDown={(e) => {
              if (page !== 1) {
                e.currentTarget.style.borderTop = '2px solid #808080';
                e.currentTarget.style.borderLeft = '2px solid #808080';
                e.currentTarget.style.borderRight = '2px solid #ffffff';
                e.currentTarget.style.borderBottom = '2px solid #ffffff';
              }
            }}
            onMouseUp={(e) => {
              if (page !== 1) {
                e.currentTarget.style.borderTop = '2px solid #ffffff';
                e.currentTarget.style.borderLeft = '2px solid #ffffff';
                e.currentTarget.style.borderRight = '2px solid #000000';
                e.currentTarget.style.borderBottom = '2px solid #000000';
              }
            }}
            className="customers-pagination-button"
          >
            Previous
          </button>
          
          <span className="customers-pagination-page">
            Page {page} of {totalPages}
          </span>
          
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            onMouseDown={(e) => {
              if (page !== totalPages) {
                e.currentTarget.style.borderTop = '2px solid #808080';
                e.currentTarget.style.borderLeft = '2px solid #808080';
                e.currentTarget.style.borderRight = '2px solid #ffffff';
                e.currentTarget.style.borderBottom = '2px solid #ffffff';
              }
            }}
            onMouseUp={(e) => {
              if (page !== totalPages) {
                e.currentTarget.style.borderTop = '2px solid #ffffff';
                e.currentTarget.style.borderLeft = '2px solid #ffffff';
                e.currentTarget.style.borderRight = '2px solid #000000';
                e.currentTarget.style.borderBottom = '2px solid #000000';
              }
            }}
            className="customers-pagination-button"
          >
            Next
          </button>
        </div>
      </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="customers-modal-overlay">
          <div className="customers-modal">
            <div className="customers-modal-titlebar">
              <h2 className="customers-modal-title">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="customers-modal-close"
              >
                ×
              </button>
            </div>

            <div className="customers-modal-content">
              {formError && (
                <div className="customers-form-error">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitCustomer}>
                <div className="customers-form-grid">
                {/* Company Name - Required */}
                <div>
                  <label className="customers-form-label">
                    Company Name <span className="customers-form-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    className="customers-form-input"
                  />
                </div>

                  {/* Contact Name */}
                  <div>
                    <label className="customers-form-label">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      className="customers-form-input"
                    />
                  </div>

                {/* Email */}
                <div>
                  <label className="customers-form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="customers-form-input"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="customers-form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(206) 713-3756"
                    className="customers-form-input"
                  />
                </div>

                  {/* Address - Street */}
                  <div>
                    <label className="customers-form-label">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address_street}
                      onChange={handleInputChange}
                      className="customers-form-input"
                    />
                  </div>

                  {/* City, State, Zip in a row */}
                  <div className="customers-form-row-3">
                    <div>
                      <label className="customers-form-label">
                        City
                      </label>
                      <input
                        type="text"
                        name="address_city"
                        value={formData.address_city}
                        onChange={handleInputChange}
                        className="customers-form-input"
                      />
                    </div>
                    <div>
                      <label className="customers-form-label">
                        State
                      </label>
                      <input
                        type="text"
                        name="address_state"
                        value={formData.address_state}
                        onChange={handleInputChange}
                        maxLength="2"
                        placeholder="TX"
                        className="customers-form-input"
                      />
                    </div>
                    <div>
                      <label className="customers-form-label">
                        ZIP
                      </label>
                      <input
                        type="text"
                        name="address_zip"
                        value={formData.address_zip}
                        onChange={handleInputChange}
                        className="customers-form-input"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="customers-form-label">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address_country"
                      value={formData.address_country}
                      onChange={handleInputChange}
                      className="customers-form-input"
                    />
                  </div>

                  {/* Status and Customer Type in a row */}
                  <div className="customers-form-row-2">
                    <div>
                      <label className="customers-form-label">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="customers-form-select"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="customers-form-label">
                        Customer Type
                      </label>
                      <select
                        name="customer_type"
                        value={formData.customer_type}
                        onChange={handleInputChange}
                        className="customers-form-select"
                      >
                        <option value="One-Time">One-Time</option>
                        <option value="Regular">Regular</option>
                        <option value="Recurring">Recurring</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="customers-form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        resetForm()
                      }}
                      className="customers-form-button"
                      onMouseDown={(e) => {
                        e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'
                        e.target.style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.5)'
                        e.target.style.transform = 'translate(2px, 2px)'
                      }}
                      onMouseUp={(e) => {
                        e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'
                        e.target.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.4)'
                        e.target.style.transform = 'translate(0, 0)'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="customers-form-button"
                      onMouseDown={(e) => {
                        if (!submitting) {
                          e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'
                          e.target.style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.5)'
                          e.target.style.transform = 'translate(2px, 2px)'
                        }
                      }}
                      onMouseUp={(e) => {
                        if (!submitting) {
                          e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'
                          e.target.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.4)'
                          e.target.style.transform = 'translate(0, 0)'
                        }
                      }}
                    >
                      {submitting ? (editingCustomer ? 'Updating...' : 'Adding...') : (editingCustomer ? 'Update Customer' : 'Add Customer')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCustomer && (
        <div className="customers-modal-overlay">
          <div className="customers-modal customers-modal-small">
            {/* Windows 3.0 Title Bar */}
            <div className="customers-modal-titlebar">
              <h2 className="customers-modal-title">
                Delete Customer
              </h2>
              <button
                onClick={handleDeleteCancel}
                className="customers-modal-close"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="customers-modal-content">
              <div>
                <p className="customers-delete-text">
                  Are you sure you want to delete this customer profile?
                </p>
                <div className="customers-delete-info-box">
                  <strong className="customers-delete-company">{deletingCustomer.company_name}</strong>
                  {deletingCustomer.contact_name && (
                    <>
                      <br />
                      <span className="customers-delete-detail">Contact: {deletingCustomer.contact_name}</span>
                    </>
                  )}
                  {deletingCustomer.email && (
                    <>
                      <br />
                      <span className="customers-delete-detail">Email: {deletingCustomer.email}</span>
                    </>
                  )}
                </div>
                <div className="customers-delete-warning-box">
                  <p className="customers-delete-warning-text">
                    ⚠️ This action cannot be undone.
                  </p>
                </div>
              </div>

              {deleteWarning && (
                <div className="customers-delete-alert">
                  {deleteWarning}
                </div>
              )}

              <div className="customers-delete-actions">
                <button
                  onClick={handleDeleteCancel}
                  className="customers-form-button"
                  onMouseDown={(e) => {
                    e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'
                    e.target.style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.5)'
                    e.target.style.transform = 'translate(2px, 2px)'
                  }}
                  onMouseUp={(e) => {
                    e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'
                    e.target.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.4)'
                    e.target.style.transform = 'translate(0, 0)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="customers-form-button customers-form-button-delete"
                  onMouseDown={(e) => {
                    e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'
                    e.target.style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.5)'
                    e.target.style.transform = 'translate(2px, 2px)'
                  }}
                  onMouseUp={(e) => {
                    e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'
                    e.target.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.4)'
                    e.target.style.transform = 'translate(0, 0)'
                  }}
                >
                  Delete
                </button>
              </div>

              <div className="customers-delete-checkbox-container">
                <input
                type="checkbox"
                id="deleteConfirmCheckbox"
                checked={deleteConfirmed}
                onChange={(e) => {
                  setDeleteConfirmed(e.target.checked)
                  if (deleteWarning) setDeleteWarning('')
                }}
                className="customers-delete-checkbox"
              />
              <label 
                htmlFor="deleteConfirmCheckbox"
                className="customers-delete-checkbox-label"
              >
                I understand this action cannot be undone
              </label>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers


