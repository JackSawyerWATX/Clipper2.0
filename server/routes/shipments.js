const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all shipments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, o.order_number, c.company_name as customer_name
      FROM shipments s
      LEFT JOIN orders o ON s.order_id = o.order_id
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// GET single shipment
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shipments WHERE shipment_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// POST create shipment
router.post('/', async (req, res) => {
  try {
    const {
      order_id, tracking_number, carrier, status, shipped_date,
      estimated_delivery, from_location, to_location, notes
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO shipments (order_id, tracking_number, carrier, status, shipped_date,
       estimated_delivery, from_location, to_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, tracking_number, carrier, status, shipped_date, estimated_delivery,
       from_location, to_location, notes]
    );

    res.status(201).json({ 
      message: 'Shipment created successfully',
      shipment_id: result.insertId 
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

    const [result] = await pool.query(
      `UPDATE shipments SET status = ?, actual_delivery = ?, notes = ?
       WHERE shipment_id = ?`,
      [status, actual_delivery, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment updated successfully' });
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

module.exports = router;
