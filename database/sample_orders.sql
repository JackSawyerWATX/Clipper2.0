-- Sample Orders for Clipper 2.0 Database
-- This file contains test data for orders, order items, payments, and shipments

USE clipper_db;

-- Sample Orders
-- Order number format: ORD-XXYYZ where XX = state code (01-51), YYZ = unique order sequence
-- State codes: 01=AL, 02=AK, 03=AZ, 04=AR, 05=CA, 06=CO, 07=CT, 08=DE, 09=FL, 10=GA,
-- 11=HI, 12=ID, 13=IL, 14=IN, 15=IA, 16=KS, 17=KY, 18=LA, 19=ME, 20=MD, 21=MA, 22=MI,
-- 23=MN, 24=MS, 25=MO, 26=MT, 27=NE, 28=NV, 29=NH, 30=NJ, 31=NM, 32=NY, 33=NC, 34=ND,
-- 35=OH, 36=OK, 37=OR, 38=PA, 39=RI, 40=SC, 41=SD, 42=TN, 43=TX, 44=UT, 45=VT, 46=VA,
-- 47=WA, 48=WV, 49=WI, 50=WY, 51=PR (Puerto Rico)
INSERT INTO orders (order_number, customer_id, order_date, status, total_amount, tax_amount, grand_total, payment_status, payment_method, shipping_address_street, shipping_address_city, shipping_address_state, shipping_address_zip, shipping_address_country, notes) VALUES
('ORD-32001', 1, '2024-12-01', 'Completed', 349.95, 27.99, 377.94, 'Paid', 'Credit Card', '123 Main St', 'New York', 'NY', '10001', 'USA', 'Standard shipping requested'),
('ORD-05001', 2, '2024-12-05', 'Completed', 899.90, 71.99, 971.89, 'Paid', 'Credit Card', '456 Tech Blvd', 'San Francisco', 'CA', '94102', 'USA', 'Express shipping'),
('ORD-13001', 3, '2024-12-08', 'Shipped', 276.00, 22.08, 298.08, 'Paid', 'PayPal', '789 Trade Ave', 'Chicago', 'IL', '60601', 'USA', NULL),
('ORD-47001', 4, '2024-12-10', 'Processing', 179.97, 14.40, 194.37, 'Paid', 'Credit Card', '101 Innovation Way', 'Seattle', 'WA', '98101', 'USA', 'Gift wrap requested'),
('ORD-43001', 5, '2024-12-12', 'Processing', 1499.85, 119.99, 1619.84, 'Paid', 'Wire Transfer', '202 Energy Blvd', 'Austin', 'TX', '78701', 'USA', 'Bulk order discount applied'),
('ORD-37001', 6, '2024-12-15', 'Pending', 534.96, 42.80, 577.76, 'Pending', 'Credit Card', '303 Build Street', 'Portland', 'OR', '97201', 'USA', 'Customer requested split shipment'),
('ORD-03001', 7, '2024-12-18', 'Completed', 254.94, 20.39, 275.33, 'Paid', 'Credit Card', '404 Health Ave', 'Phoenix', 'AZ', '85001', 'USA', NULL),
('ORD-09001', 8, '2024-12-20', 'Shipped', 699.93, 55.99, 755.92, 'Paid', 'Purchase Order', '505 Fashion Lane', 'Miami', 'FL', '33101', 'USA', 'PO #12345 attached'),
('ORD-06001', 9, '2024-12-22', 'Processing', 424.92, 33.99, 458.91, 'Paid', 'Credit Card', '606 Hospitality Dr', 'Denver', 'CO', '80201', 'USA', NULL),
('ORD-21001', 10, '2024-12-23', 'Pending', 149.98, 12.00, 161.98, 'Pending', 'Credit Card', '707 Learning Way', 'Boston', 'MA', '02108', 'USA', 'Rush order'),
('ORD-33001', 11, '2024-12-24', 'Completed', 899.88, 71.99, 971.87, 'Paid', 'Credit Card', '808 Finance Street', 'Charlotte', 'NC', '28201', 'USA', NULL),
('ORD-22001', 12, '2024-12-26', 'Shipped', 324.95, 26.00, 350.95, 'Paid', 'PayPal', '909 Auto Plaza', 'Detroit', 'MI', '48201', 'USA', 'Signature required'),
('ORD-10001', 13, '2024-12-27', 'Processing', 549.92, 43.99, 593.91, 'Paid', 'Credit Card', '1010 Media Blvd', 'Atlanta', 'GA', '30301', 'USA', NULL),
('ORD-43002', 14, '2024-12-28', 'Pending', 1199.85, 95.99, 1295.84, 'Pending', 'Wire Transfer', '1111 Food Court', 'Dallas', 'TX', '75201', 'USA', 'Large order - verify stock'),
('ORD-05002', 15, '2024-12-29', 'Completed', 274.95, 22.00, 296.95, 'Paid', 'Credit Card', '1212 Retail Row', 'San Diego', 'CA', '92101', 'USA', NULL),
('ORD-32002', 1, '2024-12-30', 'Processing', 449.94, 36.00, 485.94, 'Paid', 'Credit Card', '123 Main St', 'New York', 'NY', '10001', 'USA', 'Repeat customer'),
('ORD-05003', 2, '2024-12-30', 'Pending', 799.90, 63.99, 863.89, 'Pending', 'Purchase Order', '456 Tech Blvd', 'San Francisco', 'CA', '94102', 'USA', 'PO pending approval'),
('ORD-13002', 3, '2024-12-31', 'Processing', 124.98, 10.00, 134.98, 'Paid', 'Credit Card', '789 Trade Ave', 'Chicago', 'IL', '60601', 'USA', NULL),
('ORD-38001', 17, '2024-12-31', 'Pending', 649.92, 51.99, 701.91, 'Pending', 'Credit Card', '1313 Transport Way', 'Philadelphia', 'PA', '19101', 'USA', 'Insurance required'),
('ORD-28001', 18, '2024-12-31', 'Completed', 2499.75, 199.98, 2699.73, 'Paid', 'Wire Transfer', '1414 Service Drive', 'Las Vegas', 'NV', '89101', 'USA', 'VIP customer - priority handling'),
('ORD-46001', 19, '2024-12-31', 'Processing', 524.94, 42.00, 566.94, 'Paid', 'Credit Card', '1515 Government St', 'Richmond', 'VA', '23218', 'USA', NULL),
('ORD-35001', 20, '2024-12-31', 'Shipped', 374.95, 30.00, 404.95, 'Paid', 'PayPal', '1616 Manufacturing Blvd', 'Columbus', 'OH', '43201', 'USA', 'Fragile items - handle with care'),
('ORD-42001', 1, '2025-01-01', 'Pending', 299.96, 24.00, 323.96, 'Pending', 'Credit Card', '123 Main St', 'New York', 'NY', '10001', 'USA', 'New year order'),
('ORD-25001', 2, '2025-01-01', 'Processing', 674.91, 54.00, 728.91, 'Paid', 'Credit Card', '456 Tech Blvd', 'San Francisco', 'CA', '94102', 'USA', NULL),
('ORD-49001', 4, '2025-01-02', 'Completed', 449.93, 36.00, 485.93, 'Paid', 'Credit Card', '101 Innovation Way', 'Seattle', 'WA', '98101', 'USA', NULL),
('ORD-23001', 5, '2025-01-02', 'Shipped', 824.88, 65.99, 890.87, 'Paid', 'Wire Transfer', '202 Energy Blvd', 'Austin', 'TX', '78701', 'USA', 'Expedited shipping'),
('ORD-44001', 7, '2025-01-03', 'Processing', 599.94, 48.00, 647.94, 'Paid', 'Credit Card', '404 Health Ave', 'Phoenix', 'AZ', '85001', 'USA', 'Repeat customer discount'),
('ORD-40001', 9, '2025-01-03', 'Pending', 924.85, 73.99, 998.84, 'Pending', 'Purchase Order', '606 Hospitality Dr', 'Denver', 'CO', '80201', 'USA', 'PO approval pending');

