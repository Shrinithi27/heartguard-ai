import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COLUMNS_PATH = os.path.join(BASE_DIR, "app", "trained_model", "feature_columns.pkl")
try:
    cols = joblib.load(COLUMNS_PATH)
    print("EXPECTED_COLUMNS:", cols)
except Exception as e:
    print("Error:", e)
