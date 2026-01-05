import React, { useState, useEffect, useMemo } from 'react'

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchBy, setSearchBy] = useState('all')
  const [sortOrder, setSortOrder] = useState('name-asc')
  const [stockFilter, setStockFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

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
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'partNumber-asc':
          return (a.part_number || '').localeCompare(b.part_number || '')
        case 'partNumber-desc':
          return (b.part_number || '').localeCompare(a.part_number || '')
        case 'manufacturer-asc':
          return (a.manufacturer || '').localeCompare(b.manufacturer || '')
        case 'manufacturer-desc':
          return (b.manufacturer || '').localeCompare(a.manufacturer || '')
        case 'quantity-asc':
          return a.quantity - b.quantity
        case 'quantity-desc':
          return b.quantity - a.quantity
        case 'price-asc':
          return a.price_per_unit - b.price_per_unit
        case 'price-desc':
          return b.price_per_unit - a.price_per_unit
        default:
          return 0
      }
    })

    return filtered
  }, [inventoryItems, searchTerm, searchBy, sortOrder, stockFilter])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedItems.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, searchBy, sortOrder, stockFilter])

  const getStockStatus = (status) => {
    switch(status) {
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

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Inventory</h1>
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
          + Add New Item
        </button>
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
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
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
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="partNumber-asc">Part Number (A-Z)</option>
          <option value="partNumber-desc">Part Number (Z-A)</option>
          <option value="manufacturer-asc">Manufacturer (A-Z)</option>
          <option value="manufacturer-desc">Manufacturer (Z-A)</option>
          <option value="quantity-asc">Quantity (Low-High)</option>
          <option value="quantity-desc">Quantity (High-Low)</option>
          <option value="price-asc">Price (Low-High)</option>
          <option value="price-desc">Price (High-Low)</option>
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
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Part Number</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Manufacturer</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Description</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Quantity</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #808080' }}>Price/Unit</th>
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
                        fontFamily: 'MS Sans Serif, sans-serif',
                        display: 'block',
                        width: '100%'
                      }}
                    >
                      Adjust Stock
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
    </div>
  )
}

export default Inventory

