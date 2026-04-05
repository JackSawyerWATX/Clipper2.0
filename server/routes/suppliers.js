const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.SUPPLIERS }));
    const sorted = (result.Items || []).sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
    res.json(sorted);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET single supplier
router.get('/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.SUPPLIERS,
      Key: { supplier_id: req.params.id },
    }));
    if (!result.Item) return res.status(404).json({ error: 'Supplier not found' });
    res.json(result.Item);
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
    const now = new Date().toISOString();
    const supplier_id = uuidv4();
    await docClient.send(new PutCommand({
      TableName: TABLES.SUPPLIERS,
      Item: {
        supplier_id, company_name, contact_person, email, phone,
        address_street, address_city, address_state, address_zip, address_country,
        status: status || 'Active', created_at: now, updated_at: now,
      },
    }));
    res.status(201).json({ message: 'Supplier created successfully', supplier_id });
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
    await docClient.send(new UpdateCommand({
      TableName: TABLES.SUPPLIERS,
      Key: { supplier_id: req.params.id },
      UpdateExpression: 'SET company_name=:cn, contact_person=:cp, email=:e, phone=:ph, address_street=:as, address_city=:ac, address_state=:ast, address_zip=:az, address_country=:actr, #st=:s, updated_at=:ua',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':cn': company_name, ':cp': contact_person, ':e': email, ':ph': phone,
        ':as': address_street, ':ac': address_city, ':ast': address_state,
        ':az': address_zip, ':actr': address_country, ':s': status,
        ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(supplier_id)',
    }));
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Supplier not found' });
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE supplier
router.delete('/:id', async (req, res) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.SUPPLIERS,
      Key: { supplier_id: req.params.id },
      ConditionExpression: 'attribute_exists(supplier_id)',
    }));
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Supplier not found' });
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

module.exports = router;
