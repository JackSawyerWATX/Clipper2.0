import React, { useState, useEffect } from 'react'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch data from multiple endpoints
      const [inventoryRes, ordersRes, customersRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/inventory'),
        fetch('http://localhost:5000/api/orders'),
        fetch('http://localhost:5000/api/customers'),
        fetch('http://localhost:5000/api/analytics/dashboard/summary')
      ])

      if (!inventoryRes.ok || !ordersRes.ok || !customersRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const inventory = await inventoryRes.json()
      const orders = await ordersRes.json()
      const customers = await customersRes.json()
      const analytics = await analyticsRes.json()

      setDashboardData({
        totalItems: inventory.length || 0,
        totalOrders: orders.length || 0,
        totalCustomers: customers.length || 0,
        revenue: analytics.revenue || 0
      })
      
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const styles = {
    dashboardPage: {
      background: '#008080',
      padding: '1rem',
      minHeight: 'calc(100vh - 100px)'
    },
    windowHeader: {
      background: 'linear-gradient(to bottom, #000080 0%, #0000aa 100%)',
      color: 'white',
      padding: '0.4rem 0.6rem',
      fontWeight: 'bold',
      border: '2px solid',
      borderColor: '#ffffff #000000 #000000 #ffffff',
      boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      marginBottom: 0
    },
    windowTitle: {
      fontSize: '0.9rem',
      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.5)',
      letterSpacing: '0.5px'
    },
    windowContent: {
      background: '#c0c0c0',
      border: '2px solid',
      borderColor: '#808080 #ffffff #ffffff #808080',
      padding: '1.5rem',
      boxShadow: 'inset -1px -1px 0 #dfdfdf, inset 1px 1px 0 #000000, inset -2px -2px 0 #ffffff, inset 2px 2px 0 #808080'
    },
    subtitle: {
      fontSize: '0.9rem',
      color: '#000000',
      margin: '0 0 1.5rem 0',
      padding: '0.5rem',
      background: '#c0c0c0'
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.5rem'
    },
    panel: {
      background: '#c0c0c0',
      border: '3px solid',
      borderColor: '#808080 #ffffff #ffffff #808080',
      boxShadow: 'inset -1px -1px 0 #dfdfdf, inset 1px 1px 0 #000000, inset -2px -2px 0 #ffffff, inset 2px 2px 0 #808080, 4px 4px 8px rgba(0,0,0,0.3)'
    },
    panelTitle: {
      background: 'linear-gradient(to bottom, #000080 0%, #0000aa 100%)',
      color: 'white',
      padding: '0.4rem 0.8rem',
      fontWeight: 'bold',
      fontSize: '0.85rem',
      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.5)',
      borderBottom: '2px solid',
      borderColor: '#000000 #ffffff'
    },
    panelContent: {
      padding: '2rem 1rem',
      background: '#c0c0c0',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    displayValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#000000',
      textShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)',
      fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', monospace"
    },
    statusActive: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#000080',
      textShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)',
      fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', monospace"
    }
  }

  if (loading) {
    return (
      <div className="page" style={styles.dashboardPage}>
        <div style={styles.windowHeader}>
          <span style={styles.windowTitle}>Dashboard</span>
        </div>
        <div style={styles.windowContent}>
          <p style={styles.subtitle}>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page" style={styles.dashboardPage}>
        <div style={styles.windowHeader}>
          <span style={styles.windowTitle}>Dashboard</span>
        </div>
        <div style={styles.windowContent}>
          <p style={{...styles.subtitle, color: '#800000'}}>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={styles.dashboardPage}>
      <div style={styles.windowHeader}>
        <span style={styles.windowTitle}>Dashboard</span>
      </div>
      
      <div style={styles.windowContent}>
        <p style={styles.subtitle}>View topical information at a glance</p>
        
        <div style={styles.dashboardGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Inventory Items</div>
            <div style={styles.panelContent}>
              <div style={styles.displayValue}>{dashboardData.totalItems}</div>
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Total Orders</div>
            <div style={styles.panelContent}>
              <div style={styles.displayValue}>{dashboardData.totalOrders}</div>
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Total Customers</div>
            <div style={styles.panelContent}>
              <div style={styles.displayValue}>{dashboardData.totalCustomers}</div>
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelTitle}>YTD Revenue</div>
            <div style={styles.panelContent}>
              <div style={{...styles.displayValue, fontSize: '1.8rem'}}>
                {formatCurrency(dashboardData.revenue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
