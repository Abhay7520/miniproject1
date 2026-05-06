import random
from typing import Dict, Any, List

class AnomalyDetectionModel:
    """
    Anomaly Detection Model.
    Flags stuck parcels, overloaded offices, and repeated route failures.
    In a production system, this would utilize Unsupervised Learning algorithms 
    like Isolation Forests or Autoencoders to detect deviations from normal delivery patterns.
    """
    def __init__(self):
        self.anomaly_types = [
            "Stuck Parcel: No tracking update for > 48 hours",
            "Repeated Route Failure: Delivery attempted but failed multiple times",
            "Overloaded Hub: Current location processing time > 3x normal",
            "Suspicious Weight Change: Package weight deviated significantly between scans",
            "Geographical Loop: Parcel bouncing back and forth between two facilities"
        ]

    def detect_anomalies(self, tracking_number: str, days_in_transit: int, scan_count: int, last_scan_hours_ago: int) -> Dict[str, Any]:
        anomalies = []
        anomaly_score = 0.0
        
        # 1. Stuck parcel detection
        if last_scan_hours_ago > 48:
            anomalies.append(self.anomaly_types[0])
            # The longer it's stuck, the higher the score
            anomaly_score += min(50.0, last_scan_hours_ago * 0.5)
            
        # 2. Geographical Loop or Repeated Route Failure
        # If it's been scanned way too many times for the days in transit, it might be looping.
        if days_in_transit > 0 and scan_count > (days_in_transit * 4):
            anomalies.append(self.anomaly_types[4])
            anomaly_score += 40.0
            
        # 3. Simulate Hub overload or repeated failure (randomly injected based on transit time)
        if days_in_transit > 5 and random.random() < 0.3:
            anomalies.append(self.anomaly_types[1])
            anomaly_score += 35.0
            
        if random.random() < 0.1:
            anomalies.append(self.anomaly_types[2])
            anomaly_score += 25.0
            
        # 4. Normalization
        anomaly_score = min(100.0, anomaly_score)
        
        # We classify it as an anomaly if the score crosses a certain threshold (e.g., 30)
        is_anomaly = anomaly_score >= 30.0
        
        # Determine urgency
        if anomaly_score >= 80:
            urgency = "Critical"
            action = "Immediate manual intervention and customer notification required."
        elif anomaly_score >= 50:
            urgency = "High"
            action = "Investigate route and contact carrier facility."
        elif anomaly_score >= 30:
            urgency = "Medium"
            action = "Flag for monitoring."
        else:
            urgency = "Low"
            action = "None"
            
        return {
            "tracking_number": tracking_number,
            "is_anomaly_detected": is_anomaly,
            "anomaly_score_percentage": round(anomaly_score, 1),
            "urgency_level": urgency,
            "detected_anomalies": anomalies,
            "recommended_action": action
        }

# Singleton instance
anomaly_detector = AnomalyDetectionModel()
