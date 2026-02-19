# app.py
import os
import tempfile
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from PIL import Image
import pdfplumber
from docx import Document
import pandas as pd
from chatbot.chat import CompleteHealthBot

# Optional OCR import - used only if tesseract executable installed
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except Exception:
    pytesseract = None
    TESSERACT_AVAILABLE = False

BASE_PRICE = 200.0

# ---------- Load model + scaler safely ----------
data = joblib.load("pricing_model_and_scaler.pkl")  # update path if required

if isinstance(data, dict):
    model = data.get("model")
    scaler = data.get("scaler", None)
elif isinstance(data, tuple) and len(data) == 2:
    model, scaler = data
else:
    model = data
    scaler = None

print("Model loaded:", model is not None)
print("Scaler loaded:", scaler is not None)
print("Tesseract available:", TESSERACT_AVAILABLE)

app = Flask(__name__)
CORS(app)

# ---------- Helper: extract_text -------------------------------------------------
def extract_text(file_path):
    """Return (text, pages, word_count, image_count, tables_count). Non-fatal errors return reasonable defaults."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    pages = 1
    image_count = 0
    tables_count = 0

    try:
        if ext == ".pdf":
            with pdfplumber.open(file_path) as pdf:
                pages = len(pdf.pages)
                for page in pdf.pages:
                    text += page.extract_text() or ""
                    image_count += len(getattr(page, "images", []))
                    tables = page.find_tables()
                    tables_count += len(tables) if tables else 0

        elif ext in [".jpg", ".jpeg", ".png", ".tiff", ".bmp"]:
            # Use OCR only if tesseract installed; otherwise skip OCR and return empty text
            if TESSERACT_AVAILABLE:
                img = Image.open(file_path)
                try:
                    text = pytesseract.image_to_string(img)
                except Exception as e:
                    print("Tesseract OCR failed for image:", e)
                    text = ""
            else:
                print("Skipping OCR for image (tesseract not available)")
                text = ""
            image_count = 1
            pages = 1

        elif ext in [".docx", ".doc"]:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n".join(paragraphs)
            pages = max(1, len(paragraphs) // 20 + 1)

        elif ext == ".csv":
            df = pd.read_csv(file_path, dtype=str, errors="ignore")
            text = df.fillna("").astype(str).to_string()
            tables_count = 1
            pages = max(1, len(df) // 40 + 1)

        elif ext in [".xls", ".xlsx"]:
            xls = pd.read_excel(file_path, sheet_name=None)
            parts = []
            total_rows = 0
            for sheetname, df in xls.items():
                df = df.fillna("").astype(str)
                total_rows += len(df)
                if len(df):
                    parts.append(df.to_string())
            text = "\n\n".join(parts)
            tables_count = len(xls)
            pages = max(1, total_rows // 40 + 1)

        else:
            # try plain text read
            with open(file_path, "r", errors="ignore") as f:
                text = f.read()
            pages = max(1, len(text.splitlines()) // 40 + 1)

    except Exception as exc:
        print("Error extracting text from", file_path, exc)

    word_count = len(text.split())
    return text, pages, word_count, image_count, tables_count

# ---------- Prediction route -----------------------------------------------------
@app.route("/predict-price", methods=["POST"])
def predict_price():
    # Accept multiple files in the "files" field (client should append multiple entries named "files")
    if "files" not in request.files:
        return jsonify({"success": False, "error": "No files uploaded (expected field name: files)"}), 400

    uploaded_files = request.files.getlist("files")
    if not uploaded_files:
        return jsonify({"success": False, "error": "No valid files received"}), 400

    total_price = 0.0
    per_file = []

    for f in uploaded_files:
        # Save to temporary file
        suffix = os.path.splitext(f.filename)[1] or ""
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        file_path = tmp.name
        try:
            f.save(file_path)
        except Exception as e:
            print("Failed to save uploaded file:", e)
            # cleanup and continue
            try:
                os.remove(file_path)
            except:
                pass
            continue

        # Extract features
        text, pages, word_count, image_count, tables_count = extract_text(file_path)

        features = np.array([[pages, word_count, image_count, tables_count, len(text)]])

        # apply scaler if present (try/except to avoid crash)
        try:
            if scaler is not None:
                features = scaler.transform(features)
        except Exception as e:
            print("Scaler transform failed, using raw features:", e)

        # predict
        try:
            pred = float(model.predict(features)[0])
        except Exception as e:
            print("Model prediction failed for file:", f.filename, e)
            pred = BASE_PRICE

        pred = max(BASE_PRICE, round(pred, 2))
        per_file.append({"fileName": f.filename, "predicted": pred})
        total_price += pred

        # cleanup tmp file
        try:
            os.remove(file_path)
        except:
            pass

    return jsonify({
        "success": True,
        "predicted_price": round(total_price, 2),
        "details": per_file
    }), 200

chatbot_model, msg = CompleteHealthBot.load_chatbot("health_bot.pkl")
print(msg)

# If no saved bot exists, create new one
if chatbot_model is None:
    chatbot_model = CompleteHealthBot()

@app.route("/chatbot", methods=["POST"])
def chatbot():
    try:
        data = request.json
        user_msg = data.get("message", "")

        if user_msg.strip() == "":
            return jsonify({"error": "Message is empty"}), 400

        # generate response
        bot_reply = chatbot_model.chat(user_msg)

        # save chatbot state
        chatbot_model.save_chatbot("health_bot.pkl")

        return jsonify({
            "success": True,
            "reply": bot_reply
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render will supply PORT
    app.run(host="0.0.0.0", port=port)