# Clipper 2.0 - FastAPI Backend

## Overview
Python FastAPI backend for the Clipper 2.0 Inventory and Order Management System.

## Features
- RESTful API with automatic OpenAPI documentation
- MySQL database integration
- Customer management (CRUD operations)
- Input validation with Pydantic
- CORS enabled for frontend integration
- Connection pooling for better performance

## Requirements
- Python 3.9+
- MySQL Server 8.0+

## Installation

1. **Create a virtual environment (recommended):**
```bash
cd python_server
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
Make sure your `.env` file in the root directory has:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clipper_db
DB_PORT=3306
PORT=5000
```

## Running the Server

```bash
# From the python_server directory
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 5000
```

The server will start on http://localhost:5000

## API Documentation

Once the server is running, access:
- **Swagger UI:** http://localhost:5000/docs
- **ReDoc:** http://localhost:5000/redoc

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers (with pagination)
  - Query params: `page`, `page_size`, `search`, `status`
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

## Project Structure
```
python_server/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── config/
│   ├── __init__.py
│   └── database.py      # Database connection and pooling
├── models/
│   ├── __init__.py
│   └── customer.py      # Pydantic models for validation
└── routes/
    ├── __init__.py
    └── customers.py     # Customer API endpoints
```

## Testing

You can test the API using:
1. **Swagger UI** at `/docs`
2. **Postman** or **Thunder Client**
3. **curl** commands

Example curl:
```bash
# Get all customers
curl http://localhost:5000/api/customers

# Get customer by ID
curl http://localhost:5000/api/customers/1

# Create customer
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Test Company", "email": "test@example.com"}'
```

## Development

- The server runs with auto-reload enabled in development mode
- Check logs for database connection status
- Use `/health` endpoint to verify server status
