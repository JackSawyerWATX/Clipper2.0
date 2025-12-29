import React, { useState, useMemo } from 'react'

function Inventory() {
  // Mock data - will be replaced with database data later
  const [inventoryItems] = useState([
    { 
      id: 1, 
      name: 'Hydraulic Pump Assembly',
      partNumber: 'HP-2458-A',
      manufacturer: 'Parker Hannifin',
      description: 'High-pressure hydraulic pump for industrial applications. Max pressure 3000 PSI.',
      photo: 'https://via.placeholder.com/80x80?text=HP-2458',
      quantity: 45,
      pricePerUnit: 245.00
    },
    { 
      id: 2, 
      name: 'Ball Bearing Set',
      partNumber: 'BB-1234-X',
      manufacturer: 'SKF',
      description: 'Premium grade ball bearing set, sealed for high-speed applications.',
      photo: 'https://via.placeholder.com/80x80?text=BB-1234',
      quantity: 120,
      pricePerUnit: 32.50
    },
    { 
      id: 3, 
      name: 'Electronic Control Module',
      partNumber: 'ECM-9876-B',
      manufacturer: 'Siemens',
      description: 'Programmable logic controller module with 16 I/O ports.',
      photo: 'https://via.placeholder.com/80x80?text=ECM-9876',
      quantity: 28,
      pricePerUnit: 425.00
    },
    { 
      id: 4, 
      name: 'Steel Fastener Kit',
      partNumber: 'FK-5555-C',
      manufacturer: 'Fastenal',
      description: 'Assorted steel fasteners, bolts, and nuts. Grade 8 hardened steel.',
      photo: 'https://via.placeholder.com/80x80?text=FK-5555',
      quantity: 200,
      pricePerUnit: 18.75
    },
    { 
      id: 5, 
      name: 'Industrial Motor 5HP',
      partNumber: 'IM-7890-D',
      manufacturer: 'Baldor Electric',
      description: '5 horsepower three-phase electric motor, 1750 RPM.',
      photo: 'https://via.placeholder.com/80x80?text=IM-7890',
      quantity: 15,
      pricePerUnit: 850.00
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [searchBy, setSearchBy] = useState('all')
  const [sortOrder, setSortOrder] = useState('name-asc')
  const [stockFilter, setStockFilter] = useState('')

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...inventoryItems]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const term = searchTerm.toLowerCase()
        
        switch (searchBy) {
          case 'name':
            return item.name.toLowerCase().includes(term)
          case 'partNumber':
            return item.partNumber.toLowerCase().includes(term)
          case 'manufacturer':
            return item.manufacturer.toLowerCase().includes(term)
          case 'description':
            // Match words in description
            const descWords = item.description.toLowerCase().split(/\s+/)
            const searchWords = term.split(/\s+/)
            return searchWords.some(searchWord => 
              descWords.some(descWord => descWord.includes(searchWord))
            )
          default: // 'all'
            return (
              item.name.toLowerCase().includes(term) ||
              item.partNumber.toLowerCase().includes(term) ||
              item.manufacturer.toLowerCase().includes(term) ||
              item.description.toLowerCase().includes(term)
            )
        }
      })
    }

    // Apply stock level filter
    if (stockFilter) {
      filtered = filtered.filter(item => {
        if (stockFilter === 'out-of-stock') return item.quantity === 0
        if (stockFilter === 'low-stock') return item.quantity > 0 && item.quantity < 20
        if (stockFilter === 'in-stock') return item.quantity >= 20
        return true
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'partNumber-asc':
          return a.partNumber.localeCompare(b.partNumber)
        case 'partNumber-desc':
          return b.partNumber.localeCompare(a.partNumber)
        case 'manufacturer-asc':
          return a.manufacturer.localeCompare(b.manufacturer)
        case 'manufacturer-desc':
          return b.manufacturer.localeCompare(a.manufacturer)
        case 'quantity-asc':
          return a.quantity - b.quantity
        case 'quantity-desc':
          return b.quantity - a.quantity
        case 'price-asc':
          return a.pricePerUnit - b.pricePerUnit
        case 'price-desc':
          return b.pricePerUnit - a.pricePerUnit
        default:
          return 0
      }
    })

    return filtered
  }, [inventoryItems, searchTerm, searchBy, sortOrder, stockFilter])

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { color: '#dc3545', text: 'Out of Stock' }
    if (quantity < 20) return { color: '#ffc107', text: 'Low Stock' }
    return { color: '#28a745', text: 'In Stock' }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Inventory</h1>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#61dafb', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#282c34'
        }}>
          + Add New Item
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '0.75rem', 
              width: '100%',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
        <select 
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          style={{ 
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: '180px'
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
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: '180px'
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
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
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
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Photo</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Part Number</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Manufacturer</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Quantity</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Price/Unit</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.map((item) => {
              const stockStatus = getStockStatus(item.quantity)
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>
                    <img 
                      src={item.photo} 
                      alt={item.name}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}
                    />
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {item.partNumber}
                  </td>
                  <td style={{ padding: '1rem' }}>{item.manufacturer}</td>
                  <td style={{ padding: '1rem', maxWidth: '250px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#495057' }}>
                      {item.description}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {item.quantity}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: stockStatus.color
                    }}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    ${item.pricePerUnit.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ 
                      padding: '0.5rem 1rem', 
                      marginRight: '0.5rem',
                      marginBottom: '0.25rem',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'block',
                      width: '100%'
                    }}>
                      Edit
                    </button>
                    <button style={{ 
                      padding: '0.5rem 1rem',
                      background: '#0d6efd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'block',
                      width: '100%'
                    }}>
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>
          Showing {filteredAndSortedItems.length} of {inventoryItems.length} items (Database integration pending)
        </div>
        <div style={{ color: '#495057', fontSize: '0.875rem' }}>
          Total Inventory Value: ${filteredAndSortedItems.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0).toFixed(2)}
        </div>
      </div>
    </div>
  )
}

export default Inventory
