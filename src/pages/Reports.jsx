import React, { useState } from 'react'

function Reports() {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [generating, setGenerating] = useState(false)

  const reportTypes = [
    { id: 'sales-agent', name: 'Sales Agent Report', category: 'Sales' },
    { id: 'customer', name: 'Customer Report', category: 'Customers' },
    { id: 'customer-purchases', name: 'Customer Purchase History', category: 'Customers' },
    { id: 'sales-manager', name: 'Sales Manager Report', category: 'Management' },
    { id: 'department-manager', name: 'Department Manager Report', category: 'Management' },
    { id: 'inventory-sales', name: 'Inventory Sales Report', category: 'Inventory' },
    { id: 'company-sales', name: 'Company Sales Report', category: 'Company' },
    { id: 'vendor-sales', name: 'Vendor Sales Report', category: 'Vendors' },
    { id: 'vendor-inventory', name: 'Vendor Inventory Report', category: 'Vendors' }
  ]

  const categories = [...new Set(reportTypes.map(r => r.category))]

  const handleGenerateReport = (format) => {
    setGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false)
      alert(`${format} report generated successfully!\n\nIn production, this will:\n- Query the database\n- Generate the report\n- Export to ${format} format\n- Provide download link`)
    }, 1500)
  }

  const getReportDescription = (reportId) => {
    const descriptions = {
      'sales-agent': 'Individual sales performance, commissions, and customer interactions',
      'customer': 'Customer details, contact information, and account status',
      'customer-purchases': 'Detailed purchase history with monthly, annual, YTD, and lifetime totals',
      'sales-manager': 'Team performance, sales targets, and revenue analysis',
      'department-manager': 'Department-wide metrics and operational insights',
      'inventory-sales': 'Product movement, stock levels, and sales velocity',
      'company-sales': 'Overall company revenue, growth trends, and performance metrics',
      'vendor-sales': 'Sales generated from vendor products and vendor performance',
      'vendor-inventory': 'Stock levels and inventory provided by each vendor'
    }
    return descriptions[reportId] || ''
  }

  return (
    <div className="page">
      <h1>Reports</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
        Generate, view, and export reports in PDF format for printing and emailing
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Report Selection Panel */}
        <div>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Select Report Type</h2>
            
            <select 
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Choose a report --</option>
              {categories.map(category => (
                <optgroup key={category} label={category}>
                  {reportTypes
                    .filter(r => r.category === category)
                    .map(report => (
                      <option key={report.id} value={report.id}>
                        {report.name}
                      </option>
                    ))
                  }
                </optgroup>
              ))}
            </select>

            {selectedReport && (
              <div style={{ 
                padding: '0.75rem',
                background: '#e7f3ff',
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#004085',
                marginBottom: '1rem'
              }}>
                {getReportDescription(selectedReport)}
              </div>
            )}

            {selectedReport === 'customer-purchases' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Purchase Period
                </label>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="monthly">Monthly Purchases</option>
                  <option value="annual">Annual Purchases</option>
                  <option value="ytd">Year-to-Date Purchases</option>
                  <option value="lifetime">Lifetime Purchases</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Date Range
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginBottom: '0.5rem'
                }}
                placeholder="Start Date"
              />
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="End Date"
              />
            </div>

            {(selectedReport === 'sales-agent' || selectedReport === 'customer' || 
              selectedReport === 'customer-purchases' || selectedReport === 'vendor-sales' || 
              selectedReport === 'vendor-inventory') && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  {selectedReport.includes('vendor') ? 'Select Vendor' : 
                   selectedReport.includes('customer') ? 'Select Customer' : 'Select Agent'}
                </label>
                <select 
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All</option>
                  <option value="1">Sample Entity 1</option>
                  <option value="2">Sample Entity 2</option>
                  <option value="3">Sample Entity 3</option>
                </select>
              </div>
            )}

            <div style={{ 
              padding: '1rem',
              background: 'white',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '1rem' }}>
                Export Options
              </div>
              <button 
                onClick={() => handleGenerateReport('PDF')}
                disabled={!selectedReport || generating}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: selectedReport && !generating ? '#dc3545' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedReport && !generating ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}
              >
                {generating ? 'Generating...' : '📄 Generate PDF'}
              </button>
              <button 
                onClick={() => handleGenerateReport('Email')}
                disabled={!selectedReport || generating}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  background: selectedReport && !generating ? '#0d6efd' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedReport && !generating ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}
              >
                {generating ? 'Generating...' : '✉️ Generate & Email PDF'}
              </button>
            </div>
          </div>

          <div style={{ 
            padding: '1rem',
            background: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffeaa7',
            color: '#856404',
            fontSize: '0.875rem'
          }}>
            <strong>📌 Note:</strong> Reports will be generated from database once integrated.
          </div>
        </div>

        {/* Report Preview/Content Area */}
        <div>
          <div style={{ 
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            minHeight: '600px'
          }}>
            {!selectedReport ? (
              <div style={{ 
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6c757d'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ marginBottom: '1rem' }}>Select a Report Type</h3>
                <p>Choose a report from the left panel to preview and generate</p>
              </div>
            ) : (
              <>
                <div style={{ borderBottom: '2px solid #dee2e6', paddingBottom: '1rem', marginBottom: '2rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {reportTypes.find(r => r.id === selectedReport)?.name}
                  </h2>
                  {startDate && endDate && (
                    <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
                      Period: {startDate} to {endDate}
                    </p>
                  )}
                  {selectedReport === 'customer-purchases' && (
                    <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
                      Showing: {dateRange === 'monthly' ? 'Monthly' : 
                               dateRange === 'annual' ? 'Annual' :
                               dateRange === 'ytd' ? 'Year-to-Date' : 'Lifetime'} Purchases
                    </p>
                  )}
                </div>

                <div style={{ 
                  background: '#f8f9fa',
                  padding: '3rem',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  textAlign: 'center',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                  <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>Report Preview Area</h3>
                  <p style={{ color: '#adb5bd', maxWidth: '400px', margin: '0 auto' }}>
                    Report data will be displayed here once generated from the database.
                    The report will include all relevant metrics and can be exported to PDF.
                  </p>

                  {selectedReport === 'customer-purchases' && (
                    <div style={{ 
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: 'white',
                      borderRadius: '4px',
                      textAlign: 'left',
                      maxWidth: '500px',
                      margin: '2rem auto 0'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '1rem' }}>
                        Report will include:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#495057' }}>
                        <li>Customer information and contact details</li>
                        <li>Purchase transactions by selected period</li>
                        <li>Total spent per period</li>
                        <li>Product categories purchased</li>
                        <li>Year-to-date totals</li>
                        <li>Lifetime value and purchase history</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleGenerateReport('PDF')}
                    disabled={generating}
                    style={{ 
                      padding: '0.75rem 2rem',
                      marginRight: '1rem',
                      background: generating ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                  >
                    {generating ? 'Processing...' : 'Download PDF'}
                  </button>
                  <button 
                    onClick={() => alert('Print functionality will be implemented')}
                    style={{ 
                      padding: '0.75rem 2rem',
                      background: '#0d6efd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                  >
                    🖨️ Print Report
                  </button>
                </div>
              </>
            )}
          </div>

          {selectedReport && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Available Report Categories</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {categories.map(category => (
                  <div 
                    key={category}
                    style={{ 
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '4px',
                      textAlign: 'center',
                      border: '1px solid #dee2e6'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{category}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      {reportTypes.filter(r => r.category === category).length} reports
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
