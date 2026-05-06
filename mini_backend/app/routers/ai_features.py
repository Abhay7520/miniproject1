from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.ml.address_validation import address_validator
from app.ml.post_office_identifier import post_office_identifier
from app.ml.eta_predictor import eta_predictor
from app.ml.delay_risk_detector import delay_risk_detector
from app.ml.anomaly_detector import anomaly_detector
from app.ml.predictive_tracking import predictive_tracker
from app.database import get_db
from app import models

router = APIRouter(prefix="/ai", tags=["AI Features"])

class AddressRequest(BaseModel):
    address: str

@router.post("/validate_address")
def validate_address(payload: AddressRequest):
    """
    AI Address Validation Endpoint
    Parses and standardizes an address for error-free deliveries.
    """
    result = address_validator.validate_and_parse(payload.address)
    return result

@router.get("/validate_all_addresses")
def validate_all_addresses(db: Session = Depends(get_db)):
    """
    Fetches all parcels from the database and validates their origin and destination.
    """
    parcels = db.query(models.Parcel).all()
    results = []
    
    for parcel in parcels:
        origin_val = address_validator.validate_and_parse(parcel.origin_city)
        dest_val = address_validator.validate_and_parse(parcel.destination_city)
        
        results.append({
            "tracking_number": parcel.tracking_number,
            "origin_city": parcel.origin_city,
            "origin_validation": origin_val,
            "destination_city": parcel.destination_city,
            "destination_validation": dest_val
        })
        
    return {
        "total_parcels_checked": len(parcels),
        "results": results
    }

class PostOfficeRequest(BaseModel):
    city: str
    state: str

@router.post("/smart_post_office")
def get_smart_post_office(payload: PostOfficeRequest):
    """
    Smart Post Office ID Endpoint
    Automatically identifies the nearest and most efficient post office based on location.
    """
    result = post_office_identifier.identify_optimal_office(
        city=payload.city,
        state=payload.state
    )
    return result

class ETARequest(BaseModel):
    origin: str
    destination: str
    priority: str = "standard"
    weight: float = 1.0

@router.post("/predict_eta")
def predict_eta(payload: ETARequest):
    """
    Delivery ETA Prediction Endpoint
    ML-powered delivery time estimates using simulated traffic, weather & priority data.
    """
    result = eta_predictor.predict_eta(
        origin=payload.origin,
        destination=payload.destination,
        priority=payload.priority,
        weight=payload.weight
    )
    return result

class RiskRequest(BaseModel):
    tracking_number: str
    origin: str
    destination: str
    weight: float = 1.0

@router.post("/delay_risk")
def get_delay_risk(payload: RiskRequest):
    """
    Delay Risk Detection Endpoint
    Proactive alerts when potential delays are detected on your parcel route.
    """
    result = delay_risk_detector.assess_risk(
        tracking_number=payload.tracking_number,
        origin=payload.origin,
        destination=payload.destination,
        weight=payload.weight
    )
    return result

class AnomalyRequest(BaseModel):
    tracking_number: str
    days_in_transit: int
    scan_count: int
    last_scan_hours_ago: int

@router.post("/detect_anomalies")
def detect_anomalies(payload: AnomalyRequest):
    """
    Anomaly Detection Endpoint
    Flags stuck parcels, overloaded offices, and repeated route failures.
    """
    result = anomaly_detector.detect_anomalies(
        tracking_number=payload.tracking_number,
        days_in_transit=payload.days_in_transit,
        scan_count=payload.scan_count,
        last_scan_hours_ago=payload.last_scan_hours_ago
    )
    return result

class TrackingRequest(BaseModel):
    tracking_number: str
    origin: str
    destination: str
    current_status: str = "Order Processed"

@router.post("/predictive_tracking")
def get_predictive_tracking(payload: TrackingRequest):
    """
    Real-Time Predictive Tracking Endpoint
    Live milestone updates with AI-powered predictive status changes.
    """
    result = predictive_tracker.generate_tracking_timeline(
        tracking_number=payload.tracking_number,
        origin=payload.origin,
        destination=payload.destination,
        current_status=payload.current_status
    )
    return result
