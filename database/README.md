# Clipper 2.0 Database Setup

## Prerequisites
- MySQL Server installed (MySQL 8.0+ recommended)
- MySQL running on localhost:3306

## Setup Instructions

### 1. Create the Database

Open MySQL command line or MySQL Workbench and run:

```bash
mysql -u root -p < schema.sql
```

Or manually execute the SQL file in MySQL Workbench.

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the root directory and update:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=clipper_db
DB_PORT=3306
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on http://localhost:5000

## Database Structure

### Tables Created:
1. **customers** - Customer information and addresses
2. **suppliers** - Supplier/vendor directory
3. **inventory** - Product inventory with stock levels
4. **orders** - Customer orders with status tracking
5. **customer_orders** - Order line items (order-item relationships)
6. **past_analytics** - Historical analytics data
7. **users** - User accounts with role-based permissions
8. **shipments** - Shipment tracking information
9. **payments** - Payment transaction records

## Sample Data

The schema includes sample data for:
- 3 Customers
- 4 Suppliers
- 5 Inventory Items
- 1 Admin User

## API Endpoints

Once the server is running, access the API at:

- Customers: `http://localhost:5000/api/customers`
- Orders: `http://localhost:5000/api/orders`
- Suppliers: `http://localhost:5000/api/suppliers`
- Inventory: `http://localhost:5000/api/inventory`
- Customer Orders: `http://localhost:5000/api/customer-orders`
- Analytics: `http://localhost:5000/api/analytics`
- Users: `http://localhost:5000/api/users`
- Shipments: `http://localhost:5000/api/shipments`
- Payments: `http://localhost:5000/api/payments`

## Testing the Connection

Visit http://localhost:5000 to see API documentation and available endpoints.
