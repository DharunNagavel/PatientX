from flask import Flask, request, jsonify
import pickle
import joblib
import numpy as np
import pandas as pd
import os
import pickle
from tensorflow.keras.models import Model as KerasModel

# For OCR
import pytesseract
import cv2

# Initialize Flask
app = Flask(_name_)

# ----------------------------
# Load AI Models
# ----------------------------

# AI Model 1: Hybrid Medical AI (text + image + sensor)
with open("hybrid_medical_model.pkl","rb") as f:
    hybrid_model = pickle.load(f)

# AI Model 4: Tabular Medical Prediction Model
bundle = joblib.load("medical_pipeline.pkl")
tabular_model = bundle['model']
tabular_scaler = bundle['scaler']
tabular_le = bundle['label_encoder']

# TODO: If you have AI Model 2 and AI Model 3, load them here
# model2 = ...
# model3 = ...

# ----------------------------
# Routes
# ----------------------------

@app.route('/api/hybrid_model', methods=['POST'])
def run_hybrid_model():
    """
    Input: JSON with keys:
        text_features (list), 
        image_path (optional, for demo), 
        sensor_data (list of floats)
    Output: JSON prediction
    """
    data = request.json
    try:
        # Prepare inputs
        X_text = np.array([data.get("text_features", np.zeros(100))])
        img_path = data.get("image_path")
        if img_path and os.path.exists(img_path):
            img = image.load_img(img_path, target_size=(224,224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            X_image = preprocess_input(x)
        else:
            X_image = np.zeros((1, 2048))
        
        X_sensor = np.array([data.get("sensor_data", [0,0])])

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
    Input: JSON with numeric medical features:
    HbA1c, Hemoglobin, Cholesterol, Blood_Pressure, Heart_Rate, BMI
    Output: Diagnosis prediction
    """
    try:
        features = request.json
        X_input = np.array([[
            features.get("HbA1c",0),
            features.get("Hemoglobin",0),
            features.get("Cholesterol",0),
            features.get("Blood_Pressure",0),
            features.get("Heart_Rate",0),
            features.get("BMI",0)
        ]])
        X_scaled = tabular_scaler.transform(X_input)
        pred = tabular_model.predict(X_scaled)
        pred_label = tabular_le.inverse_transform(pred)
        return jsonify({"prediction": pred_label.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/model2', methods=['POST'])
def run_model2():
    """Placeholder route for AI Model 2"""
    return jsonify({"message":"Model 2 endpoint not implemented yet."})

@app.route('/api/model3', methods=['POST'])
def run_model3():
    """Placeholder route for AI Model 3"""
    return jsonify({"message":"Model 3 endpoint not implemented yet."})

# ----------------------------
# Run Server
# ----------------------------
if _name_ == '_main_':
    app.run(host='0.0.0.0', port=5000, debug=True)