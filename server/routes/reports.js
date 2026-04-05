const express = require('express');
const router = express.Router();
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function applyDateFilter(orders, dateRange, startDate, endDate) {
  if (startDate && endDate) {
    return orders.filter(o => (o.order_date || '') >= startDate && (o.order_date || '') <= endDate);
  }
  const now = new Date();
  if (dateRange === 'ytd') {
    return orders.filter(o => (o.order_date || '').startsWith(now.getFullYear().toString()));
  }
  if (dateRange === 'annual') {
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return orders.filter(o => (o.order_date || '') >= cutoff.toISOString().split('T')[0]);
  }
  if (dateRange === 'monthly') {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 1);
    return orders.filter(o => (o.order_date || '') >= cutoff.toISOString().split('T')[0]);
  }
  return orders;
}

// GET all customers for report selection
router.get('/customers-list', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      FilterExpression: '#s = :active',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':active': 'Active' },
    }));
    const customers = (result.Items || [])
      .map(c => ({ customer_id: c.customer_id, company_name: c.company_name, email: c.email }))
      .sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers list:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET vendors/suppliers list for report selection
router.get('/vendors-list', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.SUPPLIERS,
      FilterExpression: '#s = :active',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':active': 'Active' },
    }));
    const vendors = (result.Items || [])
      .map(s => ({ supplier_id: s.supplier_id, company_name: s.company_name }))
      .sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors list:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET inventory sales report
