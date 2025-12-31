const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, o.order_number, c.company_name as customer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.order_id
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY p.payment_date DESC
    `);
    res.json(rows);
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

    const [result] = await pool.query(
      `INSERT INTO payments (order_id, transaction_id, amount, payment_method,
       card_last_four, status, processor_response, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, transaction_id, amount, payment_method, card_last_four,
       status, processor_response, notes]
    );

    res.status(201).json({ 
      message: 'Payment recorded successfully',
      payment_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

module.exports = router;
