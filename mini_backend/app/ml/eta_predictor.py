import random
from datetime import datetime, timedelta
from typing import Dict, Any

class DeliveryETAModel:
    """
    ML-Powered Delivery ETA Predictor.
    Simulates predictions based on distance, traffic, weather, and priority data.
    In production, this would use a Random Forest or Gradient Boosting model 
    trained on historical delivery timestamps.
    """
    def __init__(self):
        # Baseline delivery days based on priority level
        self.priority_base_days = {
            "overnight": 1,
            "express": 2,
            "standard": 4
        }
        
        self.weather_conditions = ["Clear", "Cloudy", "Rain", "Heavy Rain", "Snow", "Storm"]

    def predict_eta(self, origin: str, destination: str, priority: str = "standard", weight: float = 1.0) -> Dict[str, Any]:
        base_days = self.priority_base_days.get(priority.lower(), 4)
        
        # 1. Simulate distance impact (assume cross-country if strings are very different)
        # Just a heuristic: if origin is different from destination, add distance delay
        if origin.lower().strip() != destination.lower().strip():
            distance_delay = random.uniform(0.5, 3.0)
        else:
            distance_delay = random.uniform(0.1, 0.5)
            
        # 2. Simulate weather impact
        weather = random.choice(self.weather_conditions)
        weather_delay = 0.0
        if weather in ["Snow", "Heavy Rain", "Storm"]:
            weather_delay = random.uniform(0.5, 2.5)
            
        # 3. Simulate traffic/operational delays
        traffic_delay = random.uniform(0.0, 1.2)
        
        # 4. Weight impact: heavy packages (>20kg) take longer to load/unload
        weight_delay = 0.5 if weight > 20 else 0.0
        
        total_days = base_days + distance_delay + weather_delay + traffic_delay + weight_delay
        
        # Calculate absolute ETA Date
        eta_date = datetime.utcnow() + timedelta(days=total_days)
        
        # Confidence score calculation
        # The further out the delivery, or the worse the weather, the lower the confidence
        confidence = 98 - (weather_delay * 10) - (traffic_delay * 5) - (distance_delay * 2)
        
        return {
            "origin": origin,
            "destination": destination,
            "predicted_eta_date": eta_date.isoformat(),
            "estimated_days": round(total_days, 1),
            "confidence_score": round(max(60.0, min(99.9, confidence)), 1),
            "environmental_factors": {
                "weather_condition": weather,
                "weather_delay_days": round(weather_delay, 1),
                "traffic_delay_days": round(traffic_delay, 1)
            },
            "operational_factors": {
                "priority_level": priority,
                "weight_impact_days": weight_delay
            }
        }

# Singleton instance
eta_predictor = DeliveryETAModel()
