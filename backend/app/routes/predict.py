from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.predict_service import predict_heart_risk

router = APIRouter(prefix="/predict", tags=["Prediction"])


class PredictRequest(BaseModel):
    """Input features for heart risk prediction."""
    model_config = {"extra": "allow"}  # Allow any feature columns

    # Common clinical features (all optional — extra fields are passed through)
    age: float | None = None
    sex: float | None = None
    chest_pain_type: float | None = None
    resting_bp: float | None = None
    cholesterol: float | None = None
    fasting_blood_sugar: float | None = None
    resting_ecg: float | None = None
    max_heart_rate: float | None = None
    exercise_angina: float | None = None
    oldpeak: float | None = None
    st_slope: float | None = None


class PredictResponse(BaseModel):
    prediction: int
    probability: float
    risk_level: str


@router.post("/", response_model=PredictResponse)
def predict(request: PredictRequest):
    """Predict heart disease risk based on clinical features."""
    try:
        input_data = request.model_dump(exclude_none=True)
        result = predict_heart_risk(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))