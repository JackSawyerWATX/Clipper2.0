-- Update Customer Growth Data for Analytics
-- Add new customers in 2025 and simulate some churn for realistic growth metrics

USE clipper_db;

-- Add 8 new customers in 2025 (positive growth)
INSERT INTO customers (company_name, contact_name, email, phone, address_street, address_city, address_state, address_zip, address_country, status, customer_type, created_at) VALUES
('Quantum Computing Labs', 'Alexandra Rivera', 'arivera@quantumcomp.com', '(555) 234-9876', '1001 Quantum Lane', 'Palo Alto', 'CA', '94301', 'USA', 'Active', 'Regular', '2025-01-08'),
('Smart City Solutions', 'Marcus Johnson', 'mjohnson@smartcity.com', '(555) 345-8765', '2002 Innovation Circle', 'Austin', 'TX', '78702', 'USA', 'Active', 'Recurring', '2025-01-12'),
('EcoTech Innovations', 'Samantha Greene', 'sgreene@ecotech.com', '(555) 456-7654', '3003 Green Boulevard', 'Portland', 'OR', '97202', 'USA', 'Active', 'Regular', '2025-01-15'),
('DataStream Analytics', 'Brandon Mitchell', 'bmitchell@datastream.com', '(555) 567-6543', '4004 Data Drive', 'Seattle', 'WA', '98102', 'USA', 'Active', 'Recurring', '2025-01-18'),
('NextGen Robotics', 'Jessica Chen', 'jchen@nextgenrobotics.com', '(555) 678-5432', '5005 Automation Avenue', 'San Jose', 'CA', '95102', 'USA', 'Active', 'Regular', '2025-01-22'),
('CloudFirst Technologies', 'Andrew Thompson', 'athompson@cloudfirst.com', '(555) 789-4321', '6006 Cloud Street', 'Denver', 'CO', '80202', 'USA', 'Active', 'Recurring', '2025-01-25'),
('AgriTech Solutions', 'Emily Robinson', 'erobinson@agritech.com', '(555) 890-3210', '7007 Farm Tech Road', 'Des Moines', 'IA', '50301', 'USA', 'Active', 'Regular', '2025-01-27'),
('Fusion Energy Systems', 'Michael O''Brien', 'mobrien@fusionenergy.com', '(555) 901-2109', '8008 Energy Plaza', 'Houston', 'TX', '77002', 'USA', 'Active', 'Recurring', '2025-01-29');

-- Mark 2 existing customers as lost (Inactive) in 2025 with updated_at dates
-- This gives us 8 new - 2 lost = 6 net growth
UPDATE customers 
SET status = 'Inactive', updated_at = '2025-01-20'
WHERE company_name IN ('Urban Development Co', 'Western Wholesale');

-- Display results
SELECT 
    'Customer Growth Summary for 2025' as Summary,
    (SELECT COUNT(*) FROM customers WHERE YEAR(created_at) = 2025) as 'New Customers',
    (SELECT COUNT(*) FROM customers WHERE status = 'Inactive' AND YEAR(updated_at) = 2025) as 'Lost Customers',
    (SELECT COUNT(*) FROM customers WHERE YEAR(created_at) = 2025) - 
    (SELECT COUNT(*) FROM customers WHERE status = 'Inactive' AND YEAR(updated_at) = 2025) as 'Net Growth';