-- Sample Order Items (customer_orders)
-- Order 1 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(1, 1, 5, 24.99, 124.95),
(1, 4, 10, 15.75, 157.50),
(1, 3, 2, 34.50, 69.00);

-- Order 2 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(2, 2, 10, 89.99, 899.90);

-- Order 3 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(3, 1, 8, 24.99, 199.92),
(3, 4, 5, 15.75, 78.75);

-- Order 4 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(4, 3, 3, 34.50, 103.50),
(4, 1, 3, 24.99, 74.97);

-- Order 5 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(5, 2, 15, 89.99, 1349.85),
(5, 1, 6, 24.99, 149.94);

-- Order 6 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(6, 4, 20, 15.75, 315.00),
(6, 3, 4, 34.50, 138.00),
(6, 1, 3, 24.99, 74.97);

-- Order 7 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(7, 1, 7, 24.99, 174.93),
(7, 4, 5, 15.75, 78.75);

-- Order 8 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(8, 2, 6, 89.99, 539.94),
(8, 3, 2, 34.50, 69.00),
(8, 2, 1, 89.99, 89.99);

-- Order 9 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(9, 3, 8, 34.50, 276.00),
(9, 1, 6, 24.99, 149.94);

-- Order 10 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(10, 1, 6, 24.99, 149.94);

