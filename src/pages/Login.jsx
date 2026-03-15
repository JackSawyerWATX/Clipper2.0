import { useState } from 'react'
import '../styles/Login.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://clipper-backend-prod.eba-cg2igaaf.us-west-2.elasticbeanstalk.com';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Call onLogin with user data
      onLogin({
        username: data.user.username,
        role: data.user.role,
        permissions: data.user.permissions || [],
        user_id: data.user.user_id,
        email: data.user.email
      })

    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Clipper 2.0</h1>
            <p className="login-subtitle">Business Management System</p>
          </div>

          <div className="welcome-section">
            <h2>Welcome</h2>
            <p>
              Clipper is your comprehensive business management solution designed to streamline 
              operations across all aspects of your organization. From customer relationship 
              management and order processing to inventory tracking and financial analytics, 
              Clipper provides the tools you need to manage your business efficiently.
            </p>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Customer Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Order Processing</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Analytics & Reports</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Payment Processing</span>
              </div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <h3>Sign In</h3>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="login-footer">
              <p className="help-text">
                Access is granted by system administrators with role-based permissions
              </p>
            </div>
          </form>
        </div>

        <div className="login-info">
          <p>&copy; 2025 Clipper. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
