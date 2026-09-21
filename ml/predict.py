import joblib
import pandas as pd


# Load the trained ChhooMat model
model = joblib.load("chhoomat_model.pkl")

print("ChhooMat model loaded!")


# A new touch sample
new_touch = pd.DataFrame([{
    "edgeDistance": 80,
    "duration": 180,
    "movement": 3,
    "pressure": 0.50,
    "width": 1.0,
    "speed": 16
}])


# Ask the model for a prediction
prediction = model.predict(new_touch)[0]

print("Prediction:", prediction)