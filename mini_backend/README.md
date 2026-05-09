# AIPostal Backend – Smart AI Postal System

This backend provides AI-powered logistics features including address standardization, post office selection, ETA prediction, and delay risk analysis.

## Core Features
1. **AI Address Intelligence**: Fuzzy matching for city identification.
2. **Smart Post Office Selection**: Nearest office selection using Haversine formula.
3. **Delivery ETA Prediction**: RandomForestRegressor model trained on synthetic logistics data.
4. **Delay Risk Prediction**: RandomForestClassifier model predicting potential delays.
5. **Predictive Tracking**: Dynamic status updates based on ETA.

## Setup Instructions

### 1. Database (PostgreSQL)
Ensure Docker is running and start the database:
```bash
docker-compose up -d
```

### 2. Environment
Create a `.env` file (one has been provided):
```
DATABASE_URL=postgresql://postgres:123@localhost:5432/smooth_journey_db
```

### 3. ML Models
Generate the dataset and train the models:
```bash
python generate_dataset.py
python train_eta_model.py
python train_delay_model.py
```

### 4. Run the API
```bash
uvicorn main:app --reload
```

## API Endpoints
- `POST /auth/signup`: Register new users/staff/admin.
- `POST /auth/login`: Authenticate and get role-based access.
- `POST /parcels/`: Create a new shipment with AI analysis.
- `GET /parcels/`: List all parcels (Admin/Staff view).
- `GET /track/{tracking_number}`: Track status and risk.
- `GET /admin/stats`: Get system-wide logistics analytics.
- `GET /post-offices`: Search real-world post offices.

## Deployment with Docker
You can deploy the entire backend (API + Database) with one command:
```bash
docker-compose up --build -d
```
This will build the Python image and start the PostgreSQL container.
