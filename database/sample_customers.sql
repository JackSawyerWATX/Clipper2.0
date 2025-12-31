-- Sample Customer Data for Clipper 2.0
-- Insert 20 test customers

USE clipper_db;

INSERT INTO customers (company_name, contact_name, email, phone, address_street, address_city, address_state, address_zip, address_country, status, customer_type) VALUES
('Tech Solutions Inc', 'Sarah Johnson', 'sarah.johnson@techsolutions.com', '(555) 123-4567', '1234 Innovation Drive', 'Austin', 'TX', '78701', 'USA', 'Active', 'Regular'),
('Green Energy Corp', 'Michael Chen', 'mchen@greenenergy.com', '(555) 234-5678', '567 Solar Avenue', 'San Francisco', 'CA', '94102', 'USA', 'Active', 'Recurring'),
('Metro Construction LLC', 'David Martinez', 'david.m@metroconstruction.com', '(555) 345-6789', '890 Builder Street', 'Chicago', 'IL', '60601', 'USA', 'Active', 'Regular'),
('Alpha Manufacturing', 'Lisa Anderson', 'landerson@alphamfg.com', '(555) 456-7890', '2345 Industrial Parkway', 'Detroit', 'MI', '48201', 'USA', 'Active', 'Recurring'),
('Blue Wave Shipping', 'Robert Thompson', 'rthompson@bluewave.com', '(555) 567-8901', '678 Harbor Boulevard', 'Seattle', 'WA', '98101', 'USA', 'Active', 'Regular'),
('Precision Electronics', 'Jennifer White', 'jwhite@precisionelec.com', '(555) 678-9012', '4567 Circuit Drive', 'San Jose', 'CA', '95101', 'USA', 'Active', 'Recurring'),
('Summit Healthcare', 'William Brown', 'wbrown@summithc.com', '(555) 789-0123', '123 Medical Plaza', 'Boston', 'MA', '02101', 'USA', 'Active', 'Regular'),
('Coastal Logistics', 'Amanda Garcia', 'agarcia@coastallog.com', '(555) 890-1234', '789 Port Road', 'Miami', 'FL', '33101', 'USA', 'Active', 'Regular'),
('Midwest Automotive', 'James Wilson', 'jwilson@midwestauto.com', '(555) 901-2345', '321 Motor Avenue', 'Indianapolis', 'IN', '46201', 'USA', 'Active', 'Recurring'),
('Pacific Tech Systems', 'Emily Davis', 'edavis@pacifictech.com', '(555) 012-3456', '456 Silicon Street', 'Portland', 'OR', '97201', 'USA', 'Active', 'Regular'),
('Urban Development Co', 'Christopher Lee', 'clee@urbandevelopment.com', '(555) 123-7890', '890 Downtown Boulevard', 'Denver', 'CO', '80201', 'USA', 'Active', 'One-Time'),
('Star Industries', 'Patricia Miller', 'pmiller@starindustries.com', '(555) 234-8901', '2345 Manufacturing Way', 'Houston', 'TX', '77001', 'USA', 'Active', 'Regular'),
('River Valley Foods', 'Daniel Taylor', 'dtaylor@rivervalley.com', '(555) 345-9012', '567 Farm Road', 'Minneapolis', 'MN', '55401', 'USA', 'Active', 'Recurring'),
('Bright Future Solar', 'Mary Rodriguez', 'mrodriguez@brightfuture.com', '(555) 456-0123', '678 Renewable Lane', 'Phoenix', 'AZ', '85001', 'USA', 'Active', 'Regular'),
('Atlantic Marine Supply', 'Joseph Martinez', 'jmartinez@atlanticmarine.com', '(555) 567-1234', '123 Dock Street', 'Baltimore', 'MD', '21201', 'USA', 'Inactive', 'Regular'),
('Global Tech Partners', 'Susan Clark', 'sclark@globaltechp.com', '(555) 678-2345', '456 Technology Parkway', 'Atlanta', 'GA', '30301', 'USA', 'Active', 'Recurring'),
('Mountain View Supplies', 'Thomas Lewis', 'tlewis@mountainview.com', '(555) 789-3456', '789 Summit Drive', 'Salt Lake City', 'UT', '84101', 'USA', 'Active', 'Regular'),
('Eastern Electric Co', 'Nancy Walker', 'nwalker@easternelectric.com', '(555) 890-4567', '234 Power Street', 'Philadelphia', 'PA', '19101', 'USA', 'Active', 'Regular'),
('Western Wholesale', 'Kevin Hall', 'khall@westernwholesale.com', '(555) 901-5678', '567 Distribution Center', 'Las Vegas', 'NV', '89101', 'USA', 'Active', 'One-Time'),
('Northern Industries', 'Karen Young', 'kyoung@northernind.com', '(555) 012-6789', '890 Factory Lane', 'Milwaukee', 'WI', '53201', 'USA', 'Suspended', 'Regular');

-- Display confirmation
SELECT COUNT(*) as 'Total Customers Added' FROM customers;
