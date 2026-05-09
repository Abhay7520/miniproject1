from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, get_db
from app import models
from app.ml_utils import AIPostalService, CITY_COORDS, haversine
from datetime import datetime, timedelta
import uuid
import os
from pydantic import BaseModel
from typing import List, Optional
from passlib.context import CryptContext

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIPostal – Smart AI Postal System")

# --- CORS ---
# allow_credentials=True is INVALID with allow_origins=["*"]
# Must list exact origins. Read from env var for flexibility.
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:8080,https://miniproject1-e7bh-omgzs3onz-abhaylalganj05-4838s-projects.vercel.app"
)
allowed_origins = [o.strip() for o in allowed_origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- Pydantic Schemas ---
class UserSignup(BaseModel):
    email: str
    full_name: str
    password: str
    role: str = "user"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True

class ParcelCreate(BaseModel):
    sender_name: str
    sender_phone: Optional[str] = None
    receiver_name: str
    receiver_phone: Optional[str] = None
    origin_city: str
    destination_city: str
    weight: float
    priority: str = "medium"

class ParcelOut(BaseModel):
    id: int
    tracking_number: str
    sender_name: str
    receiver_name: str
    origin_city: str
    destination_city: str
    weight: float
    status: str
    created_at: datetime
    eta: Optional[datetime] = None
    delay_risk: bool

    class Config:
        from_attributes = True

class PostOfficeSchema(BaseModel):
    id: int
    name: str
    city: str
    latitude: float
    longitude: float
    pincode: Optional[str] = None
    current_load: int

    class Config:
        from_attributes = True

# --- Auth Helpers ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Simple token is email for this demo
    user = db.query(models.User).filter(models.User.email == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user

# --- Endpoints ---

@app.post("/auth/signup")
def signup(user_in: UserSignup, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        email=user_in.email,
        hashed_password=pwd_context.hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {
        "access_token": user.email, # Using email as token for simplicity
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@app.post("/parcels/", response_model=ParcelOut)
def create_parcel(parcel_in: ParcelCreate, db: Session = Depends(get_db)):
    # AI Address Intelligence (Standardize cities)
    std_origin = AIPostalService.standardize_address(parcel_in.origin_city)
    std_dest = AIPostalService.standardize_address(parcel_in.destination_city)
    
    # Predict ETA
    eta_days = AIPostalService.predict_eta(std_origin, std_dest, parcel_in.weight, parcel_in.priority)
    eta_date = datetime.utcnow() + timedelta(days=eta_days)
    
    # Predict Delay Risk
    s_coord = CITY_COORDS.get(std_origin, (0,0))
    d_coord = CITY_COORDS.get(std_dest, (0,0))
    dist = haversine(s_coord[0], s_coord[1], d_coord[0], d_coord[1])
    is_at_risk = AIPostalService.predict_delay_risk(dist, parcel_in.weight, parcel_in.priority, eta_days)
    
    tracking_num = "TRK" + str(uuid.uuid4())[:8].upper()
    
    new_parcel = models.Parcel(
        tracking_number=tracking_num,
        sender_name=parcel_in.sender_name,
        sender_phone=parcel_in.sender_phone,
        receiver_name=parcel_in.receiver_name,
        receiver_phone=parcel_in.receiver_phone,
        origin_city=parcel_in.origin_city,
        destination_city=parcel_in.destination_city,
        weight=parcel_in.weight,
        priority=parcel_in.priority,
        eta=eta_date,
        delay_risk=is_at_risk,
        status="Processing"
    )
    db.add(new_parcel)
    db.commit()
    db.refresh(new_parcel)
    return new_parcel

@app.get("/parcels/", response_model=List[ParcelOut])
def list_parcels(db: Session = Depends(get_db)):
    return db.query(models.Parcel).order_by(models.Parcel.created_at.desc()).all()

@app.get("/track/{tracking_number}")
def track_parcel(tracking_number: str, db: Session = Depends(get_db)):
    parcel = db.query(models.Parcel).filter(models.Parcel.tracking_number == tracking_number).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    # Dynamic status update based on ETA and created_at
    current_status = AIPostalService.get_tracking_status(datetime.utcnow(), parcel.eta)
    
    return {
        "tracking_number": parcel.tracking_number,
        "status": current_status,
        "origin_city": parcel.origin_city,
        "destination_city": parcel.destination_city,
        "eta": parcel.eta,
        "delay_risk": "High" if parcel.delay_risk else "Low",
        "created_at": parcel.created_at
    }

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_parcels = db.query(models.Parcel).count()
    delivered = db.query(models.Parcel).filter(models.Parcel.status == "Delivered").count()
    processing = db.query(models.Parcel).filter(models.Parcel.status == "Processing").count()
    in_transit = total_parcels - delivered - processing
    
    # Dummy revenue and user count
    return {
        "total_parcels": total_parcels,
        "delivered": delivered,
        "processing": processing,
        "in_transit": in_transit,
        "revenue": total_parcels * 250,
        "total_users": db.query(models.User).count()
    }

@app.get("/post-offices", response_model=List[PostOfficeSchema])
def get_post_offices(city: str = Query(None), search: str = Query(None), location: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.PostOffice)
    if city:
        query = query.filter(models.PostOffice.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(
            (models.PostOffice.name.ilike(f"%{search}%")) | 
            (models.PostOffice.city.ilike(f"%{search}%")) |
            (models.PostOffice.pincode.ilike(f"%{search}%"))
        )
        return query.limit(10).all()
    if location:
        from geopy.geocoders import Nominatim
        geolocator = Nominatim(user_agent="aipostal_app")
        try:
            loc_data = geolocator.geocode(location)
            if loc_data:
                lat, lon = loc_data.latitude, loc_data.longitude
                all_offices = db.query(models.PostOffice).all()
                nearby = []
                for office in all_offices:
                    dist = haversine(lat, lon, office.latitude, office.longitude)
                    if dist < 15:
                        nearby.append((office, dist))
                nearby.sort(key=lambda x: x[1])
                return [x[0] for x in nearby[:10]]
        except: pass
    return query.limit(10).all()

@app.get("/")
def root():
    return {"message": "AIPostal Smart API Online"}

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    if db.query(models.PostOffice).count() == 0:
        import csv, os
        csv_path = os.path.join("data", "post_offices.csv")
        if os.path.exists(csv_path):
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    db.add(models.PostOffice(
                        name=row['Name'], city=row['City'],
                        latitude=float(row['Latitude']), longitude=float(row['Longitude']),
                        pincode=row.get('Pincode'), current_load=0
                    ))
            db.commit()
    db.close()
