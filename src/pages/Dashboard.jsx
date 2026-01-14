import React, { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

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

  if (loading) {
    return (
      <div className="page dashboard-page">
        <div className="win3-window-header">
          <span className="win3-window-title">Dashboard</span>
        </div>
        <div className="win3-window-content">
          <p className="win3-subtitle">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page dashboard-page">
        <div className="win3-window-header">
          <span className="win3-window-title">Dashboard</span>
        </div>
        <div className="win3-window-content">
          <p className="win3-subtitle-error">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page dashboard-page">
      <div className="win3-window-header">
        <span className="win3-window-title">Dashboard</span>
      </div>
      
      <div className="win3-window-content">
        <p className="win3-subtitle">View topical information at a glance</p>
        
        <div className="dashboard-grid">
          <div className="win3-panel">
            <div className="win3-panel-title">Inventory Items</div>
            <div className="win3-panel-content">
              <div className="win3-display-value">{dashboardData.totalItems}</div>
            </div>
          </div>
          
          <div className="win3-panel">
            <div className="win3-panel-title">Total Orders</div>
            <div className="win3-panel-content">
              <div className="win3-display-value">{dashboardData.totalOrders}</div>
            </div>
          </div>
          
          <div className="win3-panel">
            <div className="win3-panel-title">Total Customers</div>
            <div className="win3-panel-content">
              <div className="win3-display-value">{dashboardData.totalCustomers}</div>
            </div>
          </div>
          
          <div className="win3-panel">
            <div className="win3-panel-title">YTD Revenue</div>
            <div className="win3-panel-content">
              <div className="win3-display-value-small">
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