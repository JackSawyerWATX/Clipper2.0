-- Clear existing order data
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE shipments;
TRUNCATE TABLE payments;
TRUNCATE TABLE customer_orders;
TRUNCATE TABLE orders;
SET FOREIGN_KEY_CHECKS=1;
