import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_eta_model():
    print("Training ETA Prediction Model...")
    df = pd.read_csv("data/logistics_dataset.csv")
    
    # Features: distance, weight, priority, source_lat, source_lon, dest_lat, dest_lon
    X = df[["distance", "weight", "priority", "source_lat", "source_lon", "dest_lat", "dest_lon"]]
    y = df["delivery_days"]
    
    # Encode priority
    le_priority = LabelEncoder()
    X.loc[:, "priority"] = le_priority.fit_transform(X["priority"])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score: {score:.4f}")
    
    # Save model and encoders
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/eta_model.pkl")
    joblib.dump(le_priority, "models/priority_encoder.pkl")
    print("ETA Model saved to models/eta_model.pkl")

if __name__ == "__main__":
    train_eta_model()
