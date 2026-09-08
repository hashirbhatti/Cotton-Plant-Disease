import os
import json
import csv
from io import BytesIO
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import tensorflow as tf

from keras.layers import Dense

_original_dense_from_config = Dense.from_config

@classmethod
def _patched_dense_from_config(cls, config):
    config.pop("quantization_config", None)
    return _original_dense_from_config(config)

Dense.from_config = _patched_dense_from_config

app = FastAPI(
    title="Robust Cotton Plant Disease Detector API",
    description="Multi-stage robust engine with quality gate, plant leaf gate, and open-set disease classifier.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base path resolution
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

# Artifacts folder path options
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "models", "robust")
if not os.path.exists(ARTIFACTS_DIR):
    ARTIFACTS_DIR = os.path.join(BASE_DIR, "models", "robust")

# Config & Model file paths
CONFIG_PATH = os.path.join(ARTIFACTS_DIR, "robust_config.json")
GATE_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "plant_leaf_gate.keras")
DISEASE_MODEL_PATH = os.path.join(ARTIFACTS_DIR, "cotton_efficientnetb0_robust_open_set.keras")
CONFUSION_MATRIX_PATH = os.path.join(ARTIFACTS_DIR, "confusion_matrix.csv")
CLASSIFICATION_REPORT_PATH = os.path.join(ARTIFACTS_DIR, "classification_report.csv")

# Defaults
DEFAULT_CLASS_NAMES = [
    "Aphids", "Army worm", "Bacterial blight", "Healthy",
    "Powdery mildew", "Target spot", "Unclassified"
]
DEFAULT_GATE_THRESHOLD = 0.57
DEFAULT_DISEASE_THRESHOLD = 0.30

# Globals loaded on startup
CONFIG: Dict[str, Any] = {}
CLASS_NAMES: List[str] = DEFAULT_CLASS_NAMES
GATE_THRESHOLD: float = DEFAULT_GATE_THRESHOLD
DISEASE_THRESHOLD: float = DEFAULT_DISEASE_THRESHOLD

GATE_MODEL: Optional[tf.keras.Model] = None
DISEASE_MODEL: Optional[tf.keras.Model] = None


def load_config_and_models():
    global CONFIG, CLASS_NAMES, GATE_THRESHOLD, DISEASE_THRESHOLD, GATE_MODEL, DISEASE_MODEL
    
    # 1. Load config
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            CONFIG = json.load(f)
            CLASS_NAMES = CONFIG.get("class_names", DEFAULT_CLASS_NAMES)
            # Threshold rounding for precision sanity
            GATE_THRESHOLD = float(np.round(CONFIG.get("gate_threshold", DEFAULT_GATE_THRESHOLD), 2))
            DISEASE_THRESHOLD = float(np.round(CONFIG.get("disease_threshold", DEFAULT_DISEASE_THRESHOLD), 2))
            print(f"[INIT] Loaded config from {CONFIG_PATH}")
            print(f"[INIT] Classes: {CLASS_NAMES}")
            print(f"[INIT] Gate Threshold: {GATE_THRESHOLD}, Disease Threshold: {DISEASE_THRESHOLD}")
    else:
        print(f"[WARNING] Config file not found at {CONFIG_PATH}. Using default thresholds.")

    # 2. Load Plant Gate Model
    if os.path.exists(GATE_MODEL_PATH):
        print(f"[INIT] Loading Plant Leaf Gate Model from {GATE_MODEL_PATH}...")
        GATE_MODEL = tf.keras.models.load_model(GATE_MODEL_PATH, compile=False)
        print("[INIT] Plant Leaf Gate Model loaded successfully.")
    else:
        print(f"[ERROR] Plant Leaf Gate model missing at {GATE_MODEL_PATH}")

    # 3. Load Disease Classifier Model
    if os.path.exists(DISEASE_MODEL_PATH):
        print(f"[INIT] Loading Disease Classifier Model from {DISEASE_MODEL_PATH}...")
        DISEASE_MODEL = tf.keras.models.load_model(DISEASE_MODEL_PATH, compile=False)
        print("[INIT] Disease Classifier Model loaded successfully.")
    else:
        print(f"[ERROR] Disease Classifier model missing at {DISEASE_MODEL_PATH}")


@app.on_event("startup")
async def startup_event():
    load_config_and_models()


@app.get("/ping")
async def ping():
    return {
        "status": "healthy",
        "message": "Robust Cotton Plant Disease Detector API is online",
        "models_loaded": {
            "plant_leaf_gate": GATE_MODEL is not None,
            "disease_classifier": DISEASE_MODEL is not None
        }
    }


@app.get("/model-info")
async def get_model_info():
    """Returns model metrics, thresholds, confusion matrix, and classification report."""
    confusion_matrix = []
    classification_report = []

    if os.path.exists(CONFUSION_MATRIX_PATH):
        with open(CONFUSION_MATRIX_PATH, "r") as f:
            reader = csv.reader(f)
            confusion_matrix = list(reader)

    if os.path.exists(CLASSIFICATION_REPORT_PATH):
        with open(CLASSIFICATION_REPORT_PATH, "r") as f:
            reader = csv.reader(f)
            classification_report = list(reader)

    return {
        "config": CONFIG,
        "class_names": CLASS_NAMES,
        "gate_threshold": GATE_THRESHOLD,
        "disease_threshold": DISEASE_THRESHOLD,
        "metrics": CONFIG.get("metrics", {}),
        "confusion_matrix": confusion_matrix,
        "classification_report": classification_report
    }


