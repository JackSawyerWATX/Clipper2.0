/**
 * migrateToDynamoDB.js
 * Migrates all data from Clever Cloud MySQL to AWS DynamoDB.
 * Run once after setupDynamoDB.js: node scripts/migrateToDynamoDB.js
 *
 * Requires both MySQL and DynamoDB env vars to be set.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mysql = require('mysql2/promise');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const TABLES = require('../config/tables');

// --- MySQL connection (Clever Cloud) ---
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
});

// --- DynamoDB connection ---
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

async function putItem(tableName, item) {
  await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
}

function toStr(val) {
  return val !== null && val !== undefined ? String(val) : undefined;
}

function toNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

function toDate(val) {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val).split('T')[0];
}

function toIso(val) {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

async function migrate() {
  console.log('\n=== Clipper 2.0 - MySQL → DynamoDB Migration ===\n');

  // 1. Users
  console.log('Migrating users...');
  const [users] = await pool.query('SELECT * FROM users');
  for (const u of users) {
    await putItem(TABLES.USERS, {
      user_id:       String(u.user_id),
      username:      u.username,
      password_hash: u.password_hash,
      email:         u.email,
      role:          u.role,
      status:        u.status,
      permissions:   u.permissions ? (typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions) : [],
      last_login:    toIso(u.last_login),
      created_at:    toIso(u.created_at),
      updated_at:    toIso(u.updated_at),
    });
  }
  console.log(`  ✓ ${users.length} users`);

  // 2. Customers
  console.log('Migrating customers...');
  const [customers] = await pool.query('SELECT * FROM customers');
  for (const c of customers) {
    await putItem(TABLES.CUSTOMERS, {
      customer_id:     String(c.customer_id),
      company_name:    c.company_name,
      contact_name:    c.contact_name,
      email:           c.email,
      phone:           c.phone,
      address_street:  c.address_street,
      address_city:    c.address_city,
      address_state:   c.address_state,
      address_zip:     c.address_zip,
      address_country: c.address_country,
      status:          c.status,
      customer_type:   c.customer_type,
      created_at:      toIso(c.created_at),
      updated_at:      toIso(c.updated_at),
    });
  }
  console.log(`  ✓ ${customers.length} customers`);

  // 3. Suppliers
  console.log('Migrating suppliers...');
  const [suppliers] = await pool.query('SELECT * FROM suppliers');
  for (const s of suppliers) {
    await putItem(TABLES.SUPPLIERS, {
      supplier_id:     String(s.supplier_id),
      company_name:    s.company_name,
      contact_person:  s.contact_person,
      email:           s.email,
      phone:           s.phone,
      address_street:  s.address_street,
      address_city:    s.address_city,
      address_state:   s.address_state,
      address_zip:     s.address_zip,
      address_country: s.address_country,
      status:          s.status,
      created_at:      toIso(s.created_at),
      updated_at:      toIso(s.updated_at),
    });
  }
  console.log(`  ✓ ${suppliers.length} suppliers`);

  // 4. Inventory
  console.log('Migrating inventory...');
  const [items] = await pool.query('SELECT * FROM inventory');
  for (const i of items) {
    await putItem(TABLES.INVENTORY, {
      item_id:        String(i.item_id),
      part_number:    i.part_number,
      name:           i.name,
      description:    i.description,
      manufacturer:   i.manufacturer,
      category:       i.category,
      quantity:       toNum(i.quantity) ?? 0,
      min_quantity:   toNum(i.min_quantity) ?? 10,
      price_per_unit: toNum(i.price_per_unit),
      supplier_id:    toStr(i.supplier_id),
      photo_url:      i.photo_url,
      status:         i.status,
      created_at:     toIso(i.created_at),
      updated_at:     toIso(i.updated_at),
    });
  }
  console.log(`  ✓ ${items.length} inventory items`);

  // 5. Orders
  console.log('Migrating orders...');
  const [orders] = await pool.query('SELECT * FROM orders');
  for (const o of orders) {
    await putItem(TABLES.ORDERS, {
      order_id:                 String(o.order_id),
      order_number:             o.order_number,
      customer_id:              String(o.customer_id),
      order_date:               toDate(o.order_date),
      status:                   o.status,
      total_amount:             toNum(o.total_amount) ?? 0,
      tax_amount:               toNum(o.tax_amount) ?? 0,
      grand_total:              toNum(o.grand_total) ?? 0,
      payment_status:           o.payment_status,
      payment_method:           o.payment_method,
      shipping_address_street:  o.shipping_address_street,
      shipping_address_city:    o.shipping_address_city,
      shipping_address_state:   o.shipping_address_state,
      shipping_address_zip:     o.shipping_address_zip,
      shipping_address_country: o.shipping_address_country,
      tracking_number:          o.tracking_number,
      carrier:                  o.carrier,
      notes:                    o.notes,
      created_at:               toIso(o.created_at),
      updated_at:               toIso(o.updated_at),
    });
  }
  console.log(`  ✓ ${orders.length} orders`);

  // 6. Order Items (customer_orders table)
  console.log('Migrating order items...');
  const [orderItems] = await pool.query('SELECT * FROM customer_orders');
  for (const oi of orderItems) {
    await putItem(TABLES.ORDER_ITEMS, {
      order_id:      String(oi.order_id),
      order_item_id: String(oi.order_item_id),
      item_id:       String(oi.item_id),
      quantity:      toNum(oi.quantity) ?? 1,
      unit_price:    toNum(oi.unit_price) ?? 0,
      subtotal:      toNum(oi.subtotal) ?? 0,
      notes:         oi.notes,
      created_at:    toIso(oi.created_at),
      updated_at:    toIso(oi.updated_at),
    });
  }
  console.log(`  ✓ ${orderItems.length} order items`);

  // 7. Shipments
  console.log('Migrating shipments...');
  const [shipments] = await pool.query('SELECT * FROM shipments');
  for (const s of shipments) {
    await putItem(TABLES.SHIPMENTS, {
      shipment_id:        String(s.shipment_id),
      order_id:           String(s.order_id),
      tracking_number:    s.tracking_number,
      carrier:            s.carrier,
      status:             s.status,
      shipped_date:       toDate(s.shipped_date),
      estimated_delivery: toDate(s.estimated_delivery),
      actual_delivery:    toDate(s.actual_delivery),
      from_location:      s.from_location,
      to_location:        s.to_location,
      notes:              s.notes,
      created_at:         toIso(s.created_at),
      updated_at:         toIso(s.updated_at),
    });
  }
  console.log(`  ✓ ${shipments.length} shipments`);

  // 8. Payments
  console.log('Migrating payments...');
  const [payments] = await pool.query('SELECT * FROM payments');
  for (const p of payments) {
    await putItem(TABLES.PAYMENTS, {
      payment_id:         String(p.payment_id),
      order_id:           String(p.order_id),
      transaction_id:     p.transaction_id,
      amount:             toNum(p.amount) ?? 0,
      payment_method:     p.payment_method,
      card_last_four:     p.card_last_four,
      status:             p.status,
      payment_date:       toIso(p.payment_date),
      processor_response: p.processor_response,
      notes:              p.notes,
      created_at:         toIso(p.created_at),
      updated_at:         toIso(p.updated_at),
    });
  }
  console.log(`  ✓ ${payments.length} payments`);

  // 9. Analytics
  console.log('Migrating analytics...');
  const [analytics] = await pool.query('SELECT * FROM past_analytics');
  for (const a of analytics) {
    const sortKey = `${toDate(a.metric_date)}#${a.analytics_id}`;
    await putItem(TABLES.ANALYTICS, {
      metric_type:     a.metric_type,
      sort_key:        sortKey,
      analytics_id:    String(a.analytics_id),
      metric_date:     toDate(a.metric_date),
      metric_category: a.metric_category,
      metric_value:    toNum(a.metric_value),
      metric_count:    toNum(a.metric_count),
      metric_label:    a.metric_label,
      metadata:        a.metadata ? (typeof a.metadata === 'string' ? JSON.parse(a.metadata) : a.metadata) : undefined,
      created_at:      toIso(a.created_at),
    });
  }
  console.log(`  ✓ ${analytics.length} analytics records`);

  console.log('\n✓ Migration complete!\n');
  await pool.end();
}

migrate().catch((err) => {
  console.error('\n✗ Migration failed:', err.message);
  process.exit(1);
});
