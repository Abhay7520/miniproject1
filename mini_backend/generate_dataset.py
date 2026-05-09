import pandas as pd
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

def generate_logistics_dataset(num_rows=5000):
    print(f"Generating synthetic dataset with {num_rows} rows...")
    
    cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"]
    city_coords = {
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

    data = []
    for _ in range(num_rows):
        source = np.random.choice(cities)
        dest = np.random.choice([c for c in cities if c != source])
        
        source_lat, source_lon = city_coords[source]
        dest_lat, dest_lon = city_coords[dest]
        
        # Calculate Haversine distance (approximate)
        R = 6371  # Earth radius in km
        dlat = np.radians(dest_lat - source_lat)
        dlon = np.radians(dest_lon - source_lon)
        a = np.sin(dlat/2)**2 + np.cos(np.radians(source_lat)) * np.cos(np.radians(dest_lat)) * np.sin(dlon/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        distance = R * c
        
        weight = np.random.uniform(0.1, 50.0)
        priority = np.random.choice(["low", "medium", "high"], p=[0.5, 0.3, 0.2])
        
        # Speed factor based on priority
        speed_map = {"low": 15, "medium": 25, "high": 40}  # km/h average including stops
        base_days = distance / (speed_map[priority] * 24)
        
        # Add noise and operational time
        delivery_days = base_days + np.random.uniform(0.5, 2.0) + (weight * 0.05)
        
        # Delay logic: 1 if delivery_days > threshold (e.g., base + 1.5 days)
        threshold = base_days + 1.5
        delay = 1 if delivery_days > threshold else 0
        
        data.append({
            "source_city": source,
            "dest_city": dest,
            "source_lat": source_lat,
            "source_lon": source_lon,
            "dest_lat": dest_lat,
            "dest_lon": dest_lon,
            "distance": distance,
            "weight": weight,
            "priority": priority,
            "delivery_days": round(delivery_days, 2),
            "delay": delay
        })
    
    df = pd.DataFrame(data)
    
    # Save to CSV
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/logistics_dataset.csv", index=False)
    print("Dataset saved to data/logistics_dataset.csv")

if __name__ == "__main__":
    generate_logistics_dataset()
