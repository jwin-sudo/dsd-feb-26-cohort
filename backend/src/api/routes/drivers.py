from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..auth.dependencies import require_role
from ..auth.router import get_current_user
from ..supabase_client import supabase_admin
from src.services.driver_service import list_drivers as list_drivers_service

router = APIRouter()


@router.get("/drivers")
def list_drivers(_user: dict = Depends(require_role("driver"))):
    return {"drivers": list_drivers_service()}


class DriverSignupPayload(BaseModel):
    driver_name: str = Field(min_length=1)


def _require_admin_client():
    if supabase_admin is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_SERVICE_ROLE_KEY is required for driver profile writes",
        )
    return supabase_admin


@router.post("/drivers/signup")
async def signup_driver(
    payload: DriverSignupPayload,
    user: dict = Depends(get_current_user),
):
    client = _require_admin_client()
    user_id = user["id"]

    try:
        users_response = (
            client.table("users")
            .upsert({"id": user_id, "role": "driver"}, on_conflict="id")
            .execute()
        )
        users_data = users_response.data or []
        if not users_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upsert user role",
            )

        driver_response = (
            client.table("drivers")
            .upsert(
                {
                    "user_id": user_id,
                    "driver_name": payload.driver_name,
                },
                on_conflict="user_id",
            )
            .execute()
        )

        driver_data = driver_response.data or []
        if not driver_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create driver profile",
            )

        return {"user": users_data[0], "driver": driver_data[0]}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Driver signup failed: {exc}",
        )
