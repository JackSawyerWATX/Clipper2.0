"""
Customer Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class CustomerStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"

class CustomerType(str, Enum):
    ONE_TIME = "One-Time"
    REGULAR = "Regular"
    RECURRING = "Recurring"

class CustomerBase(BaseModel):
    company_name: str = Field(..., max_length=255)
    contact_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address_street: Optional[str] = Field(None, max_length=255)
    address_city: Optional[str] = Field(None, max_length=100)
    address_state: Optional[str] = Field(None, max_length=50)
    address_zip: Optional[str] = Field(None, max_length=20)
    address_country: Optional[str] = Field(None, max_length=100)
    status: CustomerStatus = CustomerStatus.ACTIVE
    customer_type: CustomerType = CustomerType.REGULAR

class CustomerCreate(CustomerBase):
    """Schema for creating a new customer"""
    pass

class CustomerUpdate(BaseModel):
    """Schema for updating a customer (all fields optional)"""
    company_name: Optional[str] = Field(None, max_length=255)
    contact_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address_street: Optional[str] = Field(None, max_length=255)
    address_city: Optional[str] = Field(None, max_length=100)
    address_state: Optional[str] = Field(None, max_length=50)
    address_zip: Optional[str] = Field(None, max_length=20)
    address_country: Optional[str] = Field(None, max_length=100)
    status: Optional[CustomerStatus] = None
    customer_type: Optional[CustomerType] = None

class CustomerResponse(CustomerBase):
    """Schema for customer response"""
    customer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CustomerListResponse(BaseModel):
    """Schema for paginated customer list"""
    customers: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
