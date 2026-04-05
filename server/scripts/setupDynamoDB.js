/**
 * setupDynamoDB.js
 * Creates all DynamoDB tables for Clipper 2.0.
 * Run once: node scripts/setupDynamoDB.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

const tables = [
  {
    TableName: 'clipper-users',
    KeySchema: [{ AttributeName: 'user_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'username-index',
        KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-customers',
    KeySchema: [{ AttributeName: 'customer_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'customer_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-suppliers',
    KeySchema: [{ AttributeName: 'supplier_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'supplier_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-inventory',
    KeySchema: [{ AttributeName: 'item_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'item_id', AttributeType: 'S' },
      { AttributeName: 'part_number', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'part-number-index',
        KeySchema: [{ AttributeName: 'part_number', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-orders',
    KeySchema: [{ AttributeName: 'order_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'order_id', AttributeType: 'S' },
      { AttributeName: 'customer_id', AttributeType: 'S' },
      { AttributeName: 'order_number', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'customer-index',
        KeySchema: [{ AttributeName: 'customer_id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
      {
        IndexName: 'order-number-index',
        KeySchema: [{ AttributeName: 'order_number', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-order-items',
    KeySchema: [
      { AttributeName: 'order_id', KeyType: 'HASH' },
      { AttributeName: 'order_item_id', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'order_id', AttributeType: 'S' },
      { AttributeName: 'order_item_id', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-shipments',
    KeySchema: [{ AttributeName: 'shipment_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'shipment_id', AttributeType: 'S' },
      { AttributeName: 'order_id', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'order-index',
        KeySchema: [{ AttributeName: 'order_id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-payments',
    KeySchema: [{ AttributeName: 'payment_id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'payment_id', AttributeType: 'S' },
      { AttributeName: 'order_id', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'order-index',
        KeySchema: [{ AttributeName: 'order_id', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'clipper-analytics',
    KeySchema: [
      { AttributeName: 'metric_type', KeyType: 'HASH' },
      { AttributeName: 'sort_key', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'metric_type', AttributeType: 'S' },
      { AttributeName: 'sort_key', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch {
    return false;
  }
}

async function setup() {
  console.log('\n=== Clipper 2.0 - DynamoDB Table Setup ===\n');
  console.log(`Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

  for (const tableDef of tables) {
    const exists = await tableExists(tableDef.TableName);
    if (exists) {
      console.log(`✓ ${tableDef.TableName} (already exists)`);
      continue;
    }
    try {
      await client.send(new CreateTableCommand(tableDef));
      console.log(`✓ ${tableDef.TableName} (created)`);
    } catch (err) {
      console.error(`✗ ${tableDef.TableName}: ${err.message}`);
    }
  }

  console.log('\nDone. All tables are ready.\n');
}

setup().catch(console.error);
