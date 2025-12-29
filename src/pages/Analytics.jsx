import React, { useState } from 'react'

function Analytics() {
  // Mock data - will be replaced with database data later
  const [selectedYear] = useState(2025)
  
  const salesData = {
    ytd: { revenue: 1245600, orders: 342, avgOrder: 3641.52 },
    yearly: {
      2025: { revenue: 1245600, orders: 342, growth: 15.3 },
      2024: { revenue: 1080200, orders: 298, growth: 12.1 },
      2023: { revenue: 963500, orders: 267, growth: 8.5 }
    },
    quarterly: {
      Q1: { revenue: 285400, orders: 78, growth: 12.5 },
      Q2: { revenue: 312800, orders: 85, growth: 18.2 },
      Q3: { revenue: 348200, orders: 95, growth: 15.7 },
      Q4: { revenue: 299200, orders: 84, growth: 10.9 }
    },
    monthly: [
      { month: 'Jan', revenue: 95200, orders: 26 },
      { month: 'Feb', revenue: 88900, orders: 24 },
      { month: 'Mar', revenue: 101300, orders: 28 },
      { month: 'Apr', revenue: 98700, orders: 27 },
      { month: 'May', revenue: 106500, orders: 29 },
      { month: 'Jun', revenue: 107600, orders: 29 },
      { month: 'Jul', revenue: 115800, orders: 32 },
      { month: 'Aug', revenue: 118900, orders: 33 },
      { month: 'Sep', revenue: 113500, orders: 30 },
      { month: 'Oct', revenue: 102400, orders: 29 },
      { month: 'Nov', revenue: 96800, orders: 27 },
      { month: 'Dec', revenue: 100000, orders: 28 }
    ]
  }

  const customerData = {
    total: 156,
    new: 23,
    lost: 8,
    netGrowth: 15,
    growthRate: 10.6,
    segments: {
      oneTime: { count: 42, percentage: 26.9, revenue: 125400 },
      regular: { count: 89, percentage: 57.1, revenue: 892600 },
      recurring: { count: 25, percentage: 16.0, revenue: 227600 }
    }
  }

  const renderChart = (title) => (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '4rem 2rem', 
      borderRadius: '8px',
      textAlign: 'center',
      border: '2px dashed #dee2e6'
    }}>
      <div style={{ fontSize: '1.5rem', color: '#6c757d', marginBottom: '0.5rem' }}>📊</div>
      <div style={{ color: '#6c757d' }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: '#adb5bd', marginTop: '0.5rem' }}>
        Chart placeholder - Integrate Chart.js or Recharts
      </div>
    </div>
  )

  return (
    <div className="page">
      <h1>Analytics Dashboard</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
        Comprehensive sales and customer analytics for {selectedYear}
      </p>

      {/* Year-to-Date Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Year-to-Date (YTD) Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.5rem', background: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
            <div style={{ fontSize: '0.875rem', color: '#155724', marginBottom: '0.5rem' }}>YTD Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
              ${salesData.ytd.revenue.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: '#d1ecf1', borderRadius: '8px', border: '1px solid #bee5eb' }}>
            <div style={{ fontSize: '0.875rem', color: '#0c5460', marginBottom: '0.5rem' }}>YTD Orders</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c5460' }}>
              {salesData.ytd.orders}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <div style={{ fontSize: '0.875rem', color: '#856404', marginBottom: '0.5rem' }}>Avg Order Value</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
              ${salesData.ytd.avgOrder.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Time Period */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Sales Analytics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Yearly Performance</h3>
            {renderChart('Revenue by Year Chart')}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              marginTop: '1rem',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Year</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Revenue</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Orders</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Growth</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(salesData.yearly).map(([year, data]) => (
                  <tr key={year} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{year}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{data.orders}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#28a745' }}>
                      +{data.growth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Quarterly Breakdown</h3>
            {renderChart('Revenue by Quarter Chart')}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              marginTop: '1rem',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Quarter</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Revenue</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Orders</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Growth</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(salesData.quarterly).map(([quarter, data]) => (
                  <tr key={quarter} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{quarter}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{data.orders}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#28a745' }}>
                      +{data.growth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Monthly Sales Trend</h3>
          {renderChart('Monthly Revenue Trend Chart')}
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  {salesData.monthly.map(item => (
                    <th key={item.month} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {item.month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                  {salesData.monthly.map(item => (
                    <td key={item.month} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
                      ${(item.revenue / 1000).toFixed(1)}k
                    </td>
                  ))}
                </tr>
                <tr>
                  {salesData.monthly.map(item => (
                    <td key={item.month} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#6c757d' }}>
                      {item.orders} orders
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Customer Analytics</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>Total Customers</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{customerData.total}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
            <div style={{ fontSize: '0.875rem', color: '#155724', marginBottom: '0.5rem' }}>New Customers</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>+{customerData.new}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <div style={{ fontSize: '0.875rem', color: '#721c24', marginBottom: '0.5rem' }}>Lost Customers</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>-{customerData.lost}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#d1ecf1', borderRadius: '8px', border: '1px solid #bee5eb' }}>
            <div style={{ fontSize: '0.875rem', color: '#0c5460', marginBottom: '0.5rem' }}>Net Growth</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c5460' }}>+{customerData.netGrowth}</div>
          </div>
          <div style={{ padding: '1.5rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <div style={{ fontSize: '0.875rem', color: '#856404', marginBottom: '0.5rem' }}>Growth Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>+{customerData.growthRate}%</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Customer Segmentation</h3>
            {renderChart('Customer Segments Pie Chart')}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#495057' }}>Customer Type Breakdown</h3>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Count</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>%</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>One-Time Buyers</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Single purchase only</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                    {customerData.segments.oneTime.count}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {customerData.segments.oneTime.percentage}%
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    ${customerData.segments.oneTime.revenue.toLocaleString()}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>Regular Buyers</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Multiple purchases</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                    {customerData.segments.regular.count}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {customerData.segments.regular.percentage}%
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    ${customerData.segments.regular.revenue.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>Recurring/Auto-Purchase</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Subscription customers</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                    {customerData.segments.recurring.count}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {customerData.segments.recurring.percentage}%
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    ${customerData.segments.recurring.revenue.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#d1ecf1', borderRadius: '4px', color: '#0c5460' }}>
        <strong>Note:</strong> Chart placeholders shown above. Integrate Chart.js or Recharts library for visual graphs. 
        Database integration pending for real-time data.
      </div>
    </div>
  )
}

export default Analytics
