const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all order items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT co.*, i.name as item_name, i.part_number, o.order_number
      FROM customer_orders co
      LEFT JOIN inventory i ON co.item_id = i.item_id
      LEFT JOIN orders o ON co.order_id = o.order_id
      ORDER BY co.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// GET order items by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT co.*, i.name as item_name, i.part_number, i.manufacturer
      FROM customer_orders co
      LEFT JOIN inventory i ON co.item_id = i.item_id
      WHERE co.order_id = ?
    `, [req.params.orderId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// POST add item to order
router.post('/', async (req, res) => {
  try {
    const { order_id, item_id, quantity, unit_price, notes } = req.body;
    const subtotal = quantity * unit_price;

    const [result] = await pool.query(
      `INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, item_id, quantity, unit_price, subtotal, notes]
    );

    res.status(201).json({ 
      message: 'Order item added successfully',
      order_item_id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(500).json({ error: 'Failed to add order item' });
  }
});

// PUT update order item
router.put('/:id', async (req, res) => {
  try {
    const { quantity, unit_price, notes } = req.body;
    const subtotal = quantity * unit_price;

    const [result] = await pool.query(
      `UPDATE customer_orders SET quantity = ?, unit_price = ?, subtotal = ?, notes = ?
       WHERE order_item_id = ?`,
      [quantity, unit_price, subtotal, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    res.json({ message: 'Order item updated successfully' });
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(500).json({ error: 'Failed to update order item' });
  }
});

// DELETE order item
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM customer_orders WHERE order_item_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    console.error('Error deleting order item:', error);
    res.status(500).json({ error: 'Failed to delete order item' });
  }
});

module.exports = router;
