import joblib
import pandas as pd
import os

# Paths to model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "trained_model")

MODEL_PATH = os.path.join(MODEL_DIR, "heartguard_final_model.pkl")
COLUMNS_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")

# Load model and feature columns once at startup
model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(COLUMNS_PATH)


def predict_heart_risk(input_data: dict) -> dict:
    """
    Run the heart risk prediction model on the provided input data.
    Returns a dict with 'prediction' (0 or 1) and 'probability'.
    """
    df = pd.DataFrame([input_data])

    # Align columns to what the model expects
    df = df.reindex(columns=feature_columns, fill_value=0)

    prediction = int(model.predict(df)[0])
    probability = float(model.predict_proba(df)[0][1])

    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "risk_level": "High" if probability >= 0.5 else "Low",
    }