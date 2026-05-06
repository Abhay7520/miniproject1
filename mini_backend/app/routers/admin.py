from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_parcels = db.query(models.Parcel).count()
    total_users = db.query(models.User).count()
    
    # Calculate revenue (simplified: 100 per parcel + 10 per kg)
    # In a real app, you'd have a 'price' column in the Parcel model.
    # For now, let's just count.
    parcels = db.query(models.Parcel).all()
    revenue = sum([100 + (p.weight * 10) for p in parcels])
    
    delivered = db.query(models.Parcel).filter(models.Parcel.status == "Delivered").count()
    in_transit = db.query(models.Parcel).filter(models.Parcel.status == "In Transit").count()
    processing = db.query(models.Parcel).filter(models.Parcel.status == "Processing").count()
    
    return {
        "total_parcels": total_parcels,
        "total_users": total_users,
        "revenue": revenue,
        "delivered": delivered,
        "in_transit": in_transit,
        "processing": processing
    }
