from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="user") # user, staff, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    parcels = relationship("Parcel", back_populates="owner")

class PostOffice(Base):
    __tablename__ = "post_offices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    pincode = Column(String, nullable=True)
    current_load = Column(Integer, default=0)

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True)
    sender_name = Column(String)
    sender_phone = Column(String, nullable=True)
    receiver_name = Column(String)
    receiver_phone = Column(String, nullable=True)
    origin_city = Column(String)
    destination_city = Column(String)
    weight = Column(Float)
    priority = Column(String) # low, medium, high
    status = Column(String, default="Processing")
    eta = Column(DateTime, nullable=True)
    delay_risk = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Link to User
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="parcels")
