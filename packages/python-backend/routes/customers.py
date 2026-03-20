"""
Customer API routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import math
from config.database import get_db_connection
from models.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse
)

router = APIRouter(prefix="/api/customers", tags=["customers"])

def row_to_customer(row) -> dict:
    """Convert database row to customer dictionary"""
    return {
        "customer_id": row[0],
        "company_name": row[1],
        "contact_name": row[2],
        "email": row[3],
        "phone": row[4],
        "address_street": row[5],
        "address_city": row[6],
        "address_state": row[7],
        "address_zip": row[8],
        "address_country": row[9],
        "status": row[10],
        "customer_type": row[11],
        "created_at": row[12],
        "updated_at": row[13]
    }

@router.get("/", response_model=CustomerListResponse)
async def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Get all customers with pagination and optional filtering
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Build query with filters
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append(
                "(company_name LIKE %s OR contact_name LIKE %s OR email LIKE %s)"
            )
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
        
        if status:
            where_clauses.append("status = %s")
            params.append(status)
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM customers WHERE {where_sql}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Get paginated results
        offset = (page - 1) * page_size
        query = f"""
            SELECT customer_id, company_name, contact_name, email, phone,
                   address_street, address_city, address_state, address_zip,
                   address_country, status, customer_type, created_at, updated_at
            FROM customers
            WHERE {where_sql}
            ORDER BY customer_id DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [page_size, offset])
        rows = cursor.fetchall()
        
        customers = [row_to_customer(row) for row in rows]
        total_pages = math.ceil(total / page_size)
        
        cursor.close()
        connection.close()
        
        return {
            "customers": customers,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int):
    """
    Get a single customer by ID
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            SELECT customer_id, company_name, contact_name, email, phone,
                   address_street, address_city, address_state, address_zip,
                   address_country, status, customer_type, created_at, updated_at
            FROM customers
            WHERE customer_id = %s
        """
        cursor.execute(query, (customer_id,))
        row = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        return row_to_customer(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=CustomerResponse, status_code=201)
async def create_customer(customer: CustomerCreate):
    """
    Create a new customer
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            INSERT INTO customers (
                company_name, contact_name, email, phone,
                address_street, address_city, address_state, address_zip,
                address_country, status, customer_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            customer.company_name,
            customer.contact_name,
            customer.email,
            customer.phone,
            customer.address_street,
            customer.address_city,
            customer.address_state,
            customer.address_zip,
            customer.address_country,
            customer.status.value,
            customer.customer_type.value
        )
        
        cursor.execute(query, values)
        connection.commit()
        customer_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        # Fetch and return the created customer
        return await get_customer(customer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: int, customer: CustomerUpdate):
    """
    Update an existing customer
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if customer exists
        cursor.execute("SELECT customer_id FROM customers WHERE customer_id = %s", (customer_id,))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        values = []
        
        for field, value in customer.model_dump(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = %s")
                # Handle enum values
                if hasattr(value, 'value'):
                    values.append(value.value)
                else:
                    values.append(value)
        
        if not update_fields:
            cursor.close()
            connection.close()
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(customer_id)
        query = f"UPDATE customers SET {', '.join(update_fields)} WHERE customer_id = %s"
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        # Fetch and return the updated customer
        return await get_customer(customer_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: int):
    """
    Delete a customer
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if customer exists
        cursor.execute("SELECT customer_id FROM customers WHERE customer_id = %s", (customer_id,))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            raise HTTPException(status_code=404, detail="Customer not found")
        
        cursor.execute("DELETE FROM customers WHERE customer_id = %s", (customer_id,))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
