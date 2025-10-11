import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# ----------------------------
# 1️⃣ Load Dataset
# ----------------------------
file_path = "patient_data.csv"  # your dataset filename
df = pd.read_csv(file_path)

# ----------------------------
# 2️⃣ Anonymize for Marketplace
# ----------------------------
df_anonymized = df.copy()

# Replace patient names with PatientX IDs
df_anonymized['name'] = [f"PatientX-{str(i+1).zfill(3)}" for i in range(len(df_anonymized))]

# Convert exact ages to range (e.g., 55 -> 50-60)
def age_to_range(age):
    lower = (int(age) // 10) * 10
    upper = lower + 10
    return f"{lower}-{upper}"
df_anonymized['age'] = df_anonymized['age'].apply(age_to_range)

# Hide all sensitive data except Diagnosis, Medications, and Report
hide_cols = ['email','phone','hospital','admission_date',
             'HbA1c','Hemoglobin','Cholesterol','Blood_Pressure','Heart_Rate','BMI']
for col in hide_cols:
    if col in df_anonymized.columns:
        df_anonymized[col] = 'Hidden'

# Save anonymized data for marketplace
df_anonymized.to_csv("marketplace_anonymized_dataset.csv", index=False)

# ----------------------------
# 3️⃣ Prepare Data for Model Training
# ----------------------------
# Using original dataset for model training
train_df = df.copy()

# Encode categorical columns
le_gender = LabelEncoder()
le_med = LabelEncoder()
le_diag = LabelEncoder()

train_df['gender'] = le_gender.fit_transform(train_df['gender'])
train_df['Medications'] = le_med.fit_transform(train_df['Medications'])
train_df['diagnosis'] = le_diag.fit_transform(train_df['diagnosis'])

# Select features (you can change these as needed)
X = train_df[['age','gender','Medications']]
y = train_df['diagnosis']

# ----------------------------
# 4️⃣ Train-Test Split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# ----------------------------
# 5️⃣ Train the Model
# ----------------------------
model = LogisticRegression()
model.fit(X_train, y_train)

# ----------------------------
# 6️⃣ Evaluate the Model
# ----------------------------
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

# ----------------------------
# 7️⃣ Display Output
# ----------------------------
print("✅ Model Training Completed!")
print(f"📊 Accuracy Rate: {accuracy * 100:.2f}%\n")

print("🔹 Marketplace-Ready Anonymized Dataset (Preview):\n")
print(df_anonymized.head(5).to_string(index=False))

# ----------------------------
# 8️⃣ Optional: Predict a Sample
# ----------------------------
sample = np.array([[55, 1, 2]])  # Example: Age=55, Gender=1(Male), Medication=2
predicted = le_diag.inverse_transform(model.predict(sample))
print(f"\n🩺 Predicted Diagnosis for Input: {predicted[0]}")