-- Order 11 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(11, 2, 10, 89.99, 899.90);

-- Order 12 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(12, 1, 13, 24.99, 324.87);

-- Order 13 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(13, 3, 12, 34.50, 414.00),
(13, 4, 8, 15.75, 126.00);

-- Order 14 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(14, 2, 12, 89.99, 1079.88),
(14, 1, 5, 24.99, 124.95);

-- Order 15 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(15, 1, 11, 24.99, 274.89);

-- Order 16 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(16, 3, 8, 34.50, 276.00),
(16, 4, 11, 15.75, 173.25);

-- Order 17 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(17, 2, 8, 89.99, 719.92),
(17, 3, 2, 34.50, 69.00);

-- Order 18 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(18, 1, 5, 24.99, 124.95);

-- Order 19 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(19, 3, 14, 34.50, 483.00),
(19, 4, 10, 15.75, 157.50);

-- Order 20 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(20, 2, 25, 89.99, 2249.75),
(20, 1, 10, 24.99, 249.90);

-- Order 21 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(21, 1, 12, 24.99, 299.88),
(21, 4, 14, 15.75, 220.50);

-- Order 22 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(22, 3, 7, 34.50, 241.50),
(22, 1, 5, 24.99, 124.95);

-- Order 23 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(23, 1, 12, 24.99, 299.88);

-- Order 24 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(24, 3, 13, 34.50, 448.50),
(24, 4, 14, 15.75, 220.50);

-- Order 25 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(25, 2, 5, 89.99, 449.95);

-- Order 26 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(26, 2, 8, 89.99, 719.92),
(26, 1, 5, 24.99, 124.95);

-- Order 27 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(27, 3, 12, 34.50, 414.00),
(27, 4, 5, 15.75, 78.75);

-- Order 28 items
INSERT INTO customer_orders (order_id, item_id, quantity, unit_price, subtotal) VALUES
(28, 2, 9, 89.99, 809.91),
(28, 1, 5, 24.99, 124.95);

