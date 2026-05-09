import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_delay_model():
    print("Training Delay Risk Model...")
    df = pd.read_csv("data/logistics_dataset.csv")
    
    # Features: distance, weight, priority, delivery_days (as proxy for eta)
    X = df[["distance", "weight", "priority", "delivery_days"]]
    y = df["delay"]
    
    # Encode priority
    le_priority = LabelEncoder()
    X.loc[:, "priority"] = le_priority.fit_transform(X["priority"])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy:.4f}")
    
    # Save model
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/delay_model.pkl")
    # We reuse the priority encoder from ETA model if needed, but it's small enough to save again
    joblib.dump(le_priority, "models/delay_priority_encoder.pkl")
    print("Delay Model saved to models/delay_model.pkl")

if __name__ == "__main__":
    train_delay_model()
