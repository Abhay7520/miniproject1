import pandas as pd
import joblib
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# 1. Load your dataset
# Make sure the file name matches what you have in the folder
df = pd.read_csv('app/ml/data/logistics_data.csv')

# Clean column names just in case there are hidden spaces
df.columns = df.columns.str.strip()

# 2. Select features from YOUR list that affect delivery time
features = [
    'vehicle_gps_latitude', 
    'vehicle_gps_longitude', 
    'traffic_congestion_level', 
    'weather_condition_severity', 
    'loading_unloading_time',
    'route_risk_level'
]
# We will predict 'delivery_time_deviation' (how much the delivery is delayed/early)
target = 'delivery_time_deviation'

X = df[features]
y = df[target]

# 3. Handle Categorical columns (Text to Numbers)
# We encode columns that are likely to be text like "High", "Low", "Critical"
encoders = {}
categorical_cols = ['traffic_congestion_level', 'weather_condition_severity', 'route_risk_level']

for col in categorical_cols:
    le = LabelEncoder()
    X.loc[:, col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

# 4. Train the AI Model (XGBoost)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)
model.fit(X_train, y_train)

# 5. Save the "Brain" files
joblib.dump(model, 'app/ml/eta_model.pkl')
joblib.dump(encoders, 'app/ml/eta_encoders.pkl')

print("✅ Success: ETA Model trained using your dataset columns!")