from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import os
import pickle
import joblib
from tensorflow.keras.models import Model as KerasModel
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
import pytesseract
import cv2

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Initialize Flask
app = Flask(__name__)

# ----------------------------
# Load AI Models
# ----------------------------

# AI Model 1: Hybrid Medical AI (text + image + sensor)
with open("hybrid_medical_model.pkl", "rb") as f:
    hybrid_model = pickle.load(f)

# AI Model 4: Tabular Medical Prediction Model
bundle = joblib.load("medical_pipeline.pkl")
tabular_model = bundle['model']
tabular_scaler = bundle['scaler']
tabular_le = bundle['label_encoder']

# TODO: Load other models (Model 2, Model 3) if available
# model2 = ...
# model3 = ...

# ----------------------------
# Routes
# ----------------------------

@app.route('/api/hybrid_model', methods=['POST'])
def run_hybrid_model():
    """
    Input JSON example:
    {
        "text_features": [0.1, 0.2, ...],
        "image_path": "path/to/image.jpg",
        "sensor_data": [1.0, 2.0]
    }
    """
    data = request.json
    try:
        # Extract text features
        X_text = np.array([data.get("text_features", np.zeros(100))])

        # Process image input
        img_path = data.get("image_path")
        if img_path and os.path.exists(img_path):
            img = image.load_img(img_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            X_image = preprocess_input(x)
        else:
            X_image = np.zeros((1, 2048))  # Fallback if no image provided

        # Process sensor input
        X_sensor = np.array([data.get("sensor_data", [0, 0])])

        # Model prediction
        pred = hybrid_model.predict({
            "text_input": X_text,
            "image_input": X_image,
            "sensor_input": X_sensor
        })

        pred_class = np.argmax(pred, axis=1).tolist()
        return jsonify({"prediction": pred_class, "raw_output": pred.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/tabular_model', methods=['POST'])
def run_tabular_model():
    """
    Input JSON example:
    {
        "HbA1c": 5.8,
        "Hemoglobin": 13.5,
        "Cholesterol": 180,
        "Blood_Pressure": 120,
        "Heart_Rate": 75,
        "BMI": 22.5
    }
    """
    try:
        features = request.json
        X_input = np.array([[
            features.get("HbA1c", 0),
            features.get("Hemoglobin", 0),
            features.get("Cholesterol", 0),
            features.get("Blood_Pressure", 0),
            features.get("Heart_Rate", 0),
            features.get("BMI", 0)
        ]])

        X_scaled = tabular_scaler.transform(X_input)
        pred = tabular_model.predict(X_scaled)
        pred_label = tabular_le.inverse_transform(pred)
        return jsonify({"prediction": pred_label.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/model2', methods=['POST'])
def run_model2():
    """Placeholder for AI Model 2"""
    return jsonify({"message": "Model 2 endpoint not implemented yet."})


@app.route('/api/model3', methods=['POST'])
def run_model3():
    """Placeholder for AI Model 3"""
    return jsonify({"message": "Model 3 endpoint not implemented yet."})


# ----------------------------
# Run Server
# ----------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
