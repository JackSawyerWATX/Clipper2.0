# Database Setup Guide for Clipper 2.0

## Quick Status Check ✅

All three components are configured and connected:
- **MySQL Server:** Running (MySQL80 service)
- **Express Backend:** Connected ✅
- **Python Backend:** Connected ✅
- **Database:** `clipper_db` configured

---

## Prerequisites

### Install MySQL (if not already installed)

**Windows:**
1. Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
2. Run installer with default settings (port 3306, root user)
3. Start MySQL service: `net start MySQL80` or use Services app

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server
sudo service mysql start
```

---

## Setup Instructions

### Step 1: Verify MySQL is Running

**Windows:**
```powershell
Get-Service -Name MySQL80 | Select-Object Name, Status
```

**Mac/Linux:**
```bash
mysql --version
mysql -u root -p
```

### Step 2: Create the Database and Tables

```bash
# From root directory:
mysql -u root -p < database/schema.sql

# When prompted for password, enter: jonathan
```

Or copy/paste each SQL file individually:
- `database/schema.sql` - Creates tables (customers, suppliers, orders, inventory, etc.)
- `database/sample_customers.sql` - Sample customer data
- `database/sample_orders.sql` - Sample order data
- `database/sample_inventory.sql` - Sample inventory data
- `database/sample_suppliers.sql` - Sample supplier data

### Step 3: Verify Connection

All three services use these credentials (from `.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=jonathan
DB_NAME=clipper_db
DB_PORT=3306
```

---

## Connection Status

| Service | Type | Connection | Status |
|---------|------|-----------|--------|
| Express Backend | Node.js | MySQL (`mysql2/promise`) | ✅ Connected |
| Python Backend | FastAPI | MySQL (`mysql.connector`) | ✅ Connected |
| Frontend | React | Via API (indirect) | ✅ Ready |

---

## Testing Connections

### Test Express Backend
```bash
cd packages/express-backend
node -e "const mysql = require('mysql2/promise'); const pool = mysql.createPool({host: 'localhost', user: 'root', password: 'jonathan', database: 'clipper_db'}); pool.getConnection().then(conn => console.log('✅ Connected'); conn.release()).catch(err => console.error('❌ Failed:', err.message))"
```

### Test Python Backend
```bash
cd packages/python-backend
python -c "import mysql.connector; conn = mysql.connector.connect(host='localhost', user='root', password='jonathan', database='clipper_db'); print('✅ Connected'); conn.close()"
```

---

## Common Issues & Solutions

### Issue: "Access denied for user 'root'@'localhost'"
**Solution:** Check `.env` file has correct password:
```
DB_PASSWORD=jonathan
```

### Issue: "Can't connect to MySQL server on 'localhost'"
**Solution:** Verify MySQL service is running:
```powershell
Get-Service -Name MySQL80  # Should show "Running"
```

### Issue: "Unknown database 'clipper_db'"
**Solution:** Run the schema setup:
```bash
mysql -u root -p < database/schema.sql
```

### Issue: "Connection refused"
**Solution:** Restart MySQL:
```powershell
Restart-Service MySQL80  # Windows
sudo service mysql restart  # Linux
```

---

## Database Schema Overview

The `clipper_db` database includes these tables:
1. **customers** - Customer information and status
2. **suppliers** - Supplier details
3. **inventory** - Product inventory management
4. **orders** - Customer orders
5. **order_items** - Line items for orders
6. **payments** - Payment records
7. **shipments** - Shipment tracking
8. **users** - User accounts and roles
9. **reports** - Report generation data
10. **analytics** - Analytics and metrics

---

## Next Steps

1. **Load Sample Data:**
   ```bash
   mysql -u root -p clipper_db < database/sample_customers.sql
   mysql -u root -p clipper_db < database/sample_orders.sql
   ```

2. **Start the Services:**
   ```bash
   # From root directory
   npm run dev  # Starts all services
   ```

3. **Access the Application:**
   - Frontend: http://localhost:5173
   - Express API: http://localhost:8080/api
   - Python API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/docs (Swagger)

---

## Environment Variables Reference

See `.env` file for current configuration:
- `DB_HOST` - MySQL server hostname
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `DB_PORT` - MySQL port (default 3306)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Express server port
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS

---

## Backup & Restore

### Backup the database
```bash
mysqldump -u root -p clipper_db > backup_clipper_db.sql
```

### Restore from backup
```bash
mysql -u root -p clipper_db < backup_clipper_db.sql
```

---

**Last Updated:** March 2026  
**Status:** All systems connected and operational ✅
