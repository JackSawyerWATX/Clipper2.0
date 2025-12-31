const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

// Load environment variables from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Import routes
const customersRoutes = require('./routes/customers');
const ordersRoutes = require('./routes/orders');
const suppliersRoutes = require('./routes/suppliers');
const inventoryRoutes = require('./routes/inventory');
const customerOrdersRoutes = require('./routes/customerOrders');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');
const shipmentsRoutes = require('./routes/shipments');
const paymentsRoutes = require('./routes/payments');

// API Routes
app.use('/api/customers', customersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customer-orders', customerOrdersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/payments', paymentsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clipper API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Clipper 2.0 API Server',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      orders: '/api/orders',
      suppliers: '/api/suppliers',
      inventory: '/api/inventory',
      customerOrders: '/api/customer-orders',
      analytics: '/api/analytics',
      users: '/api/users',
      shipments: '/api/shipments',
      payments: '/api/payments'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API documentation available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
