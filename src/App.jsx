import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Import page components
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import ShipmentTracking from './pages/ShipmentTracking'
import Suppliers from './pages/Suppliers'
import Inventory from './pages/Inventory'
import Analytics from './pages/Analytics'
import PaymentProcessing from './pages/PaymentProcessing'
import Reports from './pages/Reports'
import Admin from './pages/Admin'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showTimeZones, setShowTimeZones] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Router>
        <Login onLogin={handleLogin} />
      </Router>
    )
  }

  const timeZones = [
    { name: 'Local Time', zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { name: 'New York (EST)', zone: 'America/New_York' },
    { name: 'Los Angeles (PST)', zone: 'America/Los_Angeles' },
    { name: 'Chicago (CST)', zone: 'America/Chicago' },
    { name: 'London (GMT)', zone: 'Europe/London' },
    { name: 'Paris (CET)', zone: 'Europe/Paris' },
    { name: 'Tokyo (JST)', zone: 'Asia/Tokyo' },
    { name: 'Sydney (AEST)', zone: 'Australia/Sydney' },
    { name: 'Dubai (GST)', zone: 'Asia/Dubai' },
    { name: 'Singapore (SGT)', zone: 'Asia/Singapore' },
    { name: 'Hong Kong (HKT)', zone: 'Asia/Hong_Kong' },
    { name: 'Mumbai (IST)', zone: 'Asia/Kolkata' }
  ]

  const formatTime = (date, timeZone) => {
    return date.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date, timeZone) => {
    return date.toLocaleDateString('en-US', {
      timeZone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/orders', label: 'Orders', icon: '📦' },
    { path: '/place-order', label: 'Place Order', icon: '🛒' },
    { path: '/shipment-tracking', label: 'Shipment Tracking', icon: '🚚' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
    { path: '/inventory', label: 'Inventory', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/payment-processing', label: 'Payment Processing', icon: '💳' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/admin', label: 'Admin', icon: '👤' }
  ]

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <div className="user-section">
              <span className="user-info">Welcome, {currentUser?.username}</span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="header-center">
            <h1 className="app-title">Clipper</h1>
            <div className="nautical-flags">
              <div className="flag flag-c" title="C - Charlie"></div>
              <div className="flag flag-l" title="L - Lima"></div>
              <div className="flag flag-i" title="I - India"></div>
              <div className="flag flag-p" title="P - Papa"></div>
              <div className="flag flag-p" title="P - Papa"></div>
              <div className="flag flag-e" title="E - Echo"></div>
              <div className="flag flag-r" title="R - Romeo"></div>
            </div>
          </div>

          <div className="header-right">
            <div className="time-display">
              <div className="time">{formatTime(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}</div>
              <div className="date">{formatDate(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}</div>
            </div>
            <button 
              className="time-toggle-btn"
              onClick={() => setShowTimeZones(!showTimeZones)}
              title="Show all time zones"
            >
              🌐
            </button>
          </div>

          {showTimeZones && (
            <div className="timezone-dropdown">
              <div className="timezone-header">
                <h3>World Time Zones</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowTimeZones(false)}
                >
                  ×
                </button>
              </div>
              <div className="timezone-list">
                {timeZones.map((tz) => (
                  <div key={tz.zone} className="timezone-item">
                    <div className="timezone-name">{tz.name}</div>
                    <div className="timezone-details">
                      <div className="timezone-time">{formatTime(currentTime, tz.zone)}</div>
                      <div className="timezone-date">{formatDate(currentTime, tz.zone)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="app-body">
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
              {!sidebarCollapsed && <h2>Navigation</h2>}
              <button 
                className="toggle-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? '»' : '«'}
              </button>
            </div>
            
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  icon={item.icon}
                  label={item.label}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </nav>
          </aside>

          <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/shipment-tracking" element={<ShipmentTracking />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/payment-processing" element={<PaymentProcessing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

function NavLink({ to, icon, label, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link 
      to={to} 
      className={`nav-link ${isActive ? 'active' : ''}`}
      title={collapsed ? label : ''}
    >
      <span className="nav-icon">{icon}</span>
      {!collapsed && <span className="nav-label">{label}</span>}
    </Link>
  )
}

export default App
