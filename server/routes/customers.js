const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST create new customer
router.post('/', async (req, res) => {
  try {
    const {
      company_name, contact_name, email, phone,
      address_street, address_city, address_state, address_zip, address_country,
      status, customer_type
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO customers (company_name, contact_name, email, phone, 
       address_street, address_city, address_state, address_zip, address_country, 
       status, customer_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, contact_name, email, phone, address_street, address_city, 
       address_state, address_zip, address_country, status, customer_type]
    );

    res.status(201).json({ 
      message: 'Customer created successfully',
      customer_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const {
      company_name, contact_name, email, phone,
      address_street, address_city, address_state, address_zip, address_country,
      status, customer_type
    } = req.body;

    const [result] = await pool.query(
      `UPDATE customers SET 
       company_name = ?, contact_name = ?, email = ?, phone = ?,
       address_street = ?, address_city = ?, address_state = ?, 
       address_zip = ?, address_country = ?, status = ?, customer_type = ?
       WHERE customer_id = ?`,
      [company_name, contact_name, email, phone, address_street, address_city,
       address_state, address_zip, address_country, status, customer_type, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// GET customer statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_customers,
        SUM(CASE WHEN customer_type = 'Recurring' THEN 1 ELSE 0 END) as recurring_customers
      FROM customers
    `);
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
});

module.exports = router;
