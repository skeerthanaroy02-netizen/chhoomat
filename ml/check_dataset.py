import pandas as pd

data = pd.read_csv("../chhoomat_dataset.csv")

print("Dataset loaded successfully!")
print()

print("Number of samples:")
print(len(data))

print()

print("Columns:")
print(data.columns.tolist())

print()

print("First 5 samples:")
print(data.head())