def run_robust_pipeline(pil_img: Image.Image) -> Dict[str, Any]:
    """
    Executes the multi-stage Robust Engine:
    Stage 1: Quality Gate (Dimensions >= 32x32 & Pixel Std >= 3.0)
    Stage 2: Plant/Leaf Gate (MobileNetV3Small prob >= GATE_THRESHOLD 0.57)
    Stage 3 & 4: Disease Classifier (EfficientNetB0) & Confidence Rejection (prob >= DISEASE_THRESHOLD 0.30)
    """
    # Force RGB mode
    img_rgb = pil_img.convert("RGB")
    width, height = img_rgb.size
    img_np = np.array(img_rgb, dtype=np.float32)
    pixel_std = float(np.std(img_np))

    quality_details = {
        "width": width,
        "height": height,
        "std_dev": round(pixel_std, 2),
        "passed": True
    }

    # ----------------------------------------------------
    # STAGE 1: Quality Gate
    # ----------------------------------------------------
    if width < 32 or height < 32:
        quality_details["passed"] = False
        return {
            "class": "Unclassified",
            "confidence": 0.0,
            "stage": "quality_gate",
            "status": "rejected",
            "message": f"Image resolution too low ({width}x{height}). Minimum required is 32x32 pixels.",
            "details": {
                "quality": quality_details,
                "plant_gate": None,
                "disease_classifier": None
            }
        }

    if pixel_std < 3.0:
        quality_details["passed"] = False
        return {
            "class": "Unclassified",
            "confidence": 0.0,
            "stage": "quality_gate",
            "status": "rejected",
            "message": f"Image pixel standard deviation is too low ({round(pixel_std, 2)} < 3.0). Image appears blank or uniform.",
            "details": {
                "quality": quality_details,
                "plant_gate": None,
                "disease_classifier": None
            }
        }

    # ----------------------------------------------------
    # STAGE 2: Plant/Leaf Gate (MobileNetV3Small)
    # ----------------------------------------------------
    if GATE_MODEL is None:
        raise HTTPException(status_code=500, detail="Plant Leaf Gate model is not loaded.")

    img_256 = img_rgb.resize((256, 256))
    img_256_arr = np.array(img_256, dtype=np.float32) / 255.0  # Scale to [0, 1]
    gate_batch = np.expand_dims(img_256_arr, axis=0)

    gate_pred = GATE_MODEL.predict(gate_batch, verbose=0)
    # Extract scalar probability
    gate_prob = float(np.squeeze(gate_pred))

    gate_passed = gate_prob >= GATE_THRESHOLD
    plant_gate_details = {
        "probability": round(gate_prob, 4),
        "threshold": GATE_THRESHOLD,
        "passed": gate_passed
    }

    if not gate_passed:
        return {
            "class": "Unclassified",
            "confidence": round(gate_prob, 4),
            "stage": "plant_gate",
            "status": "rejected",
            "message": "Input does not appear to be a plant leaf.",
            "details": {
                "quality": quality_details,
                "plant_gate": plant_gate_details,
                "disease_classifier": None
            }
        }

    # ----------------------------------------------------
    # STAGE 3 & 4: Disease Classifier (EfficientNetB0) & Confidence Rejection
    # ----------------------------------------------------
    if DISEASE_MODEL is None:
        raise HTTPException(status_code=500, detail="Disease Classifier model is not loaded.")

    disease_batch = np.expand_dims(img_256_arr, axis=0)  # Model handles internal Rescaling(255)
    disease_preds = DISEASE_MODEL.predict(disease_batch, verbose=0)[0]

    top_idx = int(np.argmax(disease_preds))
    top_prob = float(disease_preds[top_idx])
    predicted_class = CLASS_NAMES[top_idx] if top_idx < len(CLASS_NAMES) else "Unclassified"

    all_probabilities = {
        CLASS_NAMES[i]: round(float(disease_preds[i]), 4)
        for i in range(min(len(CLASS_NAMES), len(disease_preds)))
    }

    disease_passed = (top_prob >= DISEASE_THRESHOLD) and (predicted_class != "Unclassified")

    disease_classifier_details = {
        "top_class": predicted_class,
        "top_confidence": round(top_prob, 4),
        "threshold": DISEASE_THRESHOLD,
        "passed": disease_passed,
        "all_probabilities": all_probabilities
    }

    if top_prob < DISEASE_THRESHOLD:
        return {
            "class": "Unclassified",
            "confidence": round(top_prob, 4),
            "stage": "confidence_rejection",
            "status": "rejected",
            "message": "Identification confidence too low.",
            "details": {
                "quality": quality_details,
                "plant_gate": plant_gate_details,
                "disease_classifier": disease_classifier_details
            }
        }

    if predicted_class == "Unclassified":
        return {
            "class": "Unclassified",
            "confidence": round(top_prob, 4),
            "stage": "disease_classifier",
            "status": "rejected",
            "message": "Input classified as unknown/unclassified.",
            "details": {
                "quality": quality_details,
                "plant_gate": plant_gate_details,
                "disease_classifier": disease_classifier_details
            }
        }

    return {
        "class": predicted_class,
        "confidence": round(top_prob, 4),
        "stage": "disease_classifier",
        "status": "passed",
        "message": f"Successfully identified {predicted_class}.",
        "details": {
            "quality": quality_details,
            "plant_gate": plant_gate_details,
            "disease_classifier": disease_classifier_details
        }
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pil_img = Image.open(BytesIO(contents))
        result = run_robust_pipeline(pil_img)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file or processing error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)