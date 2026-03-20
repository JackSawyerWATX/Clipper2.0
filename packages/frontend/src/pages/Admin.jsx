import { useState } from 'react'
import '../styles/Admin.css'

function Admin() {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      role: 'Administrator',
      email: 'admin@clipper.com',
      status: 'Active',
      permissions: ['dashboard', 'customers', 'orders', 'place-order', 'shipment-tracking', 'suppliers', 'inventory', 'analytics', 'payment-processing', 'reports', 'admin']
    },
    {
      id: 2,
      username: 'manager1',
      role: 'Manager',
      email: 'manager@clipper.com',
      status: 'Active',
      permissions: ['dashboard', 'customers', 'orders', 'place-order', 'shipment-tracking', 'inventory', 'analytics', 'reports']
    },
    {
      id: 3,
      username: 'employee1',
      role: 'Employee',
      email: 'employee@clipper.com',
      status: 'Active',
      permissions: ['dashboard', 'orders', 'place-order', 'inventory']
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'Employee',
    status: 'Active',
    permissions: []
  })

  const availablePages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'customers', label: 'Customers' },
    { id: 'orders', label: 'Orders' },
    { id: 'place-order', label: 'Place Order' },
    { id: 'shipment-tracking', label: 'Shipment Tracking' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'payment-processing', label: 'Payment Processing' },
    { id: 'reports', label: 'Reports' },
    { id: 'admin', label: 'Admin Management' }
  ]

  const roles = ['Administrator', 'Manager', 'Employee', 'Viewer']

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      email: '',
      role: 'Employee',
      status: 'Active',
      permissions: []
    })
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: [...user.permissions]
    })
    setShowModal(true)
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, id: u.id }
          : u
      ))
    } else {
      // Add new user
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formData
      }
      setUsers([...users, newUser])
    }
    
    setShowModal(false)
  }

  const handlePermissionToggle = (pageId) => {
    if (formData.permissions.includes(pageId)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== pageId)
      })
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, pageId]
      })
    }
  }

  const handleSelectAllPermissions = () => {
    if (formData.permissions.length === availablePages.length) {
      setFormData({ ...formData, permissions: [] })
    } else {
      setFormData({ ...formData, permissions: availablePages.map(p => p.id) })
    }
  }

  return (
    <div className="page admin-page">
      <h1>👤 Admin Management</h1>
      
      <div className="admin-header">
        <p>Manage user accounts, roles, and page access permissions</p>
        <button className="win31-btn primary" onClick={handleAddUser}>
          ➕ Add New User
        </button>
      </div>

      <div className="users-table-container">
        <table className="win31-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td><strong>{user.username}</strong></td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className="permission-count">
                    {user.permissions.length} / {availablePages.length} pages
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="win31-btn small"
                      onClick={() => handleEditUser(user)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="win31-btn small danger"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === 1}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="win31-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="permissions-section">
                <div className="permissions-header">
                  <label>Page Access Permissions</label>
                  <button 
                    type="button"
                    className="win31-btn small"
                    onClick={handleSelectAllPermissions}
                  >
                    {formData.permissions.length === availablePages.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="permissions-grid">
                  {availablePages.map(page => (
                    <label key={page.id} className="permission-item">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(page.id)}
                        onChange={() => handlePermissionToggle(page.id)}
                      />
                      <span>{page.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="win31-btn primary">
                  {editingUser ? '💾 Update User' : '➕ Create User'}
                </button>
                <button 
                  type="button" 
                  className="win31-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
