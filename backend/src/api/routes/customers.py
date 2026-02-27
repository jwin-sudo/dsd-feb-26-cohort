from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from src.services import customers_service
from ..auth.dependencies import require_role

router = APIRouter(
    prefix="/customers", 
    tags=["customers"]
)

class CustomerBase(BaseModel):
    customer_name: Optional[str] = None
    billing_address: Optional[str] = None
    phone_number: Optional[str] = None
    complains: Optional[str] = ""


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    customer_id: int

@router.get("/")
def read_customers(_user=Depends(require_role("driver"))):
    return customers_service.get_all_customers()


@router.get("/{customer_id}")
def read_customer(customer_id: int, _user=Depends(require_role("driver"))):
    customer = customers_service.get_customer(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/")
def create_customer(customer: CustomerCreate, _user=Depends(require_role("driver"))):
    return customers_service.create_customer(customer.model_dump())


@router.put("/{customer_id}")
def update_customer(customer_id: int, customer: CustomerUpdate, _user=Depends(require_role("driver"))):
    return customers_service.update_customer(
        customer_id, customer.model_dump(exclude_unset=True)
    )


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, _user=Depends(require_role("driver"))):
    return customers_service.delete_customer(customer_id)
