from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd


# Create the FastAPI application
app = FastAPI()


# Allow our React frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load our trained ChhooMat model
model = joblib.load("chhoomat_model.pkl")


# Define the touch data we will receive
class TouchData(BaseModel):
    edgeDistance: float
    duration: float
    movement: float
    pressure: float
    width: float
    speed: float


# Test endpoint
@app.get("/")
def home():
    return {
        "message": "ChhooMat AI API is running!"
    }


# Prediction endpoint
@app.post("/predict")
def predict_touch(touch: TouchData):

    data = pd.DataFrame([{
        "edgeDistance": touch.edgeDistance,
        "duration": touch.duration,
        "movement": touch.movement,
        "pressure": touch.pressure,
        "width": touch.width,
        "speed": touch.speed
    }])

    # Get the model prediction
    prediction = model.predict(data)[0]

    # Get the probability of the predicted class
    probabilities = model.predict_proba(data)[0]
    class_names = model.classes_

    predicted_index = list(class_names).index(prediction)
    confidence = float(probabilities[predicted_index])

    return {
        "prediction": prediction,
        "confidence": round(confidence * 100, 2)
    }
