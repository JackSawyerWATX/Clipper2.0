const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// GET all order items
router.get('/', async (req, res) => {
  try {
    const [itemsResult, invResult, ordersResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.ORDER_ITEMS })),
      docClient.send(new ScanCommand({ TableName: TABLES.INVENTORY })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDERS })),
    ]);
    const invMap = Object.fromEntries((invResult.Items || []).map(i => [i.item_id, { name: i.name, part_number: i.part_number }]));
    const orderMap = Object.fromEntries((ordersResult.Items || []).map(o => [o.order_id, o.order_number]));
    const items = (itemsResult.Items || []).map(oi => ({
      ...oi,
      item_name: invMap[oi.item_id]?.name || null,
      part_number: invMap[oi.item_id]?.part_number || null,
      order_number: orderMap[oi.order_id] || null,
    })).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// GET order items by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const [itemsResult, invResult] = await Promise.all([
      docClient.send(new QueryCommand({
        TableName: TABLES.ORDER_ITEMS,
        KeyConditionExpression: 'order_id = :oid',
        ExpressionAttributeValues: { ':oid': req.params.orderId },
      })),
      docClient.send(new ScanCommand({ TableName: TABLES.INVENTORY })),
    ]);
    const invMap = Object.fromEntries((invResult.Items || []).map(i => [i.item_id, { name: i.name, part_number: i.part_number, manufacturer: i.manufacturer }]));
    const items = (itemsResult.Items || []).map(oi => ({
      ...oi,
      item_name: invMap[oi.item_id]?.name || null,
      part_number: invMap[oi.item_id]?.part_number || null,
      manufacturer: invMap[oi.item_id]?.manufacturer || null,
    }));
    res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// POST add item to order
router.post('/', async (req, res) => {
  try {
    const { order_id, item_id, quantity, unit_price, notes } = req.body;
    const subtotal = Number(quantity) * Number(unit_price);
    const now = new Date().toISOString();
    const order_item_id = uuidv4();
    await docClient.send(new PutCommand({
      TableName: TABLES.ORDER_ITEMS,
      Item: {
        order_id, order_item_id, item_id,
        quantity: Number(quantity), unit_price: Number(unit_price), subtotal, notes,
        created_at: now, updated_at: now,
      },
    }));
    res.status(201).json({ message: 'Order item added successfully', order_item_id });
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(500).json({ error: 'Failed to add order item' });
  }
});

// PUT update order item
router.put('/:id', async (req, res) => {
  try {
    const { order_id, quantity, unit_price, notes } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required for update' });
    const subtotal = Number(quantity) * Number(unit_price);
    await docClient.send(new UpdateCommand({
      TableName: TABLES.ORDER_ITEMS,
      Key: { order_id, order_item_id: req.params.id },
      UpdateExpression: 'SET quantity=:q, unit_price=:up, subtotal=:sub, notes=:n, updated_at=:ua',
      ExpressionAttributeValues: {
        ':q': Number(quantity), ':up': Number(unit_price), ':sub': subtotal,
        ':n': notes, ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(order_item_id)',
    }));
    res.json({ message: 'Order item updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Order item not found' });
    console.error('Error updating order item:', error);
    res.status(500).json({ error: 'Failed to update order item' });
  }
});

// DELETE order item
router.delete('/:id', async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id is required for delete' });
    await docClient.send(new DeleteCommand({
      TableName: TABLES.ORDER_ITEMS,
      Key: { order_id, order_item_id: req.params.id },
      ConditionExpression: 'attribute_exists(order_item_id)',
    }));
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Order item not found' });
    console.error('Error deleting order item:', error);
    res.status(500).json({ error: 'Failed to delete order item' });
  }
});

module.exports = router;
