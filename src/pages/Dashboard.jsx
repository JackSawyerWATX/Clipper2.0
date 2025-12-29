import React from 'react'

function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>View topical information at a glance</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Total Items</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#212529' }}>0</p>
        </div>
        
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Recent Activity</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#212529' }}>0</p>
        </div>
        
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Status</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>Active</p>
        </div>
        
        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Quick Stats</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#212529' }}>--</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
