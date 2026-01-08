import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Reports() {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('lifetime')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [generating, setGenerating] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [vendors, setVendors] = useState([])

  // List of implemented report types
  const implementedReports = ['customer-purchases', 'inventory-sales', 'company-sales', 'vendor-inventory']
  const isReportImplemented = implementedReports.includes(selectedReport)

  const reportTypes = [
    { id: 'sales-agent', name: 'Sales Agent Report', category: 'Sales', implemented: false },
    { id: 'customer', name: 'Customer Report', category: 'Customers', implemented: false },
    { id: 'customer-purchases', name: 'Customer Purchase History', category: 'Customers', implemented: true },
    { id: 'sales-manager', name: 'Sales Manager Report', category: 'Management', implemented: false },
    { id: 'department-manager', name: 'Department Manager Report', category: 'Management', implemented: false },
    { id: 'inventory-sales', name: 'Inventory Sales Report', category: 'Inventory', implemented: true },
    { id: 'company-sales', name: 'Company Sales Report', category: 'Company', implemented: true },
    { id: 'vendor-sales', name: 'Vendor Sales Report', category: 'Vendors', implemented: false },
    { id: 'vendor-inventory', name: 'Vendor Inventory Report', category: 'Vendors', implemented: true }
  ]

  const categories = [...new Set(reportTypes.map(r => r.category))]

  useEffect(() => {
    // Fetch customers and vendors lists on mount
    fetchCustomers()
    fetchVendors()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/customers-list')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/vendors-list')
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const generateReport = async () => {
    if (!selectedReport) return

    setGenerating(true)
    setLoading(true)
    setReportData(null)

    try {
      let url = 'http://localhost:5000/api/reports/'
      let params = new URLSearchParams()

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (dateRange) params.append('dateRange', dateRange)

      switch (selectedReport) {
        case 'customer-purchases':
          if (!selectedEntity) {
            alert('Please select a customer')
            return
          }
          url += `customer-purchases/${selectedEntity}?${params.toString()}`
          break
        case 'inventory-sales':
          url += `inventory-sales?${params.toString()}`
          break
        case 'company-sales':
          url += `company-sales?${params.toString()}`
          break
        case 'vendor-inventory':
          if (!selectedEntity) {
            alert('Please select a vendor')
            return
          }
          url += `vendor-inventory/${selectedEntity}`
          break
        default:
          alert('This report type is not yet implemented. Currently available reports:\n• Customer Purchase History\n• Inventory Sales Report\n• Company Sales Report\n• Vendor Inventory Report')
          return
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch report data')
      
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  const handleGenerateReport = (format) => {
    generateReport()
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

  const renderCustomerPurchasesReport = () => {
    if (!reportData) return null

    return (
      <div>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>{reportData.customer.company_name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div><strong>Contact:</strong> {reportData.customer.contact_name}</div>
            <div><strong>Email:</strong> {reportData.customer.email}</div>
            <div><strong>Phone:</strong> {reportData.customer.phone}</div>
            <div><strong>Status:</strong> {reportData.customer.status}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.total_orders}</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Spent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${parseFloat(reportData.summary.total_spent).toFixed(2)}</div>
          </div>
          <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Avg Order</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${parseFloat(reportData.summary.avg_order).toFixed(2)}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8d7da', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>First Order</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{new Date(reportData.summary.first_order).toLocaleDateString()}</div>
          </div>
        </div>

        <h4 style={{ marginBottom: '1rem' }}>Order History</h4>
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Order #</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Items</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Total</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {reportData.orders.map((order, index) => (
                <tr key={order.order_id} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{order.order_number}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{order.status}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{order.item_count}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>${parseFloat(order.grand_total).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{order.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.categories && reportData.categories.length > 0 && (
          <>
            <h4 style={{ marginBottom: '1rem' }}>Category Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {reportData.categories.map(cat => (
                <div key={cat.category} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{cat.category || 'Uncategorized'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {cat.order_count} orders • {cat.total_quantity} items
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    ${parseFloat(cat.category_revenue).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const renderInventorySalesReport = () => {
    if (!reportData) return null

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${reportData.summary.totalRevenue.toFixed(2)}</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Units Sold</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.totalSold}</div>
          </div>
          <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.totalOrders}</div>
          </div>
        </div>

        <h4 style={{ marginBottom: '1rem' }}>Inventory Performance</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Part #</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Item Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Sold</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Stock</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Revenue</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {reportData.inventory.map((item, index) => (
                <tr key={item.item_id} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{item.part_number}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{item.item_name}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{item.category}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{item.total_sold}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{item.current_stock}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>${parseFloat(item.total_revenue).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>${parseFloat(item.avg_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderCompanySalesReport = () => {
    if (!reportData) return null

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Orders</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.total_orders}</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${parseFloat(reportData.summary.total_revenue).toFixed(2)}</div>
          </div>
          <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Avg Order</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${parseFloat(reportData.summary.avg_order).toFixed(2)}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8d7da', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Tax</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${parseFloat(reportData.summary.total_tax).toFixed(2)}</div>
          </div>
        </div>

        <h4 style={{ marginBottom: '1rem' }}>Monthly Performance</h4>
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Month</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Orders</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthly.map((month, index) => (
                <tr key={`${month.year}-${month.month}`} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{month.month_name} {month.year}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{month.orders}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>${parseFloat(month.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Status Breakdown</h4>
            {reportData.statusBreakdown.map(status => (
              <div key={status.status} style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{status.status}</span>
                <span><strong>{status.count}</strong> orders • ${parseFloat(status.revenue).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Payment Methods</h4>
            {reportData.paymentMethods.map(method => (
              <div key={method.payment_method} style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{method.payment_method}</span>
                <span><strong>{method.count}</strong> • ${parseFloat(method.revenue).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    if (!reportData) {
      alert('Please generate a report first')
      return
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    
    // Get report name
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report'
    
    // Build HTML content based on report type
    let reportContent = ''
    
    if (selectedReport === 'customer-purchases') {
      reportContent = `
        <div class="customer-info">
          <h2>Customer Information</h2>
          <p><strong>Company:</strong> ${reportData.customer.company_name}</p>
          <p><strong>Contact:</strong> ${reportData.customer.contact_name}</p>
          <p><strong>Email:</strong> ${reportData.customer.email}</p>
          <p><strong>Phone:</strong> ${reportData.customer.phone}</p>
        </div>
        
        <div class="summary">
          <h2>Summary Statistics</h2>
          <div class="summary-grid">
            <div><strong>Total Orders:</strong> ${reportData.summary.total_orders}</div>
            <div><strong>Total Spent:</strong> $${parseFloat(reportData.summary.total_spent).toFixed(2)}</div>
            <div><strong>Average Order:</strong> $${parseFloat(reportData.summary.avg_order).toFixed(2)}</div>
            <div><strong>First Order:</strong> ${new Date(reportData.summary.first_order).toLocaleDateString()}</div>
          </div>
        </div>
        
        <div class="orders">
          <h2>Order History</h2>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.orders.map(order => `
                <tr>
                  <td>${order.order_number}</td>
                  <td>${new Date(order.order_date).toLocaleDateString()}</td>
                  <td>${order.status}</td>
                  <td>${order.item_count}</td>
                  <td>$${parseFloat(order.grand_total).toFixed(2)}</td>
                  <td>${order.payment_method}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${reportData.categories && reportData.categories.length > 0 ? `
          <div class="categories">
            <h2>Category Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Quantity</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.categories.map(cat => `
                  <tr>
                    <td>${cat.category || 'Uncategorized'}</td>
                    <td>${cat.order_count}</td>
                    <td>${cat.total_quantity}</td>
                    <td>$${parseFloat(cat.category_revenue).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      `
    } else if (selectedReport === 'inventory-sales') {
      reportContent = `
        <div class="summary">
          <h2>Summary Statistics</h2>
          <div class="summary-grid">
            <div><strong>Total Revenue:</strong> $${reportData.summary.totalRevenue.toFixed(2)}</div>
            <div><strong>Units Sold:</strong> ${reportData.summary.totalSold}</div>
            <div><strong>Total Orders:</strong> ${reportData.summary.totalOrders}</div>
          </div>
        </div>
        
        <div class="inventory">
          <h2>Inventory Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Part #</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Stock</th>
                <th>Revenue</th>
                <th>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.inventory.map(item => `
                <tr>
                  <td>${item.part_number}</td>
                  <td>${item.item_name}</td>
                  <td>${item.category}</td>
                  <td>${item.total_sold}</td>
                  <td>${item.current_stock}</td>
                  <td>$${parseFloat(item.total_revenue).toFixed(2)}</td>
                  <td>$${parseFloat(item.avg_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    } else if (selectedReport === 'company-sales') {
      reportContent = `
        <div class="summary">
          <h2>Company Summary</h2>
          <div class="summary-grid">
            <div><strong>Total Orders:</strong> ${reportData.summary.total_orders}</div>
            <div><strong>Total Revenue:</strong> $${parseFloat(reportData.summary.total_revenue).toFixed(2)}</div>
            <div><strong>Average Order:</strong> $${parseFloat(reportData.summary.avg_order).toFixed(2)}</div>
            <div><strong>Total Tax:</strong> $${parseFloat(reportData.summary.total_tax).toFixed(2)}</div>
          </div>
        </div>
        
        <div class="monthly">
          <h2>Monthly Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.monthly.map(month => `
                <tr>
                  <td>${month.month_name} ${month.year}</td>
                  <td>${month.orders}</td>
                  <td>$${parseFloat(month.revenue).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="breakdowns">
          <div>
            <h2>Status Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.statusBreakdown.map(status => `
                  <tr>
                    <td>${status.status}</td>
                    <td>${status.count}</td>
                    <td>$${parseFloat(status.revenue).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div style="margin-top: 2rem;">
            <h2>Payment Methods</h2>
            <table>
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Count</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.paymentMethods.map(method => `
                  <tr>
                    <td>${method.payment_method}</td>
                    <td>${method.count}</td>
                    <td>$${parseFloat(method.revenue).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `
    } else if (selectedReport === 'vendor-inventory') {
      reportContent = `
        <div class="vendor-info">
          <h2>Vendor Information</h2>
          <p><strong>Company:</strong> ${reportData.vendor.company_name}</p>
          <p><strong>Contact:</strong> ${reportData.vendor.contact_person}</p>
          <p><strong>Email:</strong> ${reportData.vendor.email}</p>
          <p><strong>Phone:</strong> ${reportData.vendor.phone}</p>
        </div>
        
        <div class="summary">
          <h2>Inventory Summary</h2>
          <div class="summary-grid">
            <div><strong>Total Items:</strong> ${reportData.summary.total_items}</div>
            <div><strong>In Stock:</strong> ${reportData.summary.in_stock}</div>
            <div><strong>Low Stock:</strong> ${reportData.summary.low_stock}</div>
            <div><strong>Out of Stock:</strong> ${reportData.summary.out_of_stock}</div>
          </div>
        </div>
        
        <div class="inventory">
          <h2>Inventory List</h2>
          <table>
            <thead>
              <tr>
                <th>Part #</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Min Qty</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.inventory.map(item => `
                <tr>
                  <td>${item.part_number}</td>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.stock_level}</td>
                  <td>${item.min_quantity}</td>
                  <td>$${parseFloat(item.price_per_unit).toFixed(2)}</td>
                  <td>${item.stock_status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    }
    
    // Write HTML to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportName}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            
            h1 {
              color: #0066cc;
              margin-bottom: 10px;
              font-size: 24px;
            }
            
            h2 {
              color: #333;
              margin: 20px 0 10px 0;
              font-size: 18px;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 5px;
            }
            
            .header {
              border-bottom: 3px solid #0066cc;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .meta {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            
            .customer-info p,
            .vendor-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin: 10px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            
            .summary-grid div {
              font-size: 14px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 13px;
            }
            
            th {
              background: #0066cc;
              color: white;
              padding: 10px;
              text-align: left;
              font-weight: bold;
            }
            
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #ddd;
            }
            
            tr:nth-child(even) {
              background: #f8f9fa;
            }
            
            tr:hover {
              background: #e9ecef;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              tr:hover {
                background: inherit;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Clipper 2.0 - ${reportName}</h1>
            <div class="meta">
              ${startDate && endDate ? `Period: ${startDate} to ${endDate}<br>` : ''}
              Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </div>
          </div>
          
          ${reportContent}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.focus()
      printWindow.print()
      printWindow.onafterprint = function() {
        printWindow.close()
      }
    }
  }

  const handleEmailReport = async () => {
    if (!reportData) {
      alert('Please generate a report first')
      return
    }

    try {
      // Generate PDF as blob
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Add header
      doc.setFontSize(20)
      doc.setTextColor(0, 102, 204)
      doc.text('Clipper 2.0 - Report', pageWidth / 2, 20, { align: 'center' })
      
      // Add report title
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report'
      doc.text(reportName, pageWidth / 2, 30, { align: 'center' })
      
      // Add date range if available
      let dateText = 'Date Range: '
      if (startDate && endDate) {
        dateText += `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      } else {
        const ranges = {
          'ytd': 'Year to Date',
          'annual': 'Last 12 Months',
          'monthly': 'Last 30 Days',
          'lifetime': 'All Time'
        }
        dateText += ranges[dateRange] || dateRange
      }
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(dateText, pageWidth / 2, 38, { align: 'center' })
      
      let yPos = 45
      
      // Generate the report content
      switch (selectedReport) {
        case 'customer-purchases':
          generateCustomerPurchasesPDF(doc, yPos)
          break
        case 'inventory-sales':
          generateInventorySalesPDF(doc, yPos)
          break
        case 'company-sales':
          generateCompanySalesPDF(doc, yPos)
          break
        case 'vendor-inventory':
          generateVendorInventoryPDF(doc, yPos)
          break
        default:
          alert('Report type not supported for email')
          return
      }

      // Get PDF as blob
      const pdfBlob = doc.output('blob')
      const filename = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

      // Try Web Share API first (works on mobile and some modern browsers with actual file attachment)
      if (navigator.share) {
        try {
          const file = new File([pdfBlob], filename, { type: 'application/pdf' })
          
          // Check if we can share files
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: reportName,
              text: `Please find attached the ${reportName} report.`,
              files: [file]
            })
            return // Successfully shared, exit function
          }
        } catch (shareError) {
          console.log('Web Share API not available or cancelled:', shareError)
          // Continue to fallback
        }
      }

      // Fallback: Download PDF and open email client
      // Download the PDF first
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Small delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url)
        
        // Create email with instructions
        const subject = encodeURIComponent(`${reportName} - ${new Date().toLocaleDateString()}`)
        const body = encodeURIComponent(
          `Hi,\n\n` +
          `Please find the ${reportName} report attached.\n\n` +
          `Report Details:\n` +
          `- Generated: ${new Date().toLocaleString()}\n` +
          `- Date Range: ${dateText.replace('Date Range: ', '')}\n` +
          `- File: ${filename}\n\n` +
          `NOTE: The PDF has been downloaded to your computer. Please attach the file "${filename}" to this email before sending.\n\n` +
          `Best regards`
        )
        
        // Open email client
        window.location.href = `mailto:?subject=${subject}&body=${body}`
      }, 500)
      
    } catch (error) {
      console.error('Error generating email:', error)
      alert('Error preparing report for email: ' + error.message)
    }
  }

  const generatePDF = () => {
    if (!reportData) {
      alert('Please generate a report first')
      return
    }

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Add header
      doc.setFontSize(20)
      doc.setTextColor(0, 102, 204)
      doc.text('Clipper 2.0 - Report', pageWidth / 2, 20, { align: 'center' })
      
      // Add report title
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report'
      doc.text(reportName, pageWidth / 2, 30, { align: 'center' })
      
      // Add date range if available
      if (startDate && endDate) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, 38, { align: 'center' })
      }
      
      // Add generation date
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 44, { align: 'center' })
      
      let yPos = 55
      
      // Generate report based on type
      switch (selectedReport) {
        case 'customer-purchases':
          generateCustomerPurchasesPDF(doc, yPos)
          break
        case 'inventory-sales':
          generateInventorySalesPDF(doc, yPos)
          break
        case 'company-sales':
          generateCompanySalesPDF(doc, yPos)
          break
        case 'vendor-inventory':
          generateVendorInventoryPDF(doc, yPos)
          break
        default:
          doc.text('Report type not supported', 20, yPos)
      }
      
      // Save PDF
      const filename = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF: ' + error.message)
    }
  }

  const generateCustomerPurchasesPDF = (doc, startY) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = startY
    
    // Customer Info
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Customer Information', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Company: ${reportData.customer.company_name}`, 20, yPos)
    yPos += 6
    doc.text(`Contact: ${reportData.customer.contact_name}`, 20, yPos)
    yPos += 6
    doc.text(`Email: ${reportData.customer.email}`, 20, yPos)
    yPos += 6
    doc.text(`Phone: ${reportData.customer.phone}`, 20, yPos)
    yPos += 10
    
    // Summary Stats
    doc.setFontSize(12)
    doc.text('Summary Statistics', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Total Orders: ${reportData.summary.total_orders}`, 20, yPos)
    doc.text(`Average Order: $${parseFloat(reportData.summary.avg_order).toFixed(2)}`, pageWidth / 2, yPos)
    yPos += 6
    doc.text(`Total Spent: $${parseFloat(reportData.summary.total_spent).toFixed(2)}`, 20, yPos)
    doc.text(`First Order: ${new Date(reportData.summary.first_order).toLocaleDateString()}`, pageWidth / 2, yPos)
    yPos += 12
    
    // Orders Table
    doc.setFontSize(12)
    doc.text('Order History', 20, yPos)
    yPos += 5
    
    const orderRows = reportData.orders.map(order => [
      order.order_number,
      new Date(order.order_date).toLocaleDateString(),
      order.status,
      order.item_count.toString(),
      `$${parseFloat(order.grand_total).toFixed(2)}`,
      order.payment_method
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Order #', 'Date', 'Status', 'Items', 'Total', 'Payment']],
      body: orderRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 9 }
    })
    
    yPos = doc.lastAutoTable.finalY + 10
    
    // Category Breakdown
    if (reportData.categories && reportData.categories.length > 0) {
      doc.setFontSize(12)
      doc.text('Category Breakdown', 20, yPos)
      yPos += 5
      
      const categoryRows = reportData.categories.map(cat => [
        cat.category || 'Uncategorized',
        cat.order_count.toString(),
        cat.total_quantity.toString(),
        `$${parseFloat(cat.category_revenue).toFixed(2)}`
      ])
      
      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Orders', 'Quantity', 'Revenue']],
        body: categoryRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204] },
        styles: { fontSize: 9 }
      })
    }
  }

  const generateInventorySalesPDF = (doc, startY) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = startY
    
    // Summary Stats
    doc.setFontSize(12)
    doc.text('Summary Statistics', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Total Revenue: $${reportData.summary.totalRevenue.toFixed(2)}`, 20, yPos)
    doc.text(`Total Orders: ${reportData.summary.totalOrders}`, pageWidth / 2, yPos)
    yPos += 6
    doc.text(`Units Sold: ${reportData.summary.totalSold}`, 20, yPos)
    yPos += 12
    
    // Inventory Table
    doc.setFontSize(12)
    doc.text('Inventory Performance', 20, yPos)
    yPos += 5
    
    const inventoryRows = reportData.inventory.map(item => [
      item.part_number,
      item.item_name,
      item.category,
      item.total_sold.toString(),
      item.current_stock.toString(),
      `$${parseFloat(item.total_revenue).toFixed(2)}`,
      `$${parseFloat(item.avg_price).toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Part #', 'Item', 'Category', 'Sold', 'Stock', 'Revenue', 'Avg Price']],
      body: inventoryRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 8 }
    })
  }

  const generateCompanySalesPDF = (doc, startY) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = startY
    
    // Summary Stats
    doc.setFontSize(12)
    doc.text('Company Summary', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Total Orders: ${reportData.summary.total_orders}`, 20, yPos)
    doc.text(`Average Order: $${parseFloat(reportData.summary.avg_order).toFixed(2)}`, pageWidth / 2, yPos)
    yPos += 6
    doc.text(`Total Revenue: $${parseFloat(reportData.summary.total_revenue).toFixed(2)}`, 20, yPos)
    doc.text(`Total Tax: $${parseFloat(reportData.summary.total_tax).toFixed(2)}`, pageWidth / 2, yPos)
    yPos += 12
    
    // Monthly Performance
    doc.setFontSize(12)
    doc.text('Monthly Performance', 20, yPos)
    yPos += 5
    
    const monthlyRows = reportData.monthly.map(month => [
      `${month.month_name} ${month.year}`,
      month.orders.toString(),
      `$${parseFloat(month.revenue).toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Month', 'Orders', 'Revenue']],
      body: monthlyRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 9 }
    })
    
    yPos = doc.lastAutoTable.finalY + 10
    
    // Status Breakdown
    doc.setFontSize(12)
    doc.text('Status Breakdown', 20, yPos)
    yPos += 5
    
    const statusRows = reportData.statusBreakdown.map(status => [
      status.status,
      status.count.toString(),
      `$${parseFloat(status.revenue).toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Count', 'Revenue']],
      body: statusRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 60 } }
    })
    
    yPos = doc.lastAutoTable.finalY + 10
    
    // Payment Methods
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(12)
    doc.text('Payment Methods', 20, yPos)
    yPos += 5
    
    const paymentRows = reportData.paymentMethods.map(method => [
      method.payment_method,
      method.count.toString(),
      `$${parseFloat(method.revenue).toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Payment Method', 'Count', 'Revenue']],
      body: paymentRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 60 } }
    })
  }

  const generateVendorInventoryPDF = (doc, startY) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = startY
    
    // Vendor Info
    doc.setFontSize(12)
    doc.text('Vendor Information', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Company: ${reportData.vendor.company_name}`, 20, yPos)
    yPos += 6
    doc.text(`Contact: ${reportData.vendor.contact_person}`, 20, yPos)
    yPos += 6
    doc.text(`Email: ${reportData.vendor.email}`, 20, yPos)
    yPos += 6
    doc.text(`Phone: ${reportData.vendor.phone}`, 20, yPos)
    yPos += 10
    
    // Summary Stats
    doc.setFontSize(12)
    doc.text('Inventory Summary', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.text(`Total Items: ${reportData.summary.total_items}`, 20, yPos)
    doc.text(`In Stock: ${reportData.summary.in_stock}`, pageWidth / 2, yPos)
    yPos += 6
    doc.text(`Low Stock: ${reportData.summary.low_stock}`, 20, yPos)
    doc.text(`Out of Stock: ${reportData.summary.out_of_stock}`, pageWidth / 2, yPos)
    yPos += 12
    
    // Inventory Table
    doc.setFontSize(12)
    doc.text('Inventory List', 20, yPos)
    yPos += 5
    
    const inventoryRows = reportData.inventory.map(item => [
      item.part_number,
      item.name,
      item.category,
      item.stock_level.toString(),
      item.min_quantity.toString(),
      `$${parseFloat(item.price_per_unit).toFixed(2)}`,
      item.stock_status
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Part #', 'Item', 'Category', 'Stock', 'Min Qty', 'Price', 'Status']],
      body: inventoryRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      styles: { fontSize: 8 }
    })
  }

  const renderVendorInventoryReport = () => {
    if (!reportData) return null

    return (
      <div>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>{reportData.vendor.company_name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div><strong>Contact:</strong> {reportData.vendor.contact_person}</div>
            <div><strong>Email:</strong> {reportData.vendor.email}</div>
            <div><strong>Phone:</strong> {reportData.vendor.phone}</div>
            <div><strong>Status:</strong> {reportData.vendor.status}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Items</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.total_items}</div>
          </div>
          <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>In Stock</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.in_stock}</div>
          </div>
          <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Low Stock</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.low_stock}</div>
          </div>
          <div style={{ padding: '1rem', background: '#f8d7da', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Out of Stock</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.summary.out_of_stock}</div>
          </div>
        </div>

        <h4 style={{ marginBottom: '1rem' }}>Inventory List</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Part #</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Item Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Stock</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Min Qty</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.inventory.map((item, index) => (
                <tr key={item.item_id} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{item.part_number}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>{item.category}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{item.stock_level}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{item.min_quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>${parseFloat(item.price_per_unit).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      background: item.stock_status === 'In Stock' ? '#d4edda' : item.stock_status === 'Low Stock' ? '#fff3cd' : '#f8d7da',
                      fontSize: '0.75rem'
                    }}>
                      {item.stock_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ 
      background: '#ffffff',
      fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', sans-serif"
    }}>
      <div style={{
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '3px solid #000080'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#000080', textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
          Reports
        </h1>
        <p style={{ margin: 0, color: '#000', fontSize: '1rem', fontWeight: 'normal' }}>
          Generate, view, and export reports in PDF format for printing and emailing
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Report Selection Panel */}
        <div>
          <div style={{ 
            background: '#c0c0c0', 
            padding: '1.5rem', 
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
            marginBottom: '1.5rem' 
          }}>
            <h2 style={{ 
              fontSize: '1.1rem', 
              marginBottom: '1rem',
              fontWeight: 'bold',
              color: '#000',
              textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
            }}>Select Report Type</h2>
            
            <select 
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              style={{ 
                width: '100%',
                padding: '0.5rem',
                border: '2px solid',
                borderColor: '#808080 #ebebeb #ebebeb #808080',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontFamily: "'MS Sans Serif', sans-serif",
                background: '#ffffff'
              }}
            >
              <option value="">-- Choose a report --</option>
              {categories.map(category => (
                <optgroup key={category} label={category}>
                  {reportTypes
                    .filter(r => r.category === category)
                    .map(report => (
                      <option key={report.id} value={report.id}>
                        {report.name}{!report.implemented ? ' (Coming Soon)' : ''}
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
                border: '2px solid',
                borderColor: '#000000 #ebebeb #ebebeb #000000',
                fontSize: '0.875rem',
                color: '#004085',
                marginBottom: '1rem',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
              }}>
                {getReportDescription(selectedReport)}
              </div>
            )}

            {selectedReport === 'customer-purchases' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Purchase Period
                </label>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: "'MS Sans Serif', sans-serif",
                    background: '#ffffff'
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                Date Range
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
                placeholder="Start Date"
              />
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid',
                  borderColor: '#808080 #ebebeb #ebebeb #808080',
                  fontSize: '0.875rem',
                  fontFamily: "'MS Sans Serif', sans-serif"
                }}
                placeholder="End Date"
              />
            </div>

            {(selectedReport === 'sales-agent' || selectedReport === 'customer' || 
              selectedReport === 'customer-purchases' || selectedReport === 'vendor-sales' || 
              selectedReport === 'vendor-inventory') && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  {selectedReport.includes('vendor') ? 'Select Vendor' : 
                   selectedReport.includes('customer') ? 'Select Customer' : 'Select Agent'}
                </label>
                <select 
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid',
                    borderColor: '#808080 #ebebeb #ebebeb #808080',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: "'MS Sans Serif', sans-serif",
                    background: '#ffffff'
                  }}
                >
                  <option value="">-- Select {selectedReport.includes('vendor') ? 'Vendor' : selectedReport.includes('customer') ? 'Customer' : 'Agent'} --</option>
                  {selectedReport.includes('vendor') 
                    ? vendors.map(vendor => (
                        <option key={vendor.supplier_id} value={vendor.supplier_id}>
                          {vendor.company_name}
                        </option>
                      ))
                    : selectedReport.includes('customer')
                    ? customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.company_name} ({customer.email})
                        </option>
                      ))
                    : null
                  }
                </select>
              </div>
            )}

            <div style={{ 
              padding: '1rem',
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#000000 #ebebeb #ebebeb #000000',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#000', marginBottom: '1rem', fontWeight: 'bold' }}>
                Export Options
              </div>
              <button 
                onClick={() => handleGenerateReport('Report')}
                disabled={!selectedReport || !isReportImplemented || generating}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: selectedReport && isReportImplemented && !generating ? '#28a745' : '#808080',
                  color: selectedReport && isReportImplemented && !generating ? '#fff' : '#c0c0c0',
                  border: '3px solid',
                  borderColor: selectedReport && isReportImplemented && !generating ? '#32d154 #1a6b2e #1a6b2e #32d154' : '#808080 #c0c0c0 #c0c0c0 #808080',
                  cursor: selectedReport && isReportImplemented && !generating ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  fontFamily: "'MS Sans Serif', sans-serif",
                  textShadow: selectedReport && isReportImplemented && !generating ? '1px 1px 0 rgba(0,0,0,0.3)' : 'none',
                  boxShadow: selectedReport && isReportImplemented && !generating ? '3px 3px 0 rgba(0,0,0,0.2)' : 'none'
                }}
                onMouseDown={(e) => {
                  if (selectedReport && isReportImplemented && !generating) {
                    e.target.style.borderColor = '#1a6b2e #32d154 #32d154 #1a6b2e'
                  }
                }}
                onMouseUp={(e) => {
                  if (selectedReport && isReportImplemented && !generating) {
                    e.target.style.borderColor = '#32d154 #1a6b2e #1a6b2e #32d154'
                  }
                }}
              >
                {generating ? 'Generating...' : '📊 Generate Report'}
              </button>
              {selectedReport && !isReportImplemented && (
                <div style={{
                  padding: '0.75rem',
                  background: '#ffffe0',
                  border: '2px solid',
                  borderColor: '#000000 #ebebeb #ebebeb #000000',
                  fontSize: '0.875rem',
                  color: '#000',
                  marginBottom: '0.5rem',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                }}>
                  <strong>⚠️ Coming Soon</strong><br />
                  This report is not yet available. Try one of these:<br />
                  • Customer Purchase History<br />
                  • Inventory Sales Report<br />
                  • Company Sales Report<br />
                  • Vendor Inventory Report
                </div>
              )}
              <button 
                onClick={handleEmailReport}
                disabled={!reportData || loading}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  background: (!reportData || loading) ? '#808080' : '#17a2b8',
                  color: (!reportData || loading) ? '#c0c0c0' : '#fff',
                  border: '3px solid',
                  borderColor: (!reportData || loading) ? '#808080 #c0c0c0 #c0c0c0 #808080' : '#1fc8df #0c7489 #0c7489 #1fc8df',
                  cursor: (!reportData || loading) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  fontFamily: "'MS Sans Serif', sans-serif",
                  textShadow: (!reportData || loading) ? 'none' : '1px 1px 0 rgba(0,0,0,0.3)',
                  boxShadow: (!reportData || loading) ? 'none' : '3px 3px 0 rgba(0,0,0,0.2)'
                }}
                onMouseDown={(e) => {
                  if (!(!reportData || loading)) {
                    e.target.style.borderColor = '#0c7489 #1fc8df #1fc8df #0c7489'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!reportData || loading)) {
                    e.target.style.borderColor = '#1fc8df #0c7489 #0c7489 #1fc8df'
                  }
                }}
                onMouseUp={(e) => {
                  if (!(!reportData || loading)) {
                    e.target.style.borderColor = '#1fc8df #0c7489 #0c7489 #1fc8df'
                  }
                }}
              >
                ✉️ Email Report
              </button>
            </div>
          </div>

          <div style={{ 
            padding: '1rem',
            background: 'linear-gradient(to bottom, #008080 0%, #006060 100%)',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            color: '#ffffff',
            fontSize: '0.875rem'
          }}>
            <strong style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>✅ Database Connected:</strong> Reports are now generated from live database data. Select options and click "Generate Report" to view results.
          </div>
        </div>

        {/* Report Preview/Content Area */}
        <div>
          <div style={{ 
            background: 'white',
            padding: '2rem',
            border: '3px solid',
            borderColor: '#000000 #ebebeb #ebebeb #000000',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
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
                <div style={{ 
                  borderBottom: '3px solid #000080', 
                  paddingBottom: '1rem', 
                  marginBottom: '2rem' 
                }}>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.5rem',
                    color: '#000080',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.1)'
                  }}>
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
                  minHeight: '400px'
                }}>
                  {loading ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      minHeight: '400px', 
                      color: '#000',
                      background: '#c0c0c0',
                      border: '2px solid',
                      borderColor: '#000000 #ebebeb #ebebeb #000000',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        <p style={{ fontSize: '1.125rem' }}>Generating report...</p>
                      </div>
                    </div>
                  ) : reportData ? (
                    <div>
                      {selectedReport === 'customer-purchases' && renderCustomerPurchasesReport()}
                      {selectedReport === 'inventory-sales' && renderInventorySalesReport()}
                      {selectedReport === 'company-sales' && renderCompanySalesReport()}
                      {selectedReport === 'vendor-inventory' && renderVendorInventoryReport()}
                    </div>
                  ) : (
                    <div style={{ 
                      background: '#c0c0c0',
                      padding: '3rem',
                      border: '2px solid',
                      borderColor: '#000000 #ebebeb #ebebeb #000000',
                      textAlign: 'center',
                      minHeight: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                      <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>Report Preview Area</h3>
                      <p style={{ color: '#adb5bd', maxWidth: '400px', margin: '0 auto' }}>
                        Configure options above and click "Generate Report" to view results
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button 
                    onClick={generatePDF}
                    disabled={!reportData || loading}
                    style={{ 
                      padding: '0.75rem 2rem',
                      marginRight: '1rem',
                      background: (!reportData || loading) ? '#808080' : '#28a745',
                      color: (!reportData || loading) ? '#c0c0c0' : '#fff',
                      border: '3px solid',
                      borderColor: (!reportData || loading) ? '#808080 #c0c0c0 #c0c0c0 #808080' : '#32d154 #1a6b2e #1a6b2e #32d154',
                      cursor: (!reportData || loading) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      fontFamily: "'MS Sans Serif', sans-serif",
                      textShadow: (!reportData || loading) ? 'none' : '1px 1px 0 rgba(0,0,0,0.3)',
                      boxShadow: (!reportData || loading) ? 'none' : '3px 3px 0 rgba(0,0,0,0.2)'
                    }}
                    onMouseDown={(e) => {
                      if (reportData && !loading) {
                        e.target.style.borderColor = '#1a6b2e #32d154 #32d154 #1a6b2e'
                      }
                    }}
                    onMouseUp={(e) => {
                      if (reportData && !loading) {
                        e.target.style.borderColor = '#32d154 #1a6b2e #1a6b2e #32d154'
                      }
                    }}
                  >
                    📥 Download PDF
                  </button>
                  <button 
                    onClick={handlePrint}
                    disabled={!reportData || loading}
                    style={{ 
                      padding: '0.75rem 2rem',
                      background: (!reportData || loading) ? '#808080' : '#0d6efd',
                      color: (!reportData || loading) ? '#c0c0c0' : '#fff',
                      border: '3px solid',
                      borderColor: (!reportData || loading) ? '#808080 #c0c0c0 #c0c0c0 #808080' : '#4a8fff #084298 #084298 #4a8fff',
                      cursor: (!reportData || loading) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      fontFamily: "'MS Sans Serif', sans-serif",
                      textShadow: (!reportData || loading) ? 'none' : '1px 1px 0 rgba(0,0,0,0.3)',
                      boxShadow: (!reportData || loading) ? 'none' : '3px 3px 0 rgba(0,0,0,0.2)'
                    }}
                    onMouseDown={(e) => {
                      if (reportData && !loading) {
                        e.target.style.borderColor = '#084298 #4a8fff #4a8fff #084298'
                      }
                    }}
                    onMouseUp={(e) => {
                      if (reportData && !loading) {
                        e.target.style.borderColor = '#4a8fff #084298 #084298 #4a8fff'
                      }
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
