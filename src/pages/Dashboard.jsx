import React from 'react'

function Dashboard() {
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

  return (
    <div className="page" style={styles.dashboardPage}>
      <div style={styles.windowHeader}>
        <span style={styles.windowTitle}>Dashboard</span>
      </div>
      
      <div style={styles.windowContent}>
        <p style={styles.subtitle}>View topical information at a glance</p>
        
        <div style={styles.dashboardGrid}>
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Total Items</div>
            <div style={styles.panelContent}>
              <div style={styles.displayValue}>0</div>
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Recent Activity</div>
            <div style={styles.panelContent}>
              <div style={styles.displayValue}>0</div>
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Status</div>
            <div style={styles.panelContent}>
              <div style={styles.statusActive}>Active</div>
            </div>
          </div>
          
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Quick Stats</div>
            <div style={styles.panelContent}>
              <div style={styles.displayValue}>--</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
