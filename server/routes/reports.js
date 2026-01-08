const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET customer purchase report data
router.get('/customer-purchases/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { dateRange, startDate, endDate } = req.query;

    // Get customer details
    const [customer] = await pool.query(
      'SELECT * FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Build date filter
    let dateFilter = '';
    let params = [customerId];

    if (startDate && endDate) {
      dateFilter = 'AND o.order_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (dateRange === 'ytd') {
      dateFilter = 'AND YEAR(o.order_date) = YEAR(CURRENT_DATE)';
    } else if (dateRange === 'annual') {
      dateFilter = 'AND o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)';
    } else if (dateRange === 'monthly') {
      dateFilter = 'AND o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)';
    }

    // Get purchase history
    const [orders] = await pool.query(`
      SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        o.status,
        o.total_amount,
        o.grand_total,
        o.payment_method,
        COUNT(co.item_id) as item_count
      FROM orders o
      LEFT JOIN customer_orders co ON o.order_id = co.order_id
      WHERE o.customer_id = ? ${dateFilter}
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
    `, params);

    // Calculate summary statistics
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as avg_order,
        MIN(o.order_date) as first_order,
        MAX(o.order_date) as last_order
      FROM orders o
      WHERE o.customer_id = ? ${dateFilter}
    `, params);

    // Get category breakdown
    const [categories] = await pool.query(`
      SELECT 
        i.category,
        COUNT(DISTINCT o.order_id) as order_count,
        SUM(co.quantity) as total_quantity,
        COALESCE(SUM(co.subtotal), 0) as category_revenue
      FROM orders o
      JOIN customer_orders co ON o.order_id = co.order_id
      JOIN inventory i ON co.item_id = i.item_id
      WHERE o.customer_id = ? ${dateFilter}
      GROUP BY i.category
      ORDER BY category_revenue DESC
    `, params);

    res.json({
      customer: customer[0],
      orders: orders,
      summary: summary[0],
      categories: categories,
      dateRange: dateRange || 'custom',
      reportGeneratedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating customer purchase report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET all customers for report selection
router.get('/customers-list', async (req, res) => {
  try {
    const [customers] = await pool.query(
      'SELECT customer_id, company_name, email FROM customers WHERE status = "Active" ORDER BY company_name'
    );
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers list:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET inventory sales report
router.get('/inventory-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE o.order_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [inventory] = await pool.query(`
      SELECT 
        i.item_id,
        i.part_number,
        i.name as item_name,
        i.category,
        i.manufacturer,
        i.quantity as current_stock,
        COALESCE(SUM(co.quantity), 0) as total_sold,
        COALESCE(SUM(co.subtotal), 0) as total_revenue,
        COUNT(DISTINCT o.order_id) as order_count,
        COALESCE(AVG(co.unit_price), 0) as avg_price
      FROM inventory i
      LEFT JOIN customer_orders co ON i.item_id = co.item_id
      LEFT JOIN orders o ON co.order_id = o.order_id ${dateFilter}
      GROUP BY i.item_id
      ORDER BY total_revenue DESC
    `, params);

    // Calculate summary
    const totals = inventory.reduce((acc, item) => ({
      totalRevenue: acc.totalRevenue + parseFloat(item.total_revenue),
      totalSold: acc.totalSold + parseInt(item.total_sold),
      totalOrders: acc.totalOrders + parseInt(item.order_count)
    }), { totalRevenue: 0, totalSold: 0, totalOrders: 0 });

    res.json({
      inventory: inventory,
      summary: totals,
      reportGeneratedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating inventory sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET company sales report
router.get('/company-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE order_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Overall summary
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(AVG(total_amount), 0) as avg_order,
        MIN(order_date) as period_start,
        MAX(order_date) as period_end
      FROM orders
      ${dateFilter}
    `, params);

    // Monthly breakdown
    const [monthly] = await pool.query(`
      SELECT 
        YEAR(order_date) as year,
        MONTH(order_date) as month,
        MONTHNAME(order_date) as month_name,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      ${dateFilter}
      GROUP BY YEAR(order_date), MONTH(order_date)
      ORDER BY year DESC, month DESC
    `, params);

    // Status breakdown
    const [statusBreakdown] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      ${dateFilter}
      GROUP BY status
    `, params);

    // Payment method breakdown
    const [paymentMethods] = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      ${dateFilter}
      GROUP BY payment_method
    `, params);

    res.json({
      summary: summary[0],
      monthly: monthly,
      statusBreakdown: statusBreakdown,
      paymentMethods: paymentMethods,
      reportGeneratedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating company sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET vendors/suppliers list for report selection
router.get('/vendors-list', async (req, res) => {
  try {
    const [vendors] = await pool.query(
      'SELECT supplier_id, company_name FROM suppliers WHERE status = "Active" ORDER BY company_name'
    );
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors list:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET vendor inventory report
router.get('/vendor-inventory/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Get vendor details
    const [vendor] = await pool.query(
      'SELECT * FROM suppliers WHERE supplier_id = ?',
      [vendorId]
    );

    if (vendor.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get inventory from this vendor
    const [inventory] = await pool.query(`
      SELECT 
        i.item_id,
        i.part_number,
        i.name,
        i.category,
        i.manufacturer,
        i.quantity as stock_level,
        i.min_quantity,
        i.price_per_unit,
        i.status,
        CASE 
          WHEN i.quantity <= 0 THEN 'Out of Stock'
          WHEN i.quantity <= i.min_quantity THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM inventory i
      WHERE i.supplier_id = ?
      ORDER BY i.name
    `, [vendorId]);

    // Calculate summary
    const summary = {
      total_items: inventory.length,
      in_stock: inventory.filter(i => i.stock_status === 'In Stock').length,
      low_stock: inventory.filter(i => i.stock_status === 'Low Stock').length,
      out_of_stock: inventory.filter(i => i.stock_status === 'Out of Stock').length,
      total_inventory_value: inventory.reduce((sum, i) => sum + (i.stock_level * i.price_per_unit), 0)
    };

    res.json({
      vendor: vendor[0],
      inventory: inventory,
      summary: summary,
      reportGeneratedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating vendor inventory report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
