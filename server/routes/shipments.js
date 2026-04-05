const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// GET all shipments
router.get('/', async (req, res) => {
  try {
    const [shipmentsResult, ordersResult, customersResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.SHIPMENTS })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDERS })),
      docClient.send(new ScanCommand({ TableName: TABLES.CUSTOMERS })),
    ]);
    const orderMap = Object.fromEntries((ordersResult.Items || []).map(o => [o.order_id, o]));
    const customerMap = Object.fromEntries((customersResult.Items || []).map(c => [c.customer_id, c.company_name]));
    const shipments = (shipmentsResult.Items || []).map(s => {
      const order = orderMap[s.order_id] || {};
      return {
        ...s,
        order_number: order.order_number || null,
        customer_name: customerMap[order.customer_id] || null,
      };
    }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// GET single shipment
router.get('/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.SHIPMENTS,
      Key: { shipment_id: req.params.id },
    }));
    if (!result.Item) return res.status(404).json({ error: 'Shipment not found' });
    res.json(result.Item);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// POST create shipment
router.post('/', async (req, res) => {
  try {
    const {
      customer_id, carrier, status, shipped_date,
      estimated_delivery, from_location, to_location, notes
    } = req.body;

    // Generate order number
    const ordersResult = await docClient.send(new ScanCommand({ TableName: TABLES.ORDERS }));
    const maxOrderNum = (ordersResult.Items || []).reduce((max, o) => {
      const num = parseInt((o.order_number || '').replace(/\D/g, '')) || 0;
      return num > max ? num : max;
    }, 1000);
    const orderNumber = `ORD-${maxOrderNum + 1}`;

    // Generate tracking number
    const carrierPrefixes = { FedEx: 'FDX', UPS: 'UPS', USPS: 'USP', DHL: 'DHL' };
    const prefix = carrierPrefixes[carrier] || 'TRK';
    const trackingNumber = `${prefix}${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const now = new Date().toISOString();
    const order_id = uuidv4();
    const shipment_id = uuidv4();

    // Create order
    await docClient.send(new PutCommand({
      TableName: TABLES.ORDERS,
      Item: {
        order_id, order_number: orderNumber, customer_id,
        order_date: new Date().toISOString().split('T')[0],
        status: 'Pending', payment_status: 'Pending',
        total_amount: 0, tax_amount: 0, grand_total: 0,
        created_at: now, updated_at: now,
      },
    }));

    // Create shipment
    await docClient.send(new PutCommand({
      TableName: TABLES.SHIPMENTS,
      Item: {
        shipment_id, order_id, tracking_number: trackingNumber, carrier,
        status: status || 'Pending', shipped_date, estimated_delivery,
        from_location, to_location, notes,
        created_at: now, updated_at: now,
      },
    }));

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment_id, order_number: orderNumber, tracking_number: trackingNumber,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// PUT update shipment
router.put('/:id', async (req, res) => {
  try {
    const { status, actual_delivery, notes } = req.body;
    await docClient.send(new UpdateCommand({
      TableName: TABLES.SHIPMENTS,
      Key: { shipment_id: req.params.id },
      UpdateExpression: 'SET #st=:s, actual_delivery=:ad, notes=:n, updated_at=:ua',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':s': status, ':ad': actual_delivery, ':n': notes,
        ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(shipment_id)',
    }));
    res.json({ message: 'Shipment updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Shipment not found' });
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

module.exports = router;