-- Sample Payments
INSERT INTO payments (order_id, transaction_id, amount, payment_method, card_last_four, status, payment_date) VALUES
(1, 'TXN-32001-001', 377.94, 'Credit Card', '4532', 'Completed', '2024-12-01 10:30:00'),
(2, 'TXN-05001-001', 971.89, 'Credit Card', '5123', 'Completed', '2024-12-05 14:15:00'),
(3, 'TXN-13001-001', 298.08, 'PayPal', NULL, 'Completed', '2024-12-08 09:45:00'),
(4, 'TXN-47001-001', 194.37, 'Credit Card', '4916', 'Completed', '2024-12-10 16:20:00'),
(5, 'TXN-43001-001', 1619.84, 'Wire Transfer', NULL, 'Completed', '2024-12-12 11:00:00'),
(7, 'TXN-03001-001', 275.33, 'Credit Card', '3782', 'Completed', '2024-12-18 13:30:00'),
(8, 'TXN-09001-001', 755.92, 'Purchase Order', NULL, 'Completed', '2024-12-20 10:15:00'),
(9, 'TXN-06001-001', 458.91, 'Credit Card', '6011', 'Completed', '2024-12-22 15:45:00'),
(11, 'TXN-33001-001', 971.87, 'Credit Card', '4539', 'Completed', '2024-12-24 09:20:00'),
(12, 'TXN-22001-001', 350.95, 'PayPal', NULL, 'Completed', '2024-12-26 14:00:00'),
(13, 'TXN-10001-001', 593.91, 'Credit Card', '5412', 'Completed', '2024-12-27 11:30:00'),
(15, 'TXN-05002-001', 296.95, 'Credit Card', '4716', 'Completed', '2024-12-29 16:45:00'),
(16, 'TXN-32002-001', 485.94, 'Credit Card', '4532', 'Completed', '2024-12-30 10:00:00'),
(18, 'TXN-13002-001', 134.98, 'Credit Card', '3714', 'Completed', '2024-12-31 09:15:00'),
(20, 'TXN-28001-001', 2699.73, 'Wire Transfer', NULL, 'Completed', '2024-12-31 14:30:00'),
(21, 'TXN-46001-001', 566.94, 'Credit Card', '4532', 'Completed', '2024-12-31 11:45:00'),
(22, 'TXN-35001-001', 404.95, 'PayPal', NULL, 'Completed', '2024-12-31 13:20:00'),
(24, 'TXN-25001-001', 728.91, 'Credit Card', '5123', 'Completed', '2025-01-01 10:00:00'),
(25, 'TXN-49001-001', 485.93, 'Credit Card', '4916', 'Completed', '2025-01-02 09:30:00'),
(26, 'TXN-23001-001', 890.87, 'Wire Transfer', NULL, 'Completed', '2025-01-02 14:15:00'),
(27, 'TXN-44001-001', 647.94, 'Credit Card', '3782', 'Completed', '2025-01-03 11:00:00');

-- Sample Shipments
INSERT INTO shipments (order_id, tracking_number, carrier, status, shipped_date, estimated_delivery, from_location, to_location) VALUES
(1, 'TRK-32001-UPS', 'UPS', 'Delivered', '2024-12-02', '2024-12-05', 'Seattle, WA', 'New York, NY'),
(2, 'TRK-05001-FDX', 'FedEx', 'Delivered', '2024-12-06', '2024-12-08', 'Seattle, WA', 'San Francisco, CA'),
(3, 'TRK-13001-UPS', 'USPS', 'In Transit', '2024-12-09', '2024-12-13', 'Seattle, WA', 'Chicago, IL'),
(7, 'TRK-03001-UPS', 'UPS', 'Delivered', '2024-12-19', '2024-12-22', 'Seattle, WA', 'Phoenix, AZ'),
(8, 'TRK-09001-FDX', 'FedEx', 'In Transit', '2024-12-21', '2024-12-24', 'Seattle, WA', 'Miami, FL'),
(11, 'TRK-33001-UPS', 'UPS', 'Delivered', '2024-12-25', '2024-12-28', 'Seattle, WA', 'Charlotte, NC'),
(12, 'TRK-22001-UPS', 'USPS', 'In Transit', '2024-12-27', '2024-12-31', 'Seattle, WA', 'Detroit, MI'),
(15, 'TRK-05002-FDX', 'FedEx', 'Delivered', '2024-12-30', '2025-01-02', 'Seattle, WA', 'San Diego, CA'),
(20, 'TRK-28001-UPS', 'UPS', 'Delivered', '2024-12-31', '2025-01-03', 'Seattle, WA', 'Las Vegas, NV'),
(22, 'TRK-35001-UPS', 'UPS', 'In Transit', '2025-01-01', '2025-01-04', 'Seattle, WA', 'Columbus, OH'),
(25, 'TRK-49001-FDX', 'FedEx', 'Delivered', '2025-01-02', '2025-01-05', 'Seattle, WA', 'Milwaukee, WI'),
(26, 'TRK-23001-UPS', 'UPS', 'In Transit', '2025-01-02', '2025-01-06', 'Seattle, WA', 'Minneapolis, MN');
