import React, { useState, useEffect } from 'react'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
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
  }, [page, searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const url = new URL('http://localhost:5000/api/customers')
      url.searchParams.append('page', page)
      url.searchParams.append('page_size', 10)
      if (searchTerm) {
        url.searchParams.append('search', searchTerm)
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      const data = await response.json()
      setCustomers(data.customers)
      setTotalPages(data.total_pages)
      setTotal(data.total)
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
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#6c757d' }}>
          Loading customers...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h1>Customers</h1>
        <div style={{ 
          padding: '1.5rem', 
          background: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
          <br />
          <button 
            onClick={fetchCustomers}
            style={{ 
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Customers</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#61dafb', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#282c34'
          }}
        >
          + Add New Customer
        </button>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search customers..." 
          value={searchTerm}
          onChange={handleSearch}
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
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Contact</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>City</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.customer_id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>{customer.customer_id}</td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{customer.company_name}</td>
                <td style={{ padding: '1rem' }}>{customer.contact_name || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>{customer.email || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>{customer.phone || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>{customer.address_city || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    background: customer.status === 'Active' ? '#d4edda' : 
                               customer.status === 'Inactive' ? '#f8d7da' : '#fff3cd',
                    color: customer.status === 'Active' ? '#155724' : 
                           customer.status === 'Inactive' ? '#721c24' : '#856404'
                  }}>
                    {customer.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => handleEditCustomer(customer)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      marginRight: '0.5rem',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(customer)}
                    style={{ 
                      padding: '0.5rem 1rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination and Info */}
      <div style={{ 
        marginTop: '1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>
          Showing {customers.length} of {total} customers
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ 
              padding: '0.5rem 1rem',
              background: page === 1 ? '#e9ecef' : '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              color: page === 1 ? '#6c757d' : '#000'
            }}
          >
            Previous
          </button>
          
          <span style={{ 
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            color: '#6c757d'
          }}>
            Page {page} of {totalPages}
          </span>
          
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ 
              padding: '0.5rem 1rem',
              background: page === totalPages ? '#e9ecef' : '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              color: page === totalPages ? '#6c757d' : '#000'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.5)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif'
          }}>
            <div style={{
              padding: '0.4rem 0.6rem',
              background: 'linear-gradient(to bottom, #000080 0%, #0000aa 100%)',
              color: 'white',
              borderBottom: '2px solid #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.3)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
              }}>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#000',
                  cursor: 'pointer',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              padding: '1rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {formError && (
                <div style={{
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                  marginBottom: '1rem',
                  color: '#c33',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)'
                }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitCustomer}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Company Name - Required */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Company Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.4rem',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      background: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                      boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>

                  {/* Contact Name */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        background: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.4rem',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      background: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                      boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(206) 713-3756"
                    style={{
                      width: '100%',
                      padding: '0.4rem',
                      border: '2px solid',
                      borderColor: '#808080 #ffffff #ffffff #808080',
                      background: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                      boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>

                  {/* Address - Street */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address_street}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        background: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>

                  {/* City, State, Zip in a row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        City
                      </label>
                      <input
                        type="text"
                        name="address_city"
                        value={formData.address_city}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        State
                      </label>
                      <input
                        type="text"
                        name="address_state"
                        value={formData.address_state}
                        onChange={handleInputChange}
                        maxLength="2"
                        placeholder="TX"
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        ZIP
                      </label>
                      <input
                        type="text"
                        name="address_zip"
                        value={formData.address_zip}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="address_country"
                      value={formData.address_country}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        background: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>

                  {/* Status and Customer Type in a row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Customer Type
                      </label>
                      <select
                        name="customer_type"
                        value={formData.customer_type}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.4rem',
                          border: '2px solid',
                          borderColor: '#808080 #ffffff #ffffff #808080',
                          background: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        <option value="One-Time">One-Time</option>
                        <option value="Regular">Regular</option>
                        <option value="Recurring">Recurring</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        resetForm()
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        background: '#c0c0c0',
                        border: '2px solid',
                        borderColor: '#ffffff #000000 #000000 #ffffff',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                        boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                        color: '#000',
                        textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                        transition: 'all 0.15s'
                      }}
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
                      style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        background: submitting ? '#808080' : '#c0c0c0',
                        border: '2px solid',
                        borderColor: submitting ? '#000000 #808080 #808080 #000000' : '#ffffff #000000 #000000 #ffffff',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                        boxShadow: submitting ? 'inset 1px 1px 2px rgba(0,0,0,0.5)' : '2px 2px 4px rgba(0,0,0,0.4)',
                        color: '#000',
                        textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                        transition: 'all 0.15s'
                      }}
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.5)',
            maxWidth: '500px',
            width: '90%',
            fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif'
          }}>
            {/* Windows 3.0 Title Bar */}
            <div style={{
              padding: '0.4rem 0.6rem',
              background: 'linear-gradient(to bottom, #000080 0%, #0000aa 100%)',
              color: 'white',
              borderBottom: '2px solid #000000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.3)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
              }}>
                Delete Customer
              </h2>
              <button
                onClick={handleDeleteCancel}
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#000',
                  cursor: 'pointer',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Are you sure you want to delete this customer profile?
                </p>
                <div style={{ 
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <strong style={{ fontSize: '0.9rem' }}>{deletingCustomer.company_name}</strong>
                  {deletingCustomer.contact_name && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.85rem' }}>Contact: {deletingCustomer.contact_name}</span>
                    </>
                  )}
                  {deletingCustomer.email && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.85rem' }}>Email: {deletingCustomer.email}</span>
                    </>
                  )}
                </div>
                <div style={{ 
                  margin: '0.75rem 0 0 0',
                  padding: '0.5rem',
                  background: '#ffffff',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: 0, color: '#dc3545', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    ⚠️ This action cannot be undone.
                  </p>
                </div>
              </div>

              {deleteWarning && (
                <div style={{
                  padding: '0.75rem',
                  background: '#ffff00',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                  marginBottom: '1rem',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {deleteWarning}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '1rem'
              }}>
                <button
                  onClick={handleDeleteCancel}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #000000 #000000 #ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    color: '#000',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                    transition: 'all 0.15s'
                  }}
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
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #000000 #000000 #ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    fontFamily: 'MS Sans Serif, Microsoft Sans Serif, sans-serif',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    color: '#dc3545',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                    transition: 'all 0.15s'
                  }}
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

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: '#ffffff',
                border: '2px solid',
                borderColor: '#808080 #ffffff #ffffff #808080',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
              }}>
                <input
                type="checkbox"
                id="deleteConfirmCheckbox"
                checked={deleteConfirmed}
                onChange={(e) => {
                  setDeleteConfirmed(e.target.checked)
                  if (deleteWarning) setDeleteWarning('')
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="deleteConfirmCheckbox"
                style={{
                  margin: 0,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#000'
                }}
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
