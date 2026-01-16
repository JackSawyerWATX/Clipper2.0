import React, { useState, useEffect, useMemo } from 'react'

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchBy, setSearchBy] = useState('all')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [stockFilter, setStockFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showValidationError, setShowValidationError] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/inventory')
      if (!response.ok) throw new Error('Failed to fetch inventory')
      const data = await response.json()
      setInventoryItems(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (item) => {
    setEditingItem({ ...item })
    setIsAddMode(false)
    setShowEditModal(true)
  }

  const handleAddClick = () => {
    setEditingItem({
      part_number: '',
      name: '',
      description: '',
      manufacturer: '',
      category: '',
      quantity: 0,
      min_quantity: 0,
      price_per_unit: 0,
      supplier_id: null,
      photo_url: ''
    })
    setIsAddMode(true)
    setShowEditModal(true)
  }

  const handleEditChange = (field, value) => {
    setEditingItem(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveEdit = () => {
    // Validate quantity is not zero
    if (editingItem.quantity === 0 || editingItem.quantity === '0') {
      setShowValidationError(true)
      return
    }
    setShowSaveConfirm(true)
  }

  const confirmSaveEdit = async () => {
    setShowSaveConfirm(false)

    try {
      const url = isAddMode
        ? 'http://localhost:5000/api/inventory'
        : `http://localhost:5000/api/inventory/${editingItem.item_id}`

      const method = isAddMode ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      })

      if (!response.ok) throw new Error(`Failed to ${isAddMode ? 'create' : 'update'} item`)

      // Refresh inventory list
      await fetchInventory()
      setShowEditModal(false)
      setEditingItem(null)
      setIsAddMode(false)
    } catch (err) {
      alert(`Error ${isAddMode ? 'creating' : 'updating'} item: ` + err.message)
    }
  }

  const declineSaveEdit = () => {
    setShowSaveConfirm(false)
  }

  const handleCancelEdit = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancelEdit = () => {
    setShowCancelConfirm(false)
    setShowEditModal(false)
    setEditingItem(null)
    setIsAddMode(false)
  }

  const declineCancelEdit = () => {
    setShowCancelConfirm(false)
  }

  const handleDeleteItem = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteItem = async () => {
    setShowDeleteConfirm(false)

    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${editingItem.item_id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      // Refresh inventory list
      await fetchInventory()
      setShowEditModal(false)
      setEditingItem(null)
      setIsAddMode(false)
    } catch (err) {
      alert('Error deleting item: ' + err.message)
    }
  }

  const declineDeleteItem = () => {
    setShowDeleteConfirm(false)
  }

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...inventoryItems]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const term = searchTerm.toLowerCase()

        switch (searchBy) {
          case 'name':
            return item.name?.toLowerCase().includes(term)
          case 'partNumber':
            return item.part_number?.toLowerCase().includes(term)
          case 'manufacturer':
            return item.manufacturer?.toLowerCase().includes(term)
          case 'description':
            // Match words in description
            if (!item.description) return false
            const descWords = item.description.toLowerCase().split(/\s+/)
            const searchWords = term.split(/\s+/)
            return searchWords.some(searchWord =>
              descWords.some(descWord => descWord.includes(searchWord))
            )
          default: // 'all'
            return (
              item.name?.toLowerCase().includes(term) ||
              item.part_number?.toLowerCase().includes(term) ||
              item.manufacturer?.toLowerCase().includes(term) ||
              item.description?.toLowerCase().includes(term)
            )
        }
      })
    }

    // Apply stock level filter
    if (stockFilter) {
      filtered = filtered.filter(item => {
        if (stockFilter === 'out-of-stock') return item.quantity === 0
        if (stockFilter === 'low-stock') return item.quantity > 0 && item.quantity < item.min_quantity
        if (stockFilter === 'in-stock') return item.quantity >= item.min_quantity
        return true
      })
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal, bVal
        
        // Get values based on column
        switch(sortColumn) {
          case 'name':
            aVal = (a.name || '').toLowerCase()
            bVal = (b.name || '').toLowerCase()
            break
          case 'part_number':
            aVal = (a.part_number || '').toLowerCase()
            bVal = (b.part_number || '').toLowerCase()
            break
          case 'manufacturer':
            aVal = (a.manufacturer || '').toLowerCase()
            bVal = (b.manufacturer || '').toLowerCase()
            break
          case 'quantity':
            aVal = a.quantity || 0
            bVal = b.quantity || 0
            break
          case 'price_per_unit':
            aVal = a.price_per_unit || 0
            bVal = b.price_per_unit || 0
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

    return filtered
  }, [inventoryItems, searchTerm, searchBy, sortColumn, sortDirection, stockFilter])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedItems.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, searchBy, sortColumn, sortDirection, stockFilter])

  const getStockStatus = (status) => {
    switch (status) {
      case 'Out of Stock':
        return { color: '#ff0000', text: '#ffffff' }
      case 'Low Stock':
        return { color: '#ffff00', text: '#000000' }
      case 'In Stock':
        return { color: '#00ff00', text: '#000000' }
      default:
        return { color: '#c0c0c0', text: '#000000' }
    }
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

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Inventory</h1>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#808080' }}>
          Loading inventory...
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
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.5rem',
                  width: '100%',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
              />
            </div>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '2px solid',
                borderColor: '#808080 #ebebeb #ebebeb #808080',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minWidth: '180px',
                fontFamily: 'MS Sans Serif, sans-serif'
              }}
            >
              <option value="all">Search All Fields</option>
              <option value="name">Search by Name</option>
              <option value="partNumber">Search by Part Number</option>
              <option value="manufacturer">Search by Manufacturer</option>
              <option value="description">Search by Description</option>
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '2px solid',
                borderColor: '#808080 #ebebeb #ebebeb #808080',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minWidth: '150px',
                fontFamily: 'MS Sans Serif, sans-serif'
              }}
            >
              <option value="">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <button
              onClick={handleAddClick}
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
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}
            >
              + Add New Item
            </button>
          </div>

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
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Photo</th>
                  <th 
                    onClick={() => handleSort('name')}
                    style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      borderRight: '1px solid #808080',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSort('part_number')}
                    style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      borderRight: '1px solid #808080',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Part Number {sortColumn === 'part_number' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSort('manufacturer')}
                    style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      borderRight: '1px solid #808080',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Manufacturer {sortColumn === 'manufacturer' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Description</th>
                  <th 
                    onClick={() => handleSort('quantity')}
                    style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      borderRight: '1px solid #808080',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Quantity {sortColumn === 'quantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSort('price_per_unit')}
                    style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      borderRight: '1px solid #808080',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Price/Unit {sortColumn === 'price_per_unit' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#808080'
                    }}>
                      No items found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => {
                    const stockStatus = getStockStatus(item.status)
                    const isEvenRow = index % 2 === 0
                    return (
                      <tr key={item.item_id} style={{
                        background: isEvenRow ? 'white' : '#f0f0f0',
                        borderBottom: '1px solid #c0c0c0'
                      }}>
                        <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.name}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                border: '2px solid',
                                borderColor: '#808080 #ebebeb #ebebeb #808080'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: '#c0c0c0',
                              border: '2px solid',
                              borderColor: '#808080 #ebebeb #ebebeb #808080',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.625rem',
                              color: '#808080'
                            }}>
                              No Image
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', borderRight: '1px solid #c0c0c0' }}>{item.name}</td>
                        <td style={{ padding: '0.5rem', fontFamily: 'Courier New, monospace', fontSize: '0.75rem', borderRight: '1px solid #c0c0c0' }}>
                          {item.part_number}
                        </td>
                        <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>{item.manufacturer}</td>
                        <td style={{ padding: '0.5rem', maxWidth: '250px', borderRight: '1px solid #c0c0c0' }}>
                          <div style={{ fontSize: '0.75rem', color: '#000000' }}>
                            {item.description}
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem', borderRight: '1px solid #c0c0c0' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {item.quantity}
                          </div>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            background: stockStatus.color,
                            color: stockStatus.text,
                            border: '1px solid',
                            borderColor: stockStatus.text
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', borderRight: '1px solid #c0c0c0' }}>
                          ${item.price_per_unit ? parseFloat(item.price_per_unit).toFixed(2) : '0.00'}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <button
                            onClick={() => handleEditClick(item)}
                            onMouseDown={(e) => e.target.style.borderColor = '#000000 #ffffff #ffffff #000000'}
                            onMouseUp={(e) => e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff'}
                            style={{
                              padding: '0.25rem 0.75rem',
                              marginRight: '0.25rem',
                              marginBottom: '0.25rem',
                              background: '#c0c0c0',
                              border: '2px solid',
                              borderColor: '#ffffff #000000 #000000 #ffffff',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontFamily: 'MS Sans Serif, sans-serif',
                              display: 'block',
                              width: '100%'
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{
            marginTop: '1rem',
            padding: '0.5rem',
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #808080 #808080 #ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'MS Sans Serif, sans-serif',
            fontSize: '0.875rem'
          }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              onMouseDown={(e) => currentPage !== 1 && (e.target.style.borderColor = '#000000 #ffffff #ffffff #000000')}
              onMouseUp={(e) => currentPage !== 1 && (e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff')}
              style={{
                padding: '0.25rem 0.75rem',
                background: currentPage === 1 ? '#808080' : '#c0c0c0',
                border: '2px solid',
                borderColor: '#ffffff #000000 #000000 #ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: '0.875rem'
              }}
            >
              « First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              onMouseDown={(e) => currentPage !== 1 && (e.target.style.borderColor = '#000000 #ffffff #ffffff #000000')}
              onMouseUp={(e) => currentPage !== 1 && (e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff')}
              style={{
                padding: '0.25rem 0.75rem',
                background: currentPage === 1 ? '#808080' : '#c0c0c0',
                border: '2px solid',
                borderColor: '#ffffff #000000 #000000 #ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: '0.875rem'
              }}
            >
              ← Prev
            </button>
            <span style={{
              padding: '0.25rem 1rem',
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              fontWeight: 'bold'
            }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              onMouseDown={(e) => currentPage !== totalPages && totalPages !== 0 && (e.target.style.borderColor = '#000000 #ffffff #ffffff #000000')}
              onMouseUp={(e) => currentPage !== totalPages && totalPages !== 0 && (e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff')}
              style={{
                padding: '0.25rem 0.75rem',
                background: (currentPage === totalPages || totalPages === 0) ? '#808080' : '#c0c0c0',
                border: '2px solid',
                borderColor: '#ffffff #000000 #000000 #ffffff',
                cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: '0.875rem'
              }}
            >
              Next →
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              onMouseDown={(e) => currentPage !== totalPages && totalPages !== 0 && (e.target.style.borderColor = '#000000 #ffffff #ffffff #000000')}
              onMouseUp={(e) => currentPage !== totalPages && totalPages !== 0 && (e.target.style.borderColor = '#ffffff #000000 #000000 #ffffff')}
              style={{
                padding: '0.25rem 0.75rem',
                background: (currentPage === totalPages || totalPages === 0) ? '#808080' : '#c0c0c0',
                border: '2px solid',
                borderColor: '#ffffff #000000 #000000 #ffffff',
                cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: '0.875rem'
              }}
            >
              Last »
            </button>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '0.5rem',
            color: '#000000',
            fontSize: '0.875rem',
            fontFamily: 'MS Sans Serif, sans-serif',
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#ffffff #808080 #808080 #ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
              {filteredAndSortedItems.length !== inventoryItems.length && ` (filtered from ${inventoryItems.length} total)`}
            </div>
            <div>
              Total Inventory Value: ${filteredAndSortedItems.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price_per_unit || 0)), 0).toFixed(2)}
            </div>
          </div>
        </>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            minWidth: '600px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
            <div style={{
              background: 'linear-gradient(90deg, #000080, #1084d0)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.875rem'
            }}>
              <span>{isAddMode ? 'Add New Inventory Item' : 'Edit Inventory Item'}</span>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  padding: '0 0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'MS Sans Serif, sans-serif'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Part Number:
                  </label>
                  <input
                    type="text"
                    value={editingItem.part_number || ''}
                    onChange={(e) => handleEditChange('part_number', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Name:
                  </label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Manufacturer:
                  </label>
                  <input
                    type="text"
                    value={editingItem.manufacturer || ''}
                    onChange={(e) => handleEditChange('manufacturer', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Category:
                  </label>
                  <input
                    type="text"
                    value={editingItem.category || ''}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Quantity:
                  </label>
                  <input
                    type="number"
                    value={editingItem.quantity || 0}
                    onChange={(e) => handleEditChange('quantity', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Min Quantity:
                  </label>
                  <input
                    type="number"
                    value={editingItem.min_quantity || 0}
                    onChange={(e) => handleEditChange('min_quantity', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Price Per Unit:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price_per_unit || 0}
                    onChange={(e) => handleEditChange('price_per_unit', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Supplier ID:
                  </label>
                  <input
                    type="number"
                    value={editingItem.supplier_id || ''}
                    onChange={(e) => handleEditChange('supplier_id', parseInt(e.target.value) || null)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      border: '2px solid',
                      borderColor: '#808080 #ebebeb #ebebeb #808080',
                      fontFamily: 'MS Sans Serif, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Description:
                </label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Photo URL:
                </label>
                <input
                  type="text"
                  value={editingItem.photo_url || ''}
                  onChange={(e) => handleEditChange('photo_url', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.375rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  {!isAddMode && (
                    <button
                      onClick={handleDeleteItem}
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
                      Delete Item
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSaveEdit}
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
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
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
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '400px',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
            <div style={{
              background: 'linear-gradient(90deg, #000080, #1084d0)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              Confirm Cancel
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Are you sure you want to cancel? All new entries will be lost!
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={confirmCancelEdit}
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
                    fontSize: '0.875rem',
                    minWidth: '80px'
                  }}
                >
                  OK
                </button>
                <button
                  onClick={declineCancelEdit}
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
                    fontSize: '0.875rem',
                    minWidth: '80px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '450px',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
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
                Confirm Save
              </h2>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Are you sure you want to save {isAddMode ? 'this new item' : 'the changes to this item'}?
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={confirmSaveEdit}
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
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #000000 #000000 #ffffff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '0.9rem',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    color: '#000',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                    transition: 'all 0.15s'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={declineSaveEdit}
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
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #000000 #000000 #ffffff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '0.9rem',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    color: '#000',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                    transition: 'all 0.15s'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1002
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '400px',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
            <div style={{
              background: 'linear-gradient(90deg, #000080, #1084d0)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              Confirm Delete
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Are you sure you want to delete this item? This action cannot be undone.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={confirmDeleteItem}
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
                    fontSize: '0.875rem',
                    minWidth: '80px'
                  }}
                >
                  OK
                </button>
                <button
                  onClick={declineDeleteItem}
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
                    fontSize: '0.875rem',
                    minWidth: '80px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Modal */}
      {showValidationError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1003
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderColor: '#ffffff #000000 #000000 #ffffff',
            width: '450px',
            fontFamily: 'MS Sans Serif, sans-serif'
          }}>
            {/* Modal Title Bar */}
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
                Validation Error
              </h2>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '2rem' }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Cannot save item with 0 quantity. Please enter a quantity greater than 0.
                </p>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowValidationError(false)}
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
                  style={{
                    padding: '0.5rem 2rem',
                    background: '#c0c0c0',
                    border: '2px solid',
                    borderColor: '#ffffff #000000 #000000 #ffffff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '0.9rem',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                    color: '#000',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                    minWidth: '100px'
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory

