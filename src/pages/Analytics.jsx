import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://clipper-backend-prod.eba-cg2igaaf.us-west-2.elasticbeanstalk.com';






// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

function Analytics() {
  const [selectedYear] = useState(2025)
  const [salesData, setSalesData] = useState(null)
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      console.log('Fetching analytics data...')
      
      // Fetch sales data
      const salesResponse = await fetch(`${API_URL}/api/analytics/sales`)
      if (!salesResponse.ok) throw new Error('Failed to fetch sales data')
      const sales = await salesResponse.json()
      console.log('Sales data:', sales)
      
      // Fetch customer data
      const customerResponse = await fetch(`${API_URL}/api/analytics/customers`)
      if (!customerResponse.ok) throw new Error('Failed to fetch customer data')
      const customers = await customerResponse.json()
      console.log('Customer data:', customers)
      
      // Transform sales data to match component structure
      const yearlyData = {}
      sales.yearly.forEach(y => {
        yearlyData[y.year] = {
          revenue: parseFloat(y.revenue) || 0,
          orders: parseInt(y.orders) || 0,
          growth: 0 // Calculate if previous year data available
        }
      })

      const quarterlyData = {}
      sales.quarterly.forEach(q => {
        quarterlyData[q.quarter] = {
          revenue: parseFloat(q.revenue) || 0,
          orders: parseInt(q.orders) || 0,
          growth: 0
        }
      })

      const monthlyData = sales.monthly.map(m => ({
        month: m.month,
        revenue: parseFloat(m.revenue) || 0,
        orders: parseInt(m.orders) || 0
      }))

      const transformedSalesData = {
        ytd: {
          revenue: parseFloat(sales.ytd.revenue) || 0,
          orders: parseInt(sales.ytd.orders) || 0,
          avgOrder: parseFloat(sales.ytd.avgOrder) || 0
        },
        yearly: yearlyData,
        quarterly: quarterlyData,
        monthly: monthlyData
      }
      
      console.log('Transformed sales data:', transformedSalesData)
      setSalesData(transformedSalesData)
      setCustomerData(customers)
      setError(null)
      console.log('Data set successfully')
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ 
        background: '#ffffff',
        fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', sans-serif"
      }}>
        <h1>Analytics Dashboard</h1>
        <p>Loading analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page" style={{ 
        background: '#ffffff',
        fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', sans-serif"
      }}>
        <h1>Analytics Dashboard</h1>
        <div style={{
          padding: '1rem',
          background: '#f8d7da',
          border: '2px solid #f5c6cb',
          color: '#721c24',
          marginTop: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  if (!salesData || !customerData) {
    return (
      <div className="page" style={{ 
        background: '#ffffff',
        fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', sans-serif"
      }}>
        <h1>Analytics Dashboard</h1>
        <p>No data available.</p>
      </div>
    )
  }

  // Chart.js configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: { family: "'MS Sans Serif', sans-serif", size: 11 },
          color: '#000',
          padding: 10
        }
      },
      tooltip: {
        titleFont: { family: "'MS Sans Serif', sans-serif" },
        bodyFont: { family: "'MS Sans Serif', sans-serif" }
      }
    },
    scales: {
      y: {
        ticks: { 
          font: { family: "'MS Sans Serif', sans-serif", size: 10 }, 
          color: '#000' 
        },
        grid: { color: '#c0c0c0' }
      },
      x: {
        ticks: { 
          font: { family: "'MS Sans Serif', sans-serif", size: 10 }, 
          color: '#000' 
        },
        grid: { color: '#e0e0e0' }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: "'MS Sans Serif', sans-serif", size: 11 },
          color: '#000',
          padding: 10
        }
      },
      tooltip: {
        titleFont: { family: "'MS Sans Serif', sans-serif" },
        bodyFont: { family: "'MS Sans Serif', sans-serif" }
      }
    }
  }

  // Yearly Revenue Chart Data
  const yearlyChartData = {
    labels: Object.keys(salesData.yearly),
    datasets: [{
      label: 'Revenue ($)',
      data: Object.values(salesData.yearly).map(d => d.revenue),
      backgroundColor: '#008080',
      borderColor: '#000000',
      borderWidth: 2
    }]
  }

  // Quarterly Revenue Chart Data
  const sortedQuarters = Object.entries(salesData.quarterly).sort((a, b) => {
    const order = ['Q1', 'Q2', 'Q3', 'Q4']
    return order.indexOf(a[0]) - order.indexOf(b[0])
  })
  const quarterlyChartData = {
    labels: sortedQuarters.map(([quarter]) => quarter),
    datasets: [{
      label: 'Revenue ($)',
      data: sortedQuarters.map(([, data]) => data.revenue),
      backgroundColor: '#000080',
      borderColor: '#000000',
      borderWidth: 2
    }]
  }

  // Monthly Revenue Chart Data
  const monthlyChartData = {
    labels: salesData.monthly.map(item => item.month),
    datasets: [{
      label: 'Revenue ($)',
      data: salesData.monthly.map(item => item.revenue),
      borderColor: '#000080',
      backgroundColor: 'rgba(0, 0, 128, 0.2)',
      borderWidth: 2,
      tension: 0.1
    }]
  }

  // Customer Segments Pie Chart Data
  const segmentChartData = {
    labels: ['One-Time Buyers', 'Regular Buyers', 'Recurring'],
    datasets: [{
      data: [
        customerData.segments.oneTime.count,
        customerData.segments.regular.count,
        customerData.segments.recurring.count
      ],
      backgroundColor: ['#808000', '#008080', '#000080'],
      borderColor: '#000000',
      borderWidth: 2
    }]
  }

  const renderChart = (title) => (
    <div style={{
      background: '#ffffff',
      border: '2px solid',
      borderColor: '#808080 #ebebeb #ebebeb #808080',
      boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
      padding: '3rem 2rem',
      textAlign: 'center',
      marginBottom: '1rem'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
      <div style={{ color: '#000', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '0.85rem', color: '#808080', marginTop: '0.5rem' }}>
        Chart placeholder - Integrate Chart.js or Recharts
      </div>
    </div>
  )

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
          Analytics Dashboard
        </h1>
        <p style={{ margin: 0, color: '#000', fontSize: '1rem', fontWeight: 'normal' }}>
          Comprehensive sales and customer analytics for {selectedYear}
        </p>
      </div>

      {/* Year-to-Date Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#000',
          padding: '0.5rem',
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#ebebeb #000000 #000000 #ebebeb',
          textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
        }}>
          Year-to-Date (YTD) Performance
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #008080 0%, #006060 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              YTD Revenue
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              ${salesData.ytd.revenue.toLocaleString()}
            </div>
          </div>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #000080 0%, #000060 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              YTD Orders
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              {salesData.ytd.orders}
            </div>
          </div>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #808000 0%, #606000 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              Average Order Value
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              ${salesData.ytd.avgOrder.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Time Period */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#000',
          padding: '0.5rem',
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#ebebeb #000000 #000000 #ebebeb',
          textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
        }}>
          Sales Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
              Yearly Performance
            </h3>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <Bar data={yearlyChartData} options={chartOptions} />
            </div>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '0.5rem',
              marginTop: '1rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                <thead>
                  <tr style={{ background: '#000080', color: '#ffffff' }}>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Year</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Revenue</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Orders</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(salesData.yearly).map(([year, data], index) => (
                    <tr key={year} style={{ background: index % 2 === 0 ? '#ffffff' : '#f0f0f0' }}>
                      <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', fontWeight: '500' }}>
                        {year}
                      </td>
                      <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                        ${data.revenue.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                        {data.orders}
                      </td>
                      <td style={{ 
                        padding: '0.6rem', 
                        border: '1px solid #c0c0c0', 
                        fontSize: '0.9rem', 
                        textAlign: 'right',
                        color: '#008000',
                        fontWeight: 'bold'
                      }}>
                        +{data.growth}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
              Quarterly Breakdown
            </h3>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <Bar data={quarterlyChartData} options={chartOptions} />
            </div>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '0.5rem',
              marginTop: '1rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                <thead>
                  <tr style={{ background: '#000080', color: '#ffffff' }}>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Quarter</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Revenue</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Orders</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(salesData.quarterly)
                    .sort((a, b) => {
                      const order = ['Q1', 'Q2', 'Q3', 'Q4']
                      return order.indexOf(a[0]) - order.indexOf(b[0])
                    })
                    .map(([quarter, data], index) => (
                    <tr key={quarter} style={{ background: index % 2 === 0 ? '#ffffff' : '#f0f0f0' }}>
                      <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', fontWeight: '500' }}>
                        {quarter}
                      </td>
                      <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                        ${data.revenue.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                        {data.orders}
                      </td>
                      <td style={{ 
                        padding: '0.6rem', 
                        border: '1px solid #c0c0c0', 
                        fontSize: '0.9rem', 
                        textAlign: 'right',
                        color: '#008000',
                        fontWeight: 'bold'
                      }}>
                        +{data.growth}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
            Monthly Sales Trend
          </h3>
          <div style={{
            background: '#ffffff',
            border: '2px solid',
            borderColor: '#808080 #ebebeb #ebebeb #808080',
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <Line data={monthlyChartData} options={chartOptions} />
          </div>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '0.5rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', minWidth: '100%' }}>
                <thead>
                  <tr style={{ background: '#000080', color: '#ffffff' }}>
                    {salesData.monthly.map(item => (
                      <th key={item.month} style={{ 
                        padding: '0.6rem', 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        border: '1px solid #000000',
                        textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
                        minWidth: '80px'
                      }}>
                        {item.month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {salesData.monthly.map((item, index) => (
                      <td key={item.month} style={{ 
                        padding: '0.6rem', 
                        border: '1px solid #c0c0c0', 
                        fontSize: '0.85rem', 
                        textAlign: 'center',
                        background: index % 2 === 0 ? '#ffffff' : '#f0f0f0'
                      }}>
                        ${(item.revenue / 1000).toFixed(1)}k
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {salesData.monthly.map((item, index) => (
                      <td key={item.month} style={{ 
                        padding: '0.6rem', 
                        border: '1px solid #c0c0c0', 
                        fontSize: '0.85rem', 
                        textAlign: 'center',
                        color: '#808080',
                        background: index % 2 === 0 ? '#ffffff' : '#f0f0f0'
                      }}>
                        {item.orders} orders
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#000',
          padding: '0.5rem',
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#ebebeb #000000 #000000 #ebebeb',
          textShadow: '1px 1px 0 rgba(255,255,255,0.8)'
        }}>
          Customer Analytics
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            padding: '1.2rem',
            background: '#c0c0c0',
            color: '#000',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', color: '#000', textShadow: '1px 1px 0 rgba(255,255,255,0.8)' }}>
              Total Customers
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, color: '#000', textShadow: '2px 2px 0 rgba(255,255,255,0.5)' }}>
              {customerData.total}
            </div>
          </div>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #008000 0%, #006000 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              New Customers
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              +{customerData.new}
            </div>
          </div>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #800000 0%, #600000 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              Lost Customers
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              -{customerData.lost}
            </div>
          </div>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #000080 0%, #000060 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              Net Growth
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              +{customerData.netGrowth}
            </div>
          </div>
          <div style={{
            padding: '1.2rem',
            background: 'linear-gradient(to bottom, #808000 0%, #606000 100%)',
            color: '#ffffff',
            border: '3px solid',
            borderColor: '#ebebeb #000000 #000000 #ebebeb',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'normal', textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              Growth Rate
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              +{customerData.growthRate}%
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
              Customer Segmentation
            </h3>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '2rem 1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px'
            }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <Pie data={segmentChartData} options={pieOptions} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
              Customer Type Breakdown
            </h3>
            <div style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor: '#808080 #ebebeb #ebebeb #808080',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)',
              padding: '0.5rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                <thead>
                  <tr style={{ background: '#000080', color: '#ffffff' }}>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'left', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Type</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Count</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>%</th>
                    <th style={{ 
                      padding: '0.6rem', 
                      textAlign: 'right', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      border: '1px solid #000000',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#ffffff' }}>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: '500' }}>One-Time Buyers</div>
                      <div style={{ fontSize: '0.85rem', color: '#808080', fontWeight: 'normal', marginTop: '0.25rem' }}>
                        Single purchase only
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right', fontWeight: '500' }}>
                      {customerData.segments.oneTime.count}
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                      {customerData.segments.oneTime.percentage}%
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                      ${customerData.segments.oneTime.revenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ background: '#f0f0f0' }}>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: '500' }}>Regular Buyers</div>
                      <div style={{ fontSize: '0.85rem', color: '#808080', fontWeight: 'normal', marginTop: '0.25rem' }}>
                        Multiple purchases
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right', fontWeight: '500' }}>
                      {customerData.segments.regular.count}
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                      {customerData.segments.regular.percentage}%
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                      ${customerData.segments.regular.revenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ background: '#ffffff' }}>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: '500' }}>Recurring/Auto-Purchase</div>
                      <div style={{ fontSize: '0.85rem', color: '#808080', fontWeight: 'normal', marginTop: '0.25rem' }}>
                        Subscription customers
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right', fontWeight: '500' }}>
                      {customerData.segments.recurring.count}
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                      {customerData.segments.recurring.percentage}%
                    </td>
                    <td style={{ padding: '0.6rem', border: '1px solid #c0c0c0', fontSize: '0.9rem', textAlign: 'right' }}>
                      ${customerData.segments.recurring.revenue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#ffffe0',
        border: '2px solid',
        borderColor: '#000000 #ebebeb #ebebeb #000000',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
        color: '#000'
      }}>
        <strong style={{ fontWeight: 'bold', color: '#000080' }}>Note:</strong> Analytics data is now connected to the database and displays real-time metrics based on your orders and customers.
      </div>
    </div>
  )
}

export default Analytics
