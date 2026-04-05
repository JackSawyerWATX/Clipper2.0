const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.CUSTOMERS }));
    const sorted = (result.Items || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(sorted);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.CUSTOMERS,
      Key: { customer_id: req.params.id },
    }));
    if (!result.Item) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.Item);
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
    const now = new Date().toISOString();
    const customer_id = uuidv4();
    const item = {
      customer_id, company_name, contact_name, email, phone,
      address_street, address_city, address_state, address_zip, address_country,
      status: status || 'Active', customer_type: customer_type || 'Regular',
      created_at: now, updated_at: now,
    };
    await docClient.send(new PutCommand({ TableName: TABLES.CUSTOMERS, Item: item }));
    res.status(201).json({ message: 'Customer created successfully', customer_id });
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
    await docClient.send(new UpdateCommand({
      TableName: TABLES.CUSTOMERS,
      Key: { customer_id: req.params.id },
      UpdateExpression: 'SET company_name=:cn, contact_name=:co, email=:e, phone=:ph, address_street=:as, address_city=:ac, address_state=:ast, address_zip=:az, address_country=:actr, #st=:s, customer_type=:ct, updated_at=:ua',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':cn': company_name, ':co': contact_name, ':e': email, ':ph': phone,
        ':as': address_street, ':ac': address_city, ':ast': address_state,
        ':az': address_zip, ':actr': address_country, ':s': status,
        ':ct': customer_type, ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(customer_id)',
    }));
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Customer not found' });
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.CUSTOMERS,
      Key: { customer_id: req.params.id },
      ConditionExpression: 'attribute_exists(customer_id)',
    }));
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Customer not found' });
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// GET customer statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.CUSTOMERS }));
    const customers = result.Items || [];
    res.json({
      total_customers: customers.length,
      active_customers: customers.filter(c => c.status === 'Active').length,
      recurring_customers: customers.filter(c => c.customer_type === 'Recurring').length,
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
});

module.exports = router;
