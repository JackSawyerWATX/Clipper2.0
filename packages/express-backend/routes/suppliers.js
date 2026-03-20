const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY company_name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET single supplier
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE supplier_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// POST create supplier
router.post('/', async (req, res) => {
  try {
    const {
      company_name, contact_person, email, phone,
      address_street, address_city, address_state, address_zip, address_country, status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO suppliers (company_name, contact_person, email, phone,
       address_street, address_city, address_state, address_zip, address_country, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, contact_person, email, phone, address_street, address_city,
       address_state, address_zip, address_country, status]
    );

    res.status(201).json({ 
      message: 'Supplier created successfully',
      supplier_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
  try {
    const {
      company_name, contact_person, email, phone,
      address_street, address_city, address_state, address_zip, address_country, status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE suppliers SET company_name = ?, contact_person = ?, email = ?, phone = ?,
       address_street = ?, address_city = ?, address_state = ?, address_zip = ?,
       address_country = ?, status = ? WHERE supplier_id = ?`,
      [company_name, contact_person, email, phone, address_street, address_city,
       address_state, address_zip, address_country, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE supplier
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM suppliers WHERE supplier_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

module.exports = router;
