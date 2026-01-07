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
  // UTC-12
  { name: 'Baker Island (UTC-12)', zone: 'Etc/GMT+12' },
  // UTC-11
  { name: 'American Samoa (SST)', zone: 'Pacific/Pago_Pago' },
  { name: 'Midway Island (SST)', zone: 'Pacific/Midway' },
  // UTC-10
  { name: 'Honolulu (HST/HDT)', zone: 'Pacific/Honolulu' },
  // UTC-9
  { name: 'Juneau (AKST/AKDT)', zone: 'America/Anchorage' },
  { name: 'Marquesas (MART)', zone: 'Pacific/Marquesas' },
  // UTC-8
  { name: 'Los Angeles (PST/PDT)', zone: 'America/Los_Angeles' },
  { name: 'Baja California (PST/PDT)', zone: 'America/Tijuana' },
  // UTC-7
  { name: 'Denver (MST/MDT)', zone: 'America/Denver' },
  { name: 'Phoenix (MST)', zone: 'America/Phoenix' },
  { name: 'Mexico City (CST/CDT)', zone: 'America/Mexico_City' },
  // UTC-6
  { name: 'Chicago (CST/CDT)', zone: 'America/Chicago' },
  { name: 'Guatemala City (CST)', zone: 'America/Guatemala' },
  // UTC-5
  { name: 'New York (EST/EDT)', zone: 'America/New_York' },
  { name: 'Toronto (EST/EDT)', zone: 'America/Toronto' },
  { name: 'Lima (PET)', zone: 'America/Lima' },
  { name: 'Bogotá (COT)', zone: 'America/Bogota' },
  // UTC-4
  { name: 'Halifax (AST/ADT)', zone: 'America/Halifax' },
  { name: 'La Paz (BOT)', zone: 'America/La_Paz' },
  { name: 'Caracas (VET)', zone: 'America/Caracas' },
  { name: 'Manaus (AMT)', zone: 'America/Manaus' },
  // UTC-3:30
  { name: 'St. John\'s (NST/NDT)', zone: 'America/St_Johns' },
  // UTC-3
  { name: 'Buenos Aires (ART)', zone: 'America/Argentina/Buenos_Aires' },
  { name: 'Brasília (BRT/BRST)', zone: 'America/Sao_Paulo' },
  { name: 'Cayenne (GFT)', zone: 'America/Cayenne' },
  { name: 'Paramaribo (SRT)', zone: 'America/Paramaribo' },
  { name: 'Montevideo (UYT/UYST)', zone: 'America/Montevideo' },
  // UTC-2
  { name: 'South Georgia (GST)', zone: 'Atlantic/South_Georgia' },
  // UTC-1
  { name: 'Azores (AZOT/AZODT)', zone: 'Atlantic/Azores' },
  { name: 'Cape Verde (CVT)', zone: 'Atlantic/Cape_Verde' },
  // UTC+0
  { name: 'London (GMT/BST)', zone: 'Europe/London' },
  { name: 'Dublin (GMT/IST)', zone: 'Europe/Dublin' },
  { name: 'Lisbon (WET/WEST)', zone: 'Europe/Lisbon' },
  { name: 'Casablanca (WET/WEST)', zone: 'Africa/Casablanca' },
  { name: 'Accra (GMT)', zone: 'Africa/Accra' },
  // UTC+1
  { name: 'Paris (CET/CEST)', zone: 'Europe/Paris' },
  { name: 'Berlin (CET/CEST)', zone: 'Europe/Berlin' },
  { name: 'Lagos (WAT)', zone: 'Africa/Lagos' },
  { name: 'Cairo (EET/EEST)', zone: 'Africa/Cairo' },
  // UTC+2
  { name: 'Cairo (EET/EEST)', zone: 'Africa/Cairo' },
  { name: 'Helsinki (EET/EEST)', zone: 'Europe/Helsinki' },
  { name: 'Athens (EET/EEST)', zone: 'Europe/Athens' },
  { name: 'Istanbul (EET/EEST)', zone: 'Europe/Istanbul' },
  { name: 'Johannesburg (SAST)', zone: 'Africa/Johannesburg' },
  { name: 'Nairobi (EAT)', zone: 'Africa/Nairobi' },
  // UTC+3
  { name: 'Moscow (MSK)', zone: 'Europe/Moscow' },
  { name: 'Baghdad (AST)', zone: 'Asia/Baghdad' },
  { name: 'Dubai (GST)', zone: 'Asia/Dubai' },
  { name: 'Addis Ababa (EAT)', zone: 'Africa/Addis_Ababa' },
  // UTC+3:30
  { name: 'Tehran (IRST/IRDT)', zone: 'Asia/Tehran' },
  // UTC+4
  { name: 'Baku (AZT/AZST)', zone: 'Asia/Baku' },
  { name: 'Tbilisi (GET)', zone: 'Asia/Tbilisi' },
  // UTC+4:30
  { name: 'Kabul (AFT)', zone: 'Asia/Kabul' },
  // UTC+5
  { name: 'Tashkent (UZT)', zone: 'Asia/Tashkent' },
  { name: 'Karachi (PKT)', zone: 'Asia/Karachi' },
  // UTC+5:30
  { name: 'Mumbai (IST)', zone: 'Asia/Kolkata' },
  // UTC+5:45
  { name: 'Kathmandu (NPT)', zone: 'Asia/Kathmandu' },
  // UTC+6
  { name: 'Dhaka (BDT)', zone: 'Asia/Dhaka' },
  { name: 'Almaty (ALMT)', zone: 'Asia/Almaty' },
  // UTC+6:30
  { name: 'Myanmar (MMT)', zone: 'Asia/Yangon' },
  // UTC+7
  { name: 'Bangkok (ICT)', zone: 'Asia/Bangkok' },
  { name: 'Ho Chi Minh City (ICT)', zone: 'Asia/Ho_Chi_Minh' },
  { name: 'Jakarta (WIB)', zone: 'Asia/Jakarta' },
  { name: 'Bangkok (ICT)', zone: 'Asia/Bangkok' },
  // UTC+8
  { name: 'Singapore (SGT)', zone: 'Asia/Singapore' },
  { name: 'Hong Kong (HKT)', zone: 'Asia/Hong_Kong' },
  { name: 'Shanghai (CST)', zone: 'Asia/Shanghai' },
  { name: 'Manila (PHT)', zone: 'Asia/Manila' },
  { name: 'Kuala Lumpur (MYT)', zone: 'Asia/Kuala_Lumpur' },
  { name: 'Taipei (CST)', zone: 'Asia/Taipei' },
  { name: 'Perth (AWST)', zone: 'Australia/Perth' },
  // UTC+9
  { name: 'Tokyo (JST)', zone: 'Asia/Tokyo' },
  { name: 'Seoul (KST)', zone: 'Asia/Seoul' },
  { name: 'Pyongyang (KST)', zone: 'Asia/Pyongyang' },
  // UTC+10
  { name: 'Sydney (AEST/AEDT)', zone: 'Australia/Sydney' },
  { name: 'Melbourne (AEST/AEDT)', zone: 'Australia/Melbourne' },
  { name: 'Brisbane (AEST)', zone: 'Australia/Brisbane' },
  { name: 'Guam (ChST)', zone: 'Pacific/Guam' },
  // UTC+11
  { name: 'Solomon Islands (SBT)', zone: 'Pacific/Guadalcanal' },
  { name: 'Norfolk Island (NFT)', zone: 'Pacific/Norfolk' },
  // UTC+12
  { name: 'Fiji (FJT/FJDT)', zone: 'Pacific/Fiji' },
  { name: 'New Zealand (NZST/NZDT)', zone: 'Pacific/Auckland' },
  // UTC+13
  { name: 'Tonga (TOT)', zone: 'Pacific/Tongatapu' },
  // UTC+14
  { name: 'Kiribati (LINT)', zone: 'Pacific/Kiritimati' }
];

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
    { path: '/shipment-tracking', label: 'Shipment Tracking', icon: '🚚' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
    { path: '/inventory', label: 'Inventory', icon: '📋' },
    { path: '/place-order', label: 'Place Order', icon: '🛒' },
    { path: '/payment-processing', label: 'Payment Processing', icon: '💳' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
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
