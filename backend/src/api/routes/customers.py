from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from src.services import customers_service
from ..auth.dependencies import require_role
from ..auth.router import get_current_user
from ..supabase_client import supabase_admin

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
    customer_name: str
    billing_address: str


class CustomerUpdate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    customer_id: int

@router.get("/")
def read_customers(_user=Depends(require_role("driver"))):
    return customers_service.get_all_customers()


@router.get("/{customer_id}")
def read_customer(customer_id: int, _user=Depends(require_role("driver"))):
    if customer_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    customer = customers_service.get_customer(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/")
def create_customer(customer: CustomerCreate, _user=Depends(require_role("driver"))):
    try:
        return customers_service.create_customer(customer.model_dump())
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create customer")


@router.put("/{customer_id}")
def update_customer(customer_id: int, customer: CustomerUpdate, _user=Depends(require_role("driver"))):
    if customer_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    try:
        updated = customers_service.update_customer(
            customer_id, customer.model_dump(exclude_unset=True)
        )
        if updated is None or []:
            raise HTTPException(status_code=404, detail="Customer not found")
        return updated
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update customer")



@router.get("/customers")
async def list_customers(user: dict = Depends(require_role("customer"))):
    return {"message": "List of customers", "current_user_id": user["id"]}


class CustomerSignupPayload(BaseModel):
    customer_name: str = Field(min_length=1)
    billing_address: Optional[str] = None
    phone_number: str = Field(min_length=1)
    street_address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    state: str = Field(min_length=1)
    zipcode: str = Field(min_length=1)


def _require_admin_client():
    if supabase_admin is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_SERVICE_ROLE_KEY is required for customer profile writes",
        )
    return supabase_admin


def upsert_customer_row(client, user_id: str, payload: CustomerSignupPayload) -> dict:
    phone_number = payload.phone_number.strip()

    billing_address = (payload.billing_address or "").strip() or payload.street_address
    customer_payload = {
        "user_id": user_id,
        "customer_name": payload.customer_name,
        "billing_address": billing_address,
        "phone_number": phone_number,
    }

    try:
        customer_response = (
            client.table("customers")
            .upsert(customer_payload, on_conflict="user_id")
            .execute()
        )
        customer_data = customer_response.data or []
        if customer_data:
            return customer_data[0]
    except Exception:
        pass

    existing_response = (
        client.table("customers")
        .select("customer_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    existing_rows = existing_response.data or []

    if existing_rows:
        customer_id = existing_rows[0]["customer_id"]
        updated_response = (
            client.table("customers")
            .update(customer_payload)
            .eq("customer_id", customer_id)
            .execute()
        )
        updated_data = updated_response.data or []
        if updated_data:
            return updated_data[0]
    else:
        inserted_response = client.table("customers").insert(customer_payload).execute()
        inserted_data = inserted_response.data or []
        if inserted_data:
            return inserted_data[0]

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create customer profile",
    )


@router.post("/customers/signup")
async def signup_customer(
    payload: CustomerSignupPayload,
    user: dict = Depends(get_current_user),
):
    client = _require_admin_client()
    user_id = user["id"]

    try:
        users_response = (
            client.table("users")
            .upsert({"id": user_id, "role": "customer"}, on_conflict="id")
            .execute()
        )

        users_data = users_response.data or []
        if not users_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upsert user role",
            )

        customer_row = upsert_customer_row(client, user_id, payload)
        customer_id = customer_row["customer_id"]
        location_query_response = (
            client.table("service_locations")
            .select("location_id")
            .eq("customer_id", customer_id)
            .limit(1)
            .execute()
        )
        existing_location_rows = location_query_response.data or []

        location_payload = {
            "customer_id": customer_id,
            "street_address": payload.street_address,
            "city": payload.city,
            "state": payload.state,
            "zipcode": payload.zipcode,
            "job_id": None,
        }

        if existing_location_rows:
            location_id = existing_location_rows[0]["location_id"]
            location_response = (
                client.table("service_locations")
                .update(location_payload)
                .eq("location_id", location_id)
                .execute()
            )
        else:
            location_response = (
                client.table("service_locations").insert(location_payload).execute()
            )

        location_data = location_response.data or []
        if not location_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save service location",
            )

        return {
            "user": users_data[0],
            "customer": customer_row,
            "service_location": location_data[0],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Customer signup failed: {exc}",
        )
@router.delete("/{customer_id}")
def delete_customer(customer_id: int, _user=Depends(require_role("driver"))):
    if customer_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    try:
        deleted = customers_service.delete_customer(customer_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete customer")
