from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user" # user, staff, admin

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Parcel Schemas ---
class ParcelCreate(BaseModel):
    sender_name: str
    sender_phone: Optional[str] = None
    receiver_name: str
    receiver_phone: Optional[str] = None
    origin_city: str
    destination_city: str
    weight: float

class ParcelResponse(BaseModel):
    id: int
    tracking_number: str
    sender_name: str
    sender_phone: Optional[str]
    receiver_name: str
    receiver_phone: Optional[str]
    origin_city: str
    destination_city: str
    weight: float
    status: str
    created_at: datetime
    eta: Optional[datetime]
    risk_level: str
    user_id: Optional[int]

    class Config:
        from_attributes = True

class ParcelStatusUpdate(BaseModel):
    status: str
