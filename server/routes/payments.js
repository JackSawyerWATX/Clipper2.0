const express = require('express');
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const [paymentsResult, ordersResult, customersResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.PAYMENTS })),
      docClient.send(new ScanCommand({ TableName: TABLES.ORDERS })),
      docClient.send(new ScanCommand({ TableName: TABLES.CUSTOMERS })),
    ]);
    const orderMap = Object.fromEntries((ordersResult.Items || []).map(o => [o.order_id, o]));
    const customerMap = Object.fromEntries((customersResult.Items || []).map(c => [c.customer_id, c.company_name]));
    const payments = (paymentsResult.Items || []).map(p => {
      const order = orderMap[p.order_id] || {};
      return {
        ...p,
        order_number: order.order_number || null,
        customer_name: customerMap[order.customer_id] || null,
      };
    }).sort((a, b) => (b.payment_date || '').localeCompare(a.payment_date || ''));
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const {
      order_id, transaction_id, amount, payment_method,
      card_last_four, status, processor_response, notes
    } = req.body;
    const now = new Date().toISOString();
    const payment_id = uuidv4();
    await docClient.send(new PutCommand({
      TableName: TABLES.PAYMENTS,
      Item: {
        payment_id, order_id, transaction_id,
        amount: Number(amount) || 0,
        payment_method, card_last_four,
        status: status || 'Pending',
        payment_date: now, processor_response, notes,
        created_at: now, updated_at: now,
      },
    }));
    res.status(201).json({ message: 'Payment recorded successfully', payment_id });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

module.exports = router;
