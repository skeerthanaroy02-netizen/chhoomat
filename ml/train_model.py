import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# 1. Load our dataset
data = pd.read_csv("../chhoomat_dataset.csv")

print("Dataset loaded!")
print("Total samples:", len(data))


# 2. Select the features the model will learn from
features = [
    "edgeDistance",
    "duration",
    "movement",
    "pressure",
    "width",
    "speed"
]

X = data[features]

# 3. Select the answer we want the model to predict
y = data["label"]


# 4. Split the data
# 80% → training
# 20% → testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# 5. Create the Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# 6. Train the model
model.fit(X_train, y_train)

print("Model training completed!")


# 7. Test the model
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("Model accuracy:", round(accuracy * 100, 2), "%")
import joblib

joblib.dump(model, "chhoomat_model.pkl")

print("Model saved successfully!")