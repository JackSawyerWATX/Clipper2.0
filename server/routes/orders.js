const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const [ordersResult, customersResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.ORDERS })),
      docClient.send(new ScanCommand({ TableName: TABLES.CUSTOMERS })),
    ]);
    const customerMap = Object.fromEntries(
      (customersResult.Items || []).map(c => [c.customer_id, { company_name: c.company_name, email: c.email }])
    );
    const orders = (ordersResult.Items || []).map(o => ({
      ...o,
      customer_name: customerMap[o.customer_id]?.company_name || null,
      customer_email: customerMap[o.customer_id]?.email || null,
    })).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.ORDERS,
      Key: { order_id: req.params.id },
    }));
    if (!result.Item) return res.status(404).json({ error: 'Order not found' });
    if (result.Item.customer_id) {
      const custResult = await docClient.send(new GetCommand({
        TableName: TABLES.CUSTOMERS,
        Key: { customer_id: result.Item.customer_id },
      }));
      result.Item.customer_name = custResult.Item?.company_name || null;
      result.Item.customer_email = custResult.Item?.email || null;
    }
    res.json(result.Item);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  try {
    const {
      order_number, customer_id, order_date, status, total_amount,
      tax_amount, grand_total, payment_status, payment_method,
      shipping_address_street, shipping_address_city, shipping_address_state,
      shipping_address_zip, shipping_address_country, notes
    } = req.body;
    const now = new Date().toISOString();
    const order_id = uuidv4();
    await docClient.send(new PutCommand({
      TableName: TABLES.ORDERS,
      Item: {
        order_id,
        order_number: order_number || `ORD-${Date.now()}`,
        customer_id, order_date, status: status || 'Pending',
        total_amount: Number(total_amount) || 0,
        tax_amount: Number(tax_amount) || 0,
        grand_total: Number(grand_total) || 0,
        payment_status: payment_status || 'Pending',
        payment_method,
        shipping_address_street, shipping_address_city, shipping_address_state,
        shipping_address_zip, shipping_address_country, notes,
        created_at: now, updated_at: now,
      },
    }));
    res.status(201).json({ message: 'Order created successfully', order_id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order
router.put('/:id', async (req, res) => {
  try {
    const { status, payment_status, tracking_number, carrier, notes } = req.body;
    await docClient.send(new UpdateCommand({
      TableName: TABLES.ORDERS,
      Key: { order_id: req.params.id },
      UpdateExpression: 'SET #st=:s, payment_status=:ps, tracking_number=:tn, carrier=:c, notes=:n, updated_at=:ua',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':s': status, ':ps': payment_status, ':tn': tracking_number,
        ':c': carrier, ':n': notes, ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(order_id)',
    }));
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Order not found' });
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.ORDERS,
      Key: { order_id: req.params.id },
      ConditionExpression: 'attribute_exists(order_id)',
    }));
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Order not found' });
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
