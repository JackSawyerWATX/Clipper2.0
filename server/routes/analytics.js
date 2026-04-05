const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// GET dashboard summary â€” must be before parameterized routes
router.get('/dashboard/summary', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.ORDERS }));
    const orders = (result.Items || []).filter(o => (o.order_date || '').startsWith(currentYear));
    const total_revenue = orders.reduce((s, o) => s + (Number(o.grand_total) || 0), 0);
    const total_orders = orders.length;
    const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;
    res.json({ revenue: total_revenue, orders: total_orders, avg_order_value });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// GET sales data (yearly, quarterly, monthly)
router.get('/sales', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.ORDERS }));
    const allOrders = result.Items || [];
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 2;
    const filtered = allOrders.filter(o => {
      const y = parseInt((o.order_date || '').slice(0, 4));
      return y >= minYear && y <= currentYear;
    });

    // YTD (current year)
    const ytdOrders = filtered.filter(o => (o.order_date || '').startsWith(currentYear.toString()));
    const ytdRevenue = ytdOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);

    // Yearly
    const yearlyMap = {};
    filtered.forEach(o => {
      const y = (o.order_date || '').slice(0, 4);
      if (!yearlyMap[y]) yearlyMap[y] = { year: parseInt(y), revenue: 0, orders: 0 };
      yearlyMap[y].revenue += Number(o.total_amount) || 0;
      yearlyMap[y].orders += 1;
    });
    const yearly = Object.values(yearlyMap).sort((a, b) => b.year - a.year);

    // Quarterly
    const quarterlyMap = {};
    filtered.forEach(o => {
      const d = new Date(o.order_date || '');
      const y = d.getFullYear();
      const q = Math.floor(d.getMonth() / 3) + 1;
      const key = `${y}-Q${q}`;
      if (!quarterlyMap[key]) quarterlyMap[key] = { year: y, quarter: `Q${q}`, quarter_num: q, revenue: 0, orders: 0 };
      quarterlyMap[key].revenue += Number(o.total_amount) || 0;
      quarterlyMap[key].orders += 1;
    });
    const quarterly = Object.values(quarterlyMap).sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.quarter_num - a.quarter_num
    );

    // Monthly
    const monthlyMap = {};
    filtered.forEach(o => {
      const d = new Date(o.order_date || '');
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { year: y, month: MONTH_NAMES[m], month_num: m + 1, revenue: 0, orders: 0 };
      monthlyMap[key].revenue += Number(o.total_amount) || 0;
      monthlyMap[key].orders += 1;
    });
    const monthly = Object.values(monthlyMap).sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month_num - a.month_num
    );

    res.json({
      ytd: { revenue: ytdRevenue, orders: ytdOrders.length, avgOrder: ytdOrders.length > 0 ? ytdRevenue / ytdOrders.length : 0 },
      yearly, quarterly, monthly,
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// GET customer analytics
router.get('/customers', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const [customersResult, ordersResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.CUSTOMERS })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDERS })),
    ]);
    const customers = customersResult.Items || [];
    const orders = ordersResult.Items || [];

    const total = customers.length;
    const newCustomers = customers.filter(c => (c.created_at || '').startsWith(currentYear)).length;
    const lostCustomers = customers.filter(c =>
      c.status === 'Inactive' && (c.updated_at || '').startsWith(currentYear)
    ).length;
    const netGrowth = newCustomers - lostCustomers;
    const prevCount = customers.filter(c => !(c.created_at || '').startsWith(currentYear)).length;
    const growthRate = prevCount > 0 ? ((netGrowth / prevCount) * 100).toFixed(1) : (netGrowth > 0 ? 100 : 0);

    const ordersByCustomer = {};
    orders.forEach(o => {
      if (!ordersByCustomer[o.customer_id]) ordersByCustomer[o.customer_id] = { count: 0, revenue: 0 };
      ordersByCustomer[o.customer_id].count += 1;
      ordersByCustomer[o.customer_id].revenue += Number(o.grand_total) || 0;
    });

    const segmentData = {
      oneTime:   { count: 0, revenue: 0 },
      regular:   { count: 0, revenue: 0 },
      recurring: { count: 0, revenue: 0 },
    };
    customers.forEach(c => {
      const { count = 0, revenue = 0 } = ordersByCustomer[c.customer_id] || {};
      const seg = count === 1 ? 'oneTime' : count < 5 ? 'regular' : 'recurring';
      segmentData[seg].count += 1;
      segmentData[seg].revenue += revenue;
    });
    Object.keys(segmentData).forEach(k => {
      segmentData[k].percentage = total > 0 ? ((segmentData[k].count / total) * 100).toFixed(1) : '0';
    });

    res.json({ total, new: newCustomers, lost: lostCustomers, netGrowth, growthRate, segments: segmentData });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

// GET all analytics records
router.get('/', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.ANALYTICS }));
    const records = (result.Items || []).sort((a, b) => (b.metric_date || '').localeCompare(a.metric_date || ''));
    res.json(records);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET analytics by type
router.get('/type/:type', async (req, res) => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.ANALYTICS,
      KeyConditionExpression: 'metric_type = :t',
      ExpressionAttributeValues: { ':t': req.params.type },
      ScanIndexForward: false,
    }));
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET analytics by date range
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.ANALYTICS,
      FilterExpression: 'metric_date BETWEEN :s AND :e',
      ExpressionAttributeValues: { ':s': req.params.startDate, ':e': req.params.endDate },
    }));
    const records = (result.Items || []).sort((a, b) => (b.metric_date || '').localeCompare(a.metric_date || ''));
    res.json(records);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST create analytics record
router.post('/', async (req, res) => {
  try {
    const { metric_date, metric_type, metric_category, metric_value, metric_count, metric_label, metadata } = req.body;
    const analytics_id = uuidv4();
    const sort_key = `${metric_date}#${analytics_id}`;
    await docClient.send(new PutCommand({
      TableName: TABLES.ANALYTICS,
      Item: {
        metric_type, sort_key, analytics_id, metric_date,
        metric_category, metric_value: Number(metric_value) || 0,
        metric_count: Number(metric_count) || 0, metric_label,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      },
    }));
    res.status(201).json({ message: 'Analytics record created successfully', analytics_id });
  } catch (error) {
    console.error('Error creating analytics record:', error);
    res.status(500).json({ error: 'Failed to create analytics record' });
  }
});

module.exports = router;
