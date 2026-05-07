import re
from typing import Dict, Any

class AddressValidationModel:
    """
    AI-powered Address Validation Model (v1).
    For now, we use a robust heuristic rule-based approach to act as a 
    foundation. In production, this can be swapped with a Spacy NER model 
    or a HuggingFace transformer trained on address datasets.
    """
    def __init__(self):
        # We can load a real ML model here later
        self.states = [
    "TELANGANA", "ANDHRA PRADESH", "KARNATAKA",
    "MAHARASHTRA", "TAMIL NADU", "DELHI"
]
    
    def validate_and_parse(self, raw_address: str) -> Dict[str, Any]:
        """
        Parses and standardizes an address, assigning a confidence score.
        """
        raw_address_upper = raw_address.upper().strip()
        
        parsed = {
            "street_address": None,
            "city": None,
            "state": None,
            "postal_code": None,
            "country": "US" # Defaulting to US
        }
        
        confidence = 1.0
        warnings = []
        
        # 1. Extract ZIP code (5 digits or 5-4)
        zip_match = re.search(r'\b\d{6}\b', raw_address_upper)
        if zip_match:
            parsed["postal_code"] = zip_match.group(0)
            raw_address_upper = raw_address_upper.replace(zip_match.group(0), "").strip()
        else:
            confidence -= 0.3
            warnings.append("Missing Postal Code")
            
        # 2. Extract State
        state_match = None
        for state in self.states:
            if re.search(rf'\b{state}\b', raw_address_upper):
                state_match = state
                break
                
        if state_match:
            parsed["state"] = state_match
            raw_address_upper = re.sub(rf'\b{state_match}\b', "", raw_address_upper).strip()
        else:
            confidence -= 0.2
            warnings.append("Missing State")
            
        # 3. Extract City and Street
        # We look for a comma separator first
        parts = [p.strip(" ,") for p in raw_address_upper.split(',') if p.strip(" ,")]
        
        if len(parts) >= 2:
            parsed["city"] = parts[-1]
            parsed["street_address"] = ", ".join(parts[:-1])
        elif len(parts) == 1:
            # Fallback if no comma
            tokens = parts[0].split()
            if len(tokens) > 2:
                parsed["city"] = tokens[-1]
                parsed["street_address"] = " ".join(tokens[:-1])
                confidence -= 0.1
                warnings.append("Guessed City from last word")
            else:
                parsed["street_address"] = parts[0]
                confidence -= 0.2
                warnings.append("Could not determine City")
        else:
            confidence -= 0.4
            warnings.append("Address is too short or empty")
            
        # Determine overall validity
        is_valid = confidence >= 0.6 and parsed["street_address"] is not None and parsed["postal_code"] is not None
        
        return {
            "is_valid": is_valid,
            "confidence_score": max(0.0, min(1.0, confidence)),
            "standardized_address": parsed,
            "warnings": warnings,
            "original_input": raw_address
        }

# Singleton instance to be used across the app
address_validator = AddressValidationModel()
