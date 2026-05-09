import joblib
import pandas as pd
import numpy as np
from rapidfuzz import process, fuzz
from datetime import datetime, timedelta
import os

# Load models and encoders
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
try:
    eta_model = joblib.load(os.path.join(MODEL_DIR, "eta_model.pkl"))
    delay_model = joblib.load(os.path.join(MODEL_DIR, "delay_model.pkl"))
    priority_encoder = joblib.load(os.path.join(MODEL_DIR, "priority_encoder.pkl"))
    delay_priority_encoder = joblib.load(os.path.join(MODEL_DIR, "delay_priority_encoder.pkl"))
except Exception as e:
    print(f"Error loading models: {e}")
    eta_model = None
    delay_model = None

# City coordinates for haversine and ML
CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.7041, 77.1025),
    "Bangalore": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867),
    "Ahmedabad": (23.0225, 72.5714),
    "Chennai": (13.0827, 80.2707),
    "Kolkata": (22.5726, 88.3639),
    "Surat": (21.1702, 72.8311),
    "Pune": (18.5204, 73.8567),
    "Jaipur": (26.9124, 75.7873)
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    return R * c

class AIPostalService:
    @staticmethod
    def standardize_address(address: str):
        """AI Address Intelligence using Fuzzy Matching"""
        address = address.lower().strip()
        # Find the most likely city from our known list
        best_match = process.extractOne(address, CITY_COORDS.keys(), scorer=fuzz.partial_ratio)
        if best_match and best_match[1] > 60:
            return best_match[0]
        return "Unknown"

    @staticmethod
    def select_post_office(city: str, post_offices: list):
        """Smart Post Office Selection using Haversine and simulated score"""
        if not post_offices:
            return None
        
        city_coord = CITY_COORDS.get(city)
        if not city_coord:
            return post_offices[0] # Fallback
        
        best_office = None
        min_distance = float('inf')
        
        for office in post_offices:
            dist = haversine(city_coord[0], city_coord[1], office.latitude, office.longitude)
            # Scoring: distance + load factor (simulated)
            score = dist + (office.current_load * 0.1)
            if score < min_distance:
                min_distance = score
                best_office = office
        
        return best_office

    @staticmethod
    def predict_eta(source_city: str, dest_city: str, weight: float, priority: str):
        """ML-based ETA Prediction"""
        if not eta_model:
            return 3.0 # Default
        
        s_coord = CITY_COORDS.get(source_city, (0,0))
        d_coord = CITY_COORDS.get(dest_city, (0,0))
        dist = haversine(s_coord[0], s_coord[1], d_coord[0], d_coord[1])
        
        try:
            priority_encoded = priority_encoder.transform([priority])[0]
        except:
            priority_encoded = 0
            
        features = pd.DataFrame([{
            "distance": dist,
            "weight": weight,
            "priority": priority_encoded,
            "source_lat": s_coord[0],
            "source_lon": s_coord[1],
            "dest_lat": d_coord[0],
            "dest_lon": d_coord[1]
        }])
        
        days = eta_model.predict(features)[0]
        return round(float(days), 2)

    @staticmethod
    def predict_delay_risk(distance: float, weight: float, priority: str, eta_days: float):
        """ML-based Delay Risk Prediction"""
        if not delay_model:
            return False
        
        try:
            priority_encoded = delay_priority_encoder.transform([priority])[0]
        except:
            priority_encoded = 0
            
        features = pd.DataFrame([{
            "distance": distance,
            "weight": weight,
            "priority": priority_encoded,
            "delivery_days": eta_days # Using predicted eta as a feature
        }])
        
        risk = delay_model.predict(features)[0]
        return bool(risk)

    @staticmethod
    def get_tracking_status(current_time: datetime, eta_time: datetime):
        """Predictive Tracking Logic"""
        if current_time > eta_time:
            return "Delayed"
        return "In Transit"
