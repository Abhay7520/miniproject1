from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models
from app.database import engine
from app.routers import parcels, auth, ai_features

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smooth Journey API", description="Backend Endpoints")

# Configure CORS
origins = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parcels.router)
app.include_router(auth.router)
app.include_router(ai_features.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Smooth Journey API!"}
