const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all analytics records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM past_analytics ORDER BY metric_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET analytics by type
router.get('/type/:type', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM past_analytics WHERE metric_type = ? ORDER BY metric_date DESC',
      [req.params.type]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET analytics by date range
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM past_analytics 
       WHERE metric_date BETWEEN ? AND ? 
       ORDER BY metric_date DESC`,
      [req.params.startDate, req.params.endDate]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST create analytics record
router.post('/', async (req, res) => {
  try {
    const {
      metric_date, metric_type, metric_category, metric_value,
      metric_count, metric_label, metadata
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO past_analytics 
       (metric_date, metric_type, metric_category, metric_value, metric_count, metric_label, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [metric_date, metric_type, metric_category, metric_value, metric_count, metric_label, 
       metadata ? JSON.stringify(metadata) : null]
    );

    res.status(201).json({ 
      message: 'Analytics record created successfully',
      analytics_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating analytics record:', error);
    res.status(500).json({ error: 'Failed to create analytics record' });
  }
});

// GET dashboard summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const [revenue] = await pool.query(`
      SELECT COALESCE(SUM(grand_total), 0) as total_revenue
      FROM orders 
      WHERE YEAR(order_date) = YEAR(CURRENT_DATE)
    `);

    const [orderCount] = await pool.query(`
      SELECT COUNT(*) as total_orders
      FROM orders 
      WHERE YEAR(order_date) = YEAR(CURRENT_DATE)
    `);

    const [avgOrder] = await pool.query(`
      SELECT COALESCE(AVG(grand_total), 0) as avg_order_value
      FROM orders 
      WHERE YEAR(order_date) = YEAR(CURRENT_DATE)
    `);

    res.json({
      revenue: revenue[0].total_revenue,
      orders: orderCount[0].total_orders,
      avg_order_value: avgOrder[0].avg_order_value
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;
