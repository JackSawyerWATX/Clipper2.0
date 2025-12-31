-- Clipper 2.0 Database Schema
-- MySQL Database

-- Create Database
CREATE DATABASE IF NOT EXISTS clipper_db;
USE clipper_db;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100),
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    customer_type ENUM('One-Time', 'Regular', 'Recurring') DEFAULT 'Regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_company (company_name)
);

-- 2. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company (company_name),
    INDEX idx_status (status)
);

-- 3. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    category VARCHAR(100),
    quantity INT DEFAULT 0,
    min_quantity INT DEFAULT 10,
    price_per_unit DECIMAL(10, 2),
    supplier_id INT,
    photo_url VARCHAR(500),
    status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    INDEX idx_part_number (part_number),
    INDEX idx_name (name),
    INDEX idx_manufacturer (manufacturer),
    INDEX idx_status (status)
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled') DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(10, 2) DEFAULT 0.00,
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
    payment_method VARCHAR(50),
    shipping_address_street VARCHAR(255),
    shipping_address_city VARCHAR(100),
    shipping_address_state VARCHAR(50),
    shipping_address_zip VARCHAR(20),
    shipping_address_country VARCHAR(100),
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- 5. Customer Orders (Order Items) Table
CREATE TABLE IF NOT EXISTS customer_orders (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory(item_id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_item (item_id)
);

-- 6. Past Analytics Table
CREATE TABLE IF NOT EXISTS past_analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_category VARCHAR(50),
    metric_value DECIMAL(15, 2),
    metric_count INT,
    metric_label VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (metric_date),
    INDEX idx_type (metric_type),
    INDEX idx_category (metric_category)
);

-- Additional Tables for Complete System

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Administrator', 'Manager', 'Employee', 'Viewer') DEFAULT 'Employee',
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    permissions JSON,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Processing', 'Waiting for Carrier Pick Up', 'In Transit', 'Shipped', 'Delivered') DEFAULT 'Pending',
    shipped_date DATE,
    estimated_delivery DATE,
    actual_delivery DATE,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_tracking (tracking_number),
    INDEX idx_order (order_id),
    INDEX idx_status (status)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    card_last_four VARCHAR(4),
    status ENUM('Pending', 'Processing', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processor_response TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_transaction (transaction_id),
    INDEX idx_order (order_id),
    INDEX idx_status (status)
);

-- Insert Default Admin User (password: admin123)
-- Note: In production, use bcrypt to hash passwords
INSERT INTO users (username, password_hash, email, role, status, permissions) VALUES
('admin', '$2b$10$rZ5qZ5qZ5qZ5qZ5qZ5qZ5O', 'admin@clipper.com', 'Administrator', 'Active', 
'["dashboard", "customers", "orders", "place-order", "shipment-tracking", "suppliers", "inventory", "analytics", "payment-processing", "reports", "admin"]');

-- Insert Sample Data for Development
-- Sample Customers
INSERT INTO customers (company_name, contact_name, email, phone, address_street, address_city, address_state, address_zip, address_country, status, customer_type) VALUES
('Acme Corporation', 'John Smith', 'john@acme.com', '555-0101', '123 Main St', 'New York', 'NY', '10001', 'USA', 'Active', 'Regular'),
('Tech Solutions Inc', 'Sarah Johnson', 'sarah@techsolutions.com', '555-0102', '456 Tech Blvd', 'San Francisco', 'CA', '94102', 'USA', 'Active', 'Recurring'),
('Global Imports Ltd', 'Michael Brown', 'michael@globalimports.com', '555-0103', '789 Trade Ave', 'Chicago', 'IL', '60601', 'USA', 'Active', 'One-Time');

-- Sample Suppliers
INSERT INTO suppliers (company_name, contact_person, email, phone, address_street, address_city, address_state, address_zip, address_country, status) VALUES
('Pacific Manufacturing', 'David Lee', 'david@pacific.com', '555-0201', '111 Factory Rd', 'Los Angeles', 'CA', '90001', 'USA', 'Active'),
('Eastern Components', 'Lisa Wang', 'lisa@eastern.com', '555-0202', '222 Supply St', 'Boston', 'MA', '02101', 'USA', 'Active'),
('Midwest Distributors', 'Robert Garcia', 'robert@midwest.com', '555-0203', '333 Distribution Dr', 'Detroit', 'MI', '48201', 'USA', 'Active'),
('Global Parts Co', 'Jennifer Martinez', 'jennifer@globalparts.com', '555-0204', '444 Parts Ln', 'Houston', 'TX', '77001', 'USA', 'Active');

-- Sample Inventory Items
INSERT INTO inventory (part_number, name, description, manufacturer, category, quantity, min_quantity, price_per_unit, supplier_id, status) VALUES
('WDG-001', 'Standard Widget', 'High-quality standard widget', 'WidgetCo', 'Widgets', 150, 20, 24.99, 1, 'In Stock'),
('SPK-102', 'Premium Sprocket', 'Heavy-duty sprocket assembly', 'SprocketMax', 'Mechanical', 45, 10, 89.99, 2, 'In Stock'),
('BRG-203', 'Ball Bearing Set', 'Industrial grade ball bearings', 'BearingPro', 'Components', 8, 15, 34.50, 3, 'Low Stock'),
('GSK-304', 'Gasket Kit', 'Complete gasket assortment', 'SealTech', 'Seals', 200, 30, 15.75, 4, 'In Stock'),
('PLG-405', 'Spark Plug', 'High-performance spark plug', 'IgniteCorp', 'Electronics', 0, 25, 12.99, 1, 'Out of Stock');
