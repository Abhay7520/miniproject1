from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
import uuid

router = APIRouter(prefix="/parcels", tags=["parcels"])

@router.post("/", response_model=schemas.ParcelResponse)
def create_parcel(
    parcel: schemas.ParcelCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Generate a random tracking number
    tracking_number = f"AP-{uuid.uuid4().hex[:8].upper()}"
    
    db_parcel = models.Parcel(
        **parcel.dict(),
        tracking_number=tracking_number,
        user_id=current_user.id
    )
    db.add(db_parcel)
    db.commit()
    db.refresh(db_parcel)
    return db_parcel

@router.get("/{tracking_number}", response_model=schemas.ParcelResponse)
def get_parcel(tracking_number: str, db: Session = Depends(get_db)):
    parcel = db.query(models.Parcel).filter(models.Parcel.tracking_number == tracking_number).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel

@router.get("/", response_model=list[schemas.ParcelResponse])
def get_all_parcels(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # If staff or admin, return ALL parcels. If user, only return their own.
    if current_user.role in ["staff", "admin"]:
        return db.query(models.Parcel).order_by(models.Parcel.created_at.desc()).all()
    
    return db.query(models.Parcel).filter(models.Parcel.user_id == current_user.id).order_by(models.Parcel.created_at.desc()).all()

@router.put("/{tracking_number}/status", response_model=schemas.ParcelResponse)
def update_parcel_status(
    tracking_number: str,
    status_update: schemas.ParcelStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to update status")
    
    db_parcel = db.query(models.Parcel).filter(models.Parcel.tracking_number == tracking_number).first()
    if not db_parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    db_parcel.status = status_update.status
    db.commit()
    db.refresh(db_parcel)
    return db_parcel