router.get('/inventory-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [inventoryResult, orderItemsResult, ordersResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.INVENTORY })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDER_ITEMS })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDERS })),
    ]);

    let orders = ordersResult.Items || [];
    if (startDate && endDate) {
      orders = orders.filter(o => (o.order_date || '') >= startDate && (o.order_date || '') <= endDate);
    }
    const validOrderIds = new Set(orders.map(o => o.order_id));
    const orderItems = (orderItemsResult.Items || []).filter(oi => validOrderIds.has(oi.order_id));

    const itemStats = {};
    orderItems.forEach(oi => {
      if (!itemStats[oi.item_id]) itemStats[oi.item_id] = { total_sold: 0, total_revenue: 0, orderIds: new Set(), prices: [] };
      itemStats[oi.item_id].total_sold += Number(oi.quantity) || 0;
      itemStats[oi.item_id].total_revenue += Number(oi.subtotal) || 0;
      itemStats[oi.item_id].orderIds.add(oi.order_id);
      if (oi.unit_price) itemStats[oi.item_id].prices.push(Number(oi.unit_price));
    });

    const inventory = (inventoryResult.Items || []).map(i => {
      const stats = itemStats[i.item_id] || { total_sold: 0, total_revenue: 0, orderIds: new Set(), prices: [] };
      return {
        item_id: i.item_id, part_number: i.part_number, item_name: i.name,
        category: i.category, manufacturer: i.manufacturer, current_stock: i.quantity,
        total_sold: stats.total_sold, total_revenue: stats.total_revenue,
        order_count: stats.orderIds.size,
        avg_price: stats.prices.length > 0 ? stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length : 0,
      };
    }).sort((a, b) => b.total_revenue - a.total_revenue);

    const summary = inventory.reduce((acc, item) => ({
      totalRevenue: acc.totalRevenue + item.total_revenue,
      totalSold: acc.totalSold + item.total_sold,
      totalOrders: acc.totalOrders + item.order_count,
    }), { totalRevenue: 0, totalSold: 0, totalOrders: 0 });

    res.json({ inventory, summary, reportGeneratedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error generating inventory sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET company sales report
router.get('/company-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.ORDERS }));
    let orders = result.Items || [];
    if (startDate && endDate) {
      orders = orders.filter(o => (o.order_date || '') >= startDate && (o.order_date || '') <= endDate);
    }

    const total_revenue = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    const total_tax = orders.reduce((s, o) => s + (Number(o.tax_amount) || 0), 0);
    const orderDates = orders.map(o => o.order_date).filter(Boolean).sort();
    const summary = {
      total_orders: orders.length, total_revenue, total_tax,
      avg_order: orders.length > 0 ? total_revenue / orders.length : 0,
      period_start: orderDates[0] || null,
      period_end: orderDates[orderDates.length - 1] || null,
    };

    const monthlyMap = {};
    orders.forEach(o => {
      const d = new Date(o.order_date || '');
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { year: y, month: m + 1, month_name: MONTH_NAMES[m], orders: 0, revenue: 0 };
      monthlyMap[key].orders += 1;
      monthlyMap[key].revenue += Number(o.total_amount) || 0;
    });
    const monthly = Object.values(monthlyMap).sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month - a.month
    );

    const statusMap = {};
    orders.forEach(o => {
      const s = o.status || 'Unknown';
      if (!statusMap[s]) statusMap[s] = { status: s, count: 0, revenue: 0 };
      statusMap[s].count += 1;
      statusMap[s].revenue += Number(o.total_amount) || 0;
    });

    const paymentMap = {};
    orders.forEach(o => {
      const pm = o.payment_method || 'Unknown';
      if (!paymentMap[pm]) paymentMap[pm] = { payment_method: pm, count: 0, revenue: 0 };
      paymentMap[pm].count += 1;
      paymentMap[pm].revenue += Number(o.total_amount) || 0;
    });

    res.json({
      summary, monthly,
      statusBreakdown: Object.values(statusMap),
      paymentMethods: Object.values(paymentMap),
      reportGeneratedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating company sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET customer purchase report
router.get('/customer-purchases/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { dateRange, startDate, endDate } = req.query;

    const [customerResult, allOrdersResult, orderItemsResult, inventoryResult] = await Promise.all([
      docClient.send(new GetCommand({ TableName: TABLES.CUSTOMERS, Key: { customer_id: customerId } })),
      docClient.send(new QueryCommand({
        TableName: TABLES.ORDERS,
        IndexName: 'customer-index',
        KeyConditionExpression: 'customer_id = :cid',
        ExpressionAttributeValues: { ':cid': customerId },
      })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDER_ITEMS })),
      docClient.send(new ScanCommand({ TableName: TABLES.INVENTORY })),
    ]);

    if (!customerResult.Item) return res.status(404).json({ error: 'Customer not found' });

    const filteredOrders = applyDateFilter(allOrdersResult.Items || [], dateRange, startDate, endDate);
    const orderIdSet = new Set(filteredOrders.map(o => o.order_id));
    const orderItemsForCustomer = (orderItemsResult.Items || []).filter(oi => orderIdSet.has(oi.order_id));
    const invMap = Object.fromEntries((inventoryResult.Items || []).map(i => [i.item_id, i]));

    const itemCountByOrder = {};
    orderItemsForCustomer.forEach(oi => {
      itemCountByOrder[oi.order_id] = (itemCountByOrder[oi.order_id] || 0) + 1;
    });

    const orders = filteredOrders.map(o => ({
      order_id: o.order_id, order_number: o.order_number, order_date: o.order_date,
      status: o.status, total_amount: o.total_amount, grand_total: o.grand_total,
      payment_method: o.payment_method, item_count: itemCountByOrder[o.order_id] || 0,
    })).sort((a, b) => (b.order_date || '').localeCompare(a.order_date || ''));

    const total_spent = filteredOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
    const orderDates = filteredOrders.map(o => o.order_date).filter(Boolean).sort();
    const summary = {
      total_orders: filteredOrders.length, total_spent,
      avg_order: filteredOrders.length > 0 ? total_spent / filteredOrders.length : 0,
      first_order: orderDates[0] || null,
      last_order: orderDates[orderDates.length - 1] || null,
    };

    const categoryMap = {};
    orderItemsForCustomer.forEach(oi => {
      const inv = invMap[oi.item_id];
      if (!inv) return;
      const cat = inv.category || 'Unknown';
      if (!categoryMap[cat]) categoryMap[cat] = { category: cat, order_count: 0, total_quantity: 0, category_revenue: 0, orderIds: new Set() };
      categoryMap[cat].orderIds.add(oi.order_id);
      categoryMap[cat].total_quantity += Number(oi.quantity) || 0;
      categoryMap[cat].category_revenue += Number(oi.subtotal) || 0;
    });
    const categories = Object.values(categoryMap)
      .map(c => ({ category: c.category, order_count: c.orderIds.size, total_quantity: c.total_quantity, category_revenue: c.category_revenue }))
      .sort((a, b) => b.category_revenue - a.category_revenue);

    res.json({
      customer: customerResult.Item, orders, summary, categories,
      dateRange: dateRange || 'custom',
      reportGeneratedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating customer purchase report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET vendor inventory report
router.get('/vendor-inventory/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const [vendorResult, inventoryResult] = await Promise.all([
      docClient.send(new GetCommand({ TableName: TABLES.SUPPLIERS, Key: { supplier_id: vendorId } })),
      docClient.send(new ScanCommand({
        TableName: TABLES.INVENTORY,
        FilterExpression: 'supplier_id = :sid',
        ExpressionAttributeValues: { ':sid': vendorId },
      })),
    ]);

    if (!vendorResult.Item) return res.status(404).json({ error: 'Vendor not found' });

    const inventory = (inventoryResult.Items || []).map(i => {
      let stock_status;
      if (Number(i.quantity) <= 0) stock_status = 'Out of Stock';
      else if (Number(i.quantity) <= Number(i.min_quantity)) stock_status = 'Low Stock';
      else stock_status = 'In Stock';
      return { ...i, stock_status };
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const summary = {
      total_items: inventory.length,
      in_stock: inventory.filter(i => i.stock_status === 'In Stock').length,
      low_stock: inventory.filter(i => i.stock_status === 'Low Stock').length,
      out_of_stock: inventory.filter(i => i.stock_status === 'Out of Stock').length,
      total_inventory_value: inventory.reduce((s, i) => s + (Number(i.quantity) * Number(i.price_per_unit) || 0), 0),
    };

    res.json({ vendor: vendorResult.Item, inventory, summary, reportGeneratedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error generating vendor inventory report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
