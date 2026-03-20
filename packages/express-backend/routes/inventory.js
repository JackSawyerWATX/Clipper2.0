const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, s.company_name as supplier_name
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
      ORDER BY i.name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET single inventory item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, s.company_name as supplier_name
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
      WHERE i.item_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST create inventory item
router.post('/', async (req, res) => {
  try {
    const {
      part_number, name, description, manufacturer, category,
      quantity, min_quantity, price_per_unit, supplier_id, photo_url, status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO inventory (part_number, name, description, manufacturer, category,
       quantity, min_quantity, price_per_unit, supplier_id, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [part_number, name, description, manufacturer, category, quantity,
       min_quantity, price_per_unit, supplier_id, photo_url, status]
    );

    res.status(201).json({ 
      message: 'Inventory item created successfully',
      item_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PUT update inventory item
router.put('/:id', async (req, res) => {
  try {
    const {
      part_number, name, description, manufacturer, category,
      quantity, min_quantity, price_per_unit, supplier_id, photo_url, status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE inventory SET part_number = ?, name = ?, description = ?, manufacturer = ?,
       category = ?, quantity = ?, min_quantity = ?, price_per_unit = ?, 
       supplier_id = ?, photo_url = ?, status = ? WHERE item_id = ?`,
      [part_number, name, description, manufacturer, category, quantity,
       min_quantity, price_per_unit, supplier_id, photo_url, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// DELETE inventory item
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM inventory WHERE item_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// GET low stock items
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM inventory 
      WHERE quantity <= min_quantity 
      ORDER BY quantity ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

module.exports = router;
