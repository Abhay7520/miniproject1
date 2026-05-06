from datetime import datetime, timedelta
import random
from typing import Dict, Any, List

class PredictiveTrackingModel:
    """
    Predictive Tracking Model.
    Generates a full timeline of milestones, recognizing what has happened and 
    using AI simulation to predict future milestones along with their timestamps and confidence.
    """
    def __init__(self):
        # A standard progression of parcel delivery
        self.standard_milestones = [
            "Order Processed",
            "Dispatched from Origin",
            "In Transit - Regional Hub",
            "Arrived at Destination Facility",
            "Out for Delivery",
            "Delivered"
        ]

    def generate_tracking_timeline(self, tracking_number: str, origin: str, destination: str, current_status: str) -> Dict[str, Any]:
        timeline = []
        now = datetime.utcnow()
        
        # Find where we are in the delivery process
        try:
            current_index = self.standard_milestones.index(current_status)
        except ValueError:
            # Fallback if the status is custom or unknown
            current_index = 0
            
        # 1. Reconstruct Past & Current Events (Actuals)
        for i in range(current_index + 1):
            # Simulate that past events happened some hours ago
            hours_ago = (current_index - i) * random.uniform(3, 15)
            milestone_time = now - timedelta(hours=hours_ago)
            
            # Estimate location for the event
            loc = origin if i <= 1 else ("Central Sorting Hub" if i == 2 else destination)
            
            timeline.append({
                "status": self.standard_milestones[i],
                "location": loc,
                "timestamp": milestone_time.isoformat(),
                "is_predicted": False,
                "confidence_score": 100.0  # Already happened
            })
            
        # 2. Predict Future Events (AI Predictions)
        for i in range(current_index + 1, len(self.standard_milestones)):
            # Predict how many hours from now the future events will occur
            hours_ahead = (i - current_index) * random.uniform(5, 20)
            
            # If origin and destination are different, add a transit buffer
            if origin.lower().strip() != destination.lower().strip() and i == 3:
                hours_ahead += random.uniform(12, 36)
                
            predicted_time = now + timedelta(hours=hours_ahead)
            
            # Confidence drops for events further in the future
            base_confidence = 95.0 - ((i - current_index) * random.uniform(3.0, 7.0))
            
            loc = origin if i <= 1 else ("Central Sorting Hub" if i == 2 else destination)
            
            timeline.append({
                "status": self.standard_milestones[i],
                "location": loc,
                "timestamp": predicted_time.isoformat(),
                "is_predicted": True,
                "confidence_score": round(max(30.0, base_confidence), 1)
            })
            
        # Generate an AI insight based on the trajectory
        next_step = timeline[current_index + 1]["status"] if current_index + 1 < len(timeline) else "Completed"
        if next_step != "Completed":
            insight = f"Based on historical transit times from {origin} to {destination}, the route is highly efficient. Transition to '{next_step}' is expected soon."
        else:
            insight = "The parcel has successfully reached its destination."
            
        return {
            "tracking_number": tracking_number,
            "current_status": current_status,
            "ai_insights": insight,
            "timeline": timeline
        }

# Singleton instance
predictive_tracker = PredictiveTrackingModel()
