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

// GET sales data (yearly, quarterly, monthly)
router.get('/sales', async (req, res) => {
  try {
    // YTD Summary (2025 - most recent year with data)
    const [ytd] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders,
        COALESCE(AVG(total_amount), 0) as avgOrder
      FROM orders 
      WHERE YEAR(order_date) = 2025
    `);

    // Yearly data (last 3 years - 2023, 2024, 2025)
    const [yearly] = await pool.query(`
      SELECT 
        YEAR(order_date) as year,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE YEAR(order_date) >= 2023 AND YEAR(order_date) <= 2025
      GROUP BY YEAR(order_date)
      ORDER BY year DESC
    `);

    // Quarterly data (last 3 years)
    const [quarterly] = await pool.query(`
      SELECT 
        YEAR(order_date) as year,
        CONCAT('Q', QUARTER(order_date)) as quarter,
        QUARTER(order_date) as quarter_num,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE YEAR(order_date) >= 2023 AND YEAR(order_date) <= 2025
      GROUP BY YEAR(order_date), QUARTER(order_date), CONCAT('Q', QUARTER(order_date))
      ORDER BY year DESC, quarter_num DESC
    `);

    // Monthly data (last 3 years)
    const [monthly] = await pool.query(`
      SELECT 
        YEAR(order_date) as year,
        DATE_FORMAT(order_date, '%b') as month,
        MONTH(order_date) as month_num,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE YEAR(order_date) >= 2023 AND YEAR(order_date) <= 2025
      GROUP BY YEAR(order_date), MONTH(order_date), DATE_FORMAT(order_date, '%b')
      ORDER BY year DESC, month_num DESC
    `);

    res.json({
      ytd: {
        revenue: ytd[0].revenue,
        orders: ytd[0].orders,
        avgOrder: ytd[0].avgOrder
      },
      yearly: yearly,
      quarterly: quarterly,
      monthly: monthly
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// GET customer analytics
router.get('/customers', async (req, res) => {
  try {
    // Total customers
    const [total] = await pool.query('SELECT COUNT(*) as count FROM customers');
    
    // Customer growth (2025 - most recent year with data)
    // Calculate realistic growth: simulate new customers and some churn
    const [growth] = await pool.query(`
      SELECT 
        SUM(CASE WHEN YEAR(created_at) = 2025 THEN 1 ELSE 0 END) as new_customers,
        SUM(CASE WHEN status = 'Inactive' AND YEAR(updated_at) = 2025 THEN 1 ELSE 0 END) as lost_customers
      FROM customers
    `);
    
    // Get previous year customer count for growth rate calculation
    const [previousYear] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM customers 
      WHERE YEAR(created_at) < 2025
    `);

    // Customer segments by order count
    const [segments] = await pool.query(`
      SELECT 
        CASE 
          WHEN order_count = 1 THEN 'oneTime'
          WHEN order_count > 1 AND order_count < 5 THEN 'regular'
          ELSE 'recurring'
        END as segment,
        COUNT(*) as count,
        SUM(total_revenue) as revenue
      FROM (
        SELECT 
          c.customer_id,
          COUNT(o.order_id) as order_count,
          COALESCE(SUM(o.grand_total), 0) as total_revenue
        FROM customers c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        GROUP BY c.customer_id
      ) as customer_orders
      GROUP BY segment
    `);

    const newCustomers = growth[0].new_customers || 0;
    const lostCustomers = growth[0].lost_customers || 0;
    const netGrowth = newCustomers - lostCustomers;
    
    // Calculate growth rate based on previous year base
    const prevYearCount = previousYear[0].count || 0;
    const growthRate = prevYearCount > 0 
      ? ((netGrowth / prevYearCount) * 100).toFixed(1) 
      : (netGrowth > 0 ? 100 : 0);

    // Format segments
    const segmentData = {
      oneTime: { count: 0, revenue: 0 },
      regular: { count: 0, revenue: 0 },
      recurring: { count: 0, revenue: 0 }
    };

    segments.forEach(seg => {
      segmentData[seg.segment] = {
        count: seg.count,
        revenue: seg.revenue,
        percentage: ((seg.count / total[0].count) * 100).toFixed(1)
      };
    });

    res.json({
      total: total[0].count,
      new: newCustomers,
      lost: lostCustomers,
      netGrowth: netGrowth,
      growthRate: growthRate,
      segments: segmentData
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

module.exports = router;
