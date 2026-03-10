from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from typing import Literal

from .supabase_auth import (
    get_user_by_email,
    update_user_password_by_email,
    upsert_user_role,
    verify_supabase_token,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer(auto_error=False)

class UpdateRolePayload(BaseModel):
    role: Literal["driver", "customer"]


class CheckEmailPayload(BaseModel):
    email: EmailStr


class DirectPasswordResetPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    if (
        credentials is None
        or credentials.scheme.lower() != "bearer"
        or not credentials.credentials.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    return await verify_supabase_token(credentials.credentials)

@router.get("/me")
async def me(user: dict = Depends(get_current_user)) -> dict:
    return user

@router.post("/role")
async def set_role(
    payload: UpdateRolePayload,
    user: dict = Depends(get_current_user),
) -> dict:
    user_row = upsert_user_role(user["id"], payload.role)
    return {"id": user["id"], "role": user_row.get("role")}


@router.post("/check-email")
async def check_email(payload: CheckEmailPayload) -> dict:
    user = await get_user_by_email(payload.email)
    return {"exists": bool(user)}


@router.post("/password/reset-direct")
async def reset_password_direct(payload: DirectPasswordResetPayload) -> dict:
    updated = update_user_password_by_email(payload.email, payload.password)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {"message": "Password updated successfully"}
