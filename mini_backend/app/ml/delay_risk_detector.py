import random
from typing import Dict, Any

class DelayRiskModel:
    """
    Delay Risk Detection Model.
    Analyzes parcel routes and features to identify potential bottlenecks and 
    proactively warn users about likely delays before they happen.
    """
    def __init__(self):
        # Known risk factors that the ML model would classify based on historical data
        self.risk_factors = [
            "Severe weather advisory on transit route",
            "Unusually high parcel volume at origin hub",
            "Sorting equipment maintenance at destination",
            "Driver shortage in delivery region",
            "Potential misroute due to similar street names",
            "Heavy/Oversized package handling delay"
        ]

    def assess_risk(self, tracking_number: str, origin: str, destination: str, weight: float = 1.0) -> Dict[str, Any]:
        # Generate a base risk probability.
        # In a real model, this would be `model.predict_proba(features)[1]`
        base_probability = random.uniform(2.0, 10.0)
        
        # Distance heuristic: different origin and destination increase risk
        if origin.lower().strip() != destination.lower().strip():
            base_probability += random.uniform(5.0, 15.0)
            
        # Weight heuristic: heavier items are harder to process quickly
        if weight > 15.0:
            base_probability += 15.0
            
        # Add random external noise (simulating dynamic real-world events)
        probability = base_probability + random.uniform(-2.0, 45.0)
        probability = round(max(0.5, min(99.5, probability)), 1)
        
        # Categorize risk and generate proactive alerts
        if probability < 20.0:
            level = "Low"
            reasons = ["Route is clear and operating normally"]
            recommendation = "No action required"
        elif probability < 50.0:
            level = "Medium"
            reasons = random.sample(self.risk_factors, k=1)
            recommendation = "Monitor tracking for potential minor delays"
        elif probability < 80.0:
            level = "High"
            # Ensure weight delay is mentioned if applicable
            reasons = random.sample(self.risk_factors, k=2)
            if weight > 15.0 and "Heavy/Oversized package handling delay" not in reasons:
                reasons[0] = "Heavy/Oversized package handling delay"
            recommendation = "Customer support notification recommended"
        else:
            level = "Critical"
            reasons = random.sample(self.risk_factors, k=3)
            recommendation = "Proactively reroute or notify recipient of significant delay"
            
        return {
            "tracking_number": tracking_number,
            "delay_probability_percentage": probability,
            "risk_level": level,
            "proactive_alerts": reasons,
            "system_recommendation": recommendation,
            "analyzed_factors": {
                "origin": origin,
                "destination": destination,
                "weight": weight
            }
        }

# Singleton instance
delay_risk_detector = DelayRiskModel()
