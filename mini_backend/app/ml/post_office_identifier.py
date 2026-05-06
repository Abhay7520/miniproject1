import random
from typing import Dict, Any

class SmartPostOfficeModel:
    """
    Smart Post Office Identification Model.
    In a real-world scenario, this would use geospatial APIs (like Google Maps) 
    and real-time capacity metrics to route parcels to the optimal hub.
    For this implementation, we use a heuristic based on region mapping and 
    simulated load balancing.
    """
    def __init__(self):
        # Base knowledge of regional postal hubs
        self.regional_hubs = {
            "Northeast": {"name": "New York Metro Hub", "location": "New York, NY", "base_capacity": 10000},
            "Midwest": {"name": "Chicago Central Hub", "location": "Chicago, IL", "base_capacity": 8500},
            "South": {"name": "Atlanta Distribution Center", "location": "Atlanta, GA", "base_capacity": 9000},
            "Southwest": {"name": "Houston Logistics Center", "location": "Houston, TX", "base_capacity": 7500},
            "West": {"name": "Los Angeles Super Hub", "location": "Los Angeles, CA", "base_capacity": 12000},
        }
        
        # State to Region mapping
        self.state_to_region = {
            "NY": "Northeast", "PA": "Northeast", "NJ": "Northeast", "MA": "Northeast", "CT": "Northeast",
            "IL": "Midwest", "OH": "Midwest", "MI": "Midwest", "IN": "Midwest", "WI": "Midwest",
            "GA": "South", "FL": "South", "NC": "South", "VA": "South", "TN": "South",
            "TX": "Southwest", "AZ": "Southwest", "NM": "Southwest", "OK": "Southwest",
            "CA": "West", "WA": "West", "OR": "West", "NV": "West", "UT": "West"
        }

    def _get_region_for_state(self, state: str) -> str:
        # Fallback to a random region if state is unknown to distribute load
        return self.state_to_region.get(state, random.choice(list(self.regional_hubs.keys())))

    def identify_optimal_office(self, city: str, state: str) -> Dict[str, Any]:
        """
        Identifies the nearest and most efficient post office based on the destination/origin.
        """
        region = self._get_region_for_state(state)
        hub = self.regional_hubs[region]
        
        # Simulate real-time metrics
        # For a truly smart system, this load would come from a database of current operations
        current_load_percentage = random.randint(40, 95)
        efficiency_score = 100 - current_load_percentage + random.randint(0, 10)
        
        # Determine operational status based on load
        if current_load_percentage > 90:
            status = "Overloaded - Expect Delays"
            rerouted = True
            # Simulate rerouting to nearest neighbor
            alt_region = random.choice([r for r in self.regional_hubs.keys() if r != region])
            hub = self.regional_hubs[alt_region]
            current_load_percentage = random.randint(40, 70)
            efficiency_score = 100 - current_load_percentage
        else:
            status = "Optimal"
            rerouted = False

        return {
            "assigned_hub": hub["name"],
            "hub_location": hub["location"],
            "region": region,
            "metrics": {
                "current_load": f"{current_load_percentage}%",
                "efficiency_score": min(100, efficiency_score),
                "status": status
            },
            "was_rerouted": rerouted,
            "reasoning": f"Hub selected based on geographic proximity to {city}, {state} with load balancing applied."
        }

# Singleton instance
post_office_identifier = SmartPostOfficeModel()
