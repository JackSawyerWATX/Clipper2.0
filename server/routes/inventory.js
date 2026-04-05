const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const [invResult, suppResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.INVENTORY })),
      docClient.send(new ScanCommand({ TableName: TABLES.SUPPLIERS })),
    ]);
    const supplierMap = Object.fromEntries((suppResult.Items || []).map(s => [s.supplier_id, s.company_name]));
    const items = (invResult.Items || []).map(i => ({
      ...i, supplier_name: supplierMap[i.supplier_id] || null,
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET low stock items (must come before /:id)
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.INVENTORY,
      FilterExpression: 'quantity <= min_quantity',
    }));
    const sorted = (result.Items || []).sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
    res.json(sorted);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// GET single inventory item
router.get('/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.INVENTORY,
      Key: { item_id: req.params.id },
    }));
    if (!result.Item) return res.status(404).json({ error: 'Item not found' });
    if (result.Item.supplier_id) {
      const suppResult = await docClient.send(new GetCommand({
        TableName: TABLES.SUPPLIERS,
        Key: { supplier_id: result.Item.supplier_id },
      }));
      result.Item.supplier_name = suppResult.Item?.company_name || null;
    }
    res.json(result.Item);
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
    const now = new Date().toISOString();
    const item_id = uuidv4();
    await docClient.send(new PutCommand({
      TableName: TABLES.INVENTORY,
      Item: {
        item_id, part_number, name, description, manufacturer, category,
        quantity: Number(quantity) || 0,
        min_quantity: Number(min_quantity) || 10,
        price_per_unit: Number(price_per_unit),
        supplier_id: supplier_id || undefined,
        photo_url,
        status: status || 'In Stock',
        created_at: now, updated_at: now,
      },
    }));
    res.status(201).json({ message: 'Inventory item created successfully', item_id });
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
    await docClient.send(new UpdateCommand({
      TableName: TABLES.INVENTORY,
      Key: { item_id: req.params.id },
      UpdateExpression: 'SET part_number=:pn, #nm=:nm, description=:d, manufacturer=:mfr, category=:cat, quantity=:q, min_quantity=:mq, price_per_unit=:p, supplier_id=:si, photo_url=:pu, #st=:s, updated_at=:ua',
      ExpressionAttributeNames: { '#nm': 'name', '#st': 'status' },
      ExpressionAttributeValues: {
        ':pn': part_number, ':nm': name, ':d': description, ':mfr': manufacturer,
        ':cat': category, ':q': Number(quantity) || 0, ':mq': Number(min_quantity) || 10,
        ':p': Number(price_per_unit), ':si': supplier_id || null,
        ':pu': photo_url, ':s': status, ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(item_id)',
    }));
    res.json({ message: 'Inventory item updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Item not found' });
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// DELETE inventory item
router.delete('/:id', async (req, res) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.INVENTORY,
      Key: { item_id: req.params.id },
      ConditionExpression: 'attribute_exists(item_id)',
    }));
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'Item not found' });
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;
