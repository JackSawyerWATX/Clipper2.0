const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, c.company_name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, c.company_name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.order_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(rows[0]);
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

    const [result] = await pool.query(
      `INSERT INTO orders (order_number, customer_id, order_date, status, 
       total_amount, tax_amount, grand_total, payment_status, payment_method,
       shipping_address_street, shipping_address_city, shipping_address_state,
       shipping_address_zip, shipping_address_country, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, customer_id, order_date, status, total_amount, tax_amount,
       grand_total, payment_status, payment_method, shipping_address_street,
       shipping_address_city, shipping_address_state, shipping_address_zip,
       shipping_address_country, notes]
    );

    res.status(201).json({ 
      message: 'Order created successfully',
      order_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order
router.put('/:id', async (req, res) => {
  try {
    const {
      status, payment_status, tracking_number, carrier, notes
    } = req.body;

    const [result] = await pool.query(
      `UPDATE orders SET 
       status = ?, payment_status = ?, tracking_number = ?, carrier = ?, notes = ?
       WHERE order_id = ?`,
      [status, payment_status, tracking_number, carrier, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE order_id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
