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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_id, carrier, status, shipped_date,
      estimated_delivery, from_location, to_location, notes
    } = req.body;

    // Generate next order number
    const [lastOrder] = await connection.query(
      'SELECT order_number FROM orders ORDER BY order_id DESC LIMIT 1'
    );
    let nextOrderNum = 1001;
    if (lastOrder.length > 0) {
      const lastNum = parseInt(lastOrder[0].order_number.replace(/\D/g, ''));
      nextOrderNum = lastNum + 1;
    }
    const orderNumber = `ORD-${nextOrderNum}`;

    // Generate tracking number based on carrier
    const carrierPrefixes = {
      'FedEx': 'FDX',
      'UPS': 'UPS',
      'USPS': 'USP',
      'DHL': 'DHL'
    };
    const prefix = carrierPrefixes[carrier] || 'TRK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const trackingNumber = `${prefix}${timestamp}${random}`;

    // Create order first
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, customer_id, order_date, status, payment_status)
       VALUES (?, ?, CURDATE(), 'Pending', 'Pending')`,
      [orderNumber, customer_id]
    );
    const orderId = orderResult.insertId;

    // Create shipment
    const [shipmentResult] = await connection.query(
      `INSERT INTO shipments (order_id, tracking_number, carrier, status, shipped_date,
       estimated_delivery, from_location, to_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, trackingNumber, carrier, status || 'Pending', shipped_date, 
       estimated_delivery, from_location, to_location, notes]
    );

    await connection.commit();

    res.status(201).json({ 
      message: 'Shipment created successfully',
      shipment_id: shipmentResult.insertId,
      order_number: orderNumber,
      tracking_number: trackingNumber
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  } finally {
    connection.release();
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
