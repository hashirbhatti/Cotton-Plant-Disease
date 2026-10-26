
# Cotton Plant Disease Detector

An end-to-end cotton-leaf disease classification system with a web interface, FastAPI inference service, reproducible training notebooks, and an open-set protection layer that can return **Unclassified** instead of forcing arbitrary images into a disease or Healthy class.

- **Live application:** [CottonGuard AI](https://cotton-plant-disease-1d91wfvtd-hashir-bhatti.vercel.app/)
- **Primary backend:** FastAPI + TensorFlow/Keras
- **Frontend:** React 17, Tailwind CSS, Material UI dependencies, Axios, and Lucide icons
- **Deployment configuration:** Render backend configuration in `render.yaml`; frontend is deployed on Vercel

> **Scope:** This project is a machine-learning decision-support prototype. Its predictions are not a substitute for an agronomist, plant pathologist, or local agricultural extension service.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Project Overview](#project-overview)
- [Dataset](#dataset)
- [Model Experiments](#model-experiments)
- [Application Architecture](#application-architecture)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Evaluation and Reproducibility](#evaluation-and-reproducibility)
- [Challenges and Solutions](#challenges-and-solutions)
- [Key Takeaways](#key-takeaways)
- [Limitations and Future Work](#limitations-and-future-work)
- [License and Attribution](#license-and-attribution)

## Problem Statement

Cotton leaves can show symptoms caused by pests, bacterial disease, fungal disease, or normal plant health. A farmer or researcher needs a quick way to screen a leaf photograph against a known set of cotton categories:

- Aphids
- Army worm
- Bacterial blight
- Healthy
- Powdery mildew
- Target spot

The first version of the classifier solved the closed-set problem: every input was assumed to belong to one of those six classes. That behavior is unsafe for a real upload tool. A photograph of a person, animal, vehicle, soil, machinery, flower, another plant, a blank image, or a badly framed leaf could be assigned a confident-looking disease label simply because a normal softmax classifier has to choose one of its known outputs.

The project therefore evolved from a six-class classifier into a safer application with two goals:

1. Maintain strong recognition of the six supported cotton categories.
2. Reject low-quality, non-plant, uncertain, or out-of-domain inputs as **Unclassified**.

## Project Overview

The repository contains three connected layers:

1. **Training and evaluation notebooks** document the baseline CNN, the improved EfficientNetB0 model, and the robust open-set extension.
2. **A TensorFlow/Keras model package** stores the trained robust disease model, plant/leaf gate, threshold configuration, manifests, metrics, and confusion matrix.
3. **A full-stack application** lets a user upload an image, sends it to the FastAPI service, runs the multi-stage inference pipeline, and displays the result, confidence, rejection stage, model metrics, and a field guide.

The current application is branded **CottonGuard AI** and exposes three frontend views:

- **Scanner:** Drag-and-drop or browse for an image, preview it, run robust diagnosis, and inspect the stage-by-stage result.
- **Model Info:** Load deployed metrics from `/model-info`, including thresholds, classification report, and confusion matrix.
- **Field Guide:** Review visual symptoms, scientific names, photography guidance, and management reminders for the six supported cotton categories.

## Dataset

### Main Cotton Dataset

The experiments use the `Cotton leaves/40 Images` portion of the [Cotton Plant Disease dataset on Kaggle](https://www.kaggle.com/datasets/dhamur/cotton-plant-disease). The intended six-class directory contains **4,788 images**:

| Class | Images |
|---|---:|
| Aphids | 800 |
| Army worm | 800 |
| Bacterial blight | 800 |
| Healthy | 800 |
| Powdery mildew | 800 |
| Target spot | 788 |
| **Total** | **4,788** |

The repository notebooks deliberately use only `Cotton leaves/40 Images`. The dataset also contains alternate processed representations such as black-and-white and HOG folders. Mixing transformed copies of the same source images into independent splits could create leakage and make test performance look better than it really is.

### Comparable Dataset Split

The main six-class experiments retain the same image counts for direct comparison:

- **Training:** 3,840 images
- **Validation:** 480 images
- **Test:** 468 images
- **Total:** 4,788 images

Experiment 1 reproduces the batch-based split used by the custom CNN workflow. Experiment 2 uses a deterministic file-level stratified split while preserving exactly the same partition sizes. Images are decoded as RGB and resized to **256 × 256** with batch size **32**.

### Unknown-Image Source for the Robust Extension

The robust notebook adds **800 CIFAR-10 images** as the operational `Unclassified` class. It loads CIFAR-10 through `tf.keras.datasets.cifar10.load_data()` rather than TFDS. The unknown set includes animals and objects/vehicles such as airplanes, automobiles, birds, cats, deer, dogs, frogs, horses, ships, and trucks. The source was selected because it was stable to download in the Kaggle environment after other open-dataset endpoints returned access errors.

The robust experiment uses this combined split:

| Partition | Cotton images | CIFAR-10 unknown images | Total |
|---|---:|---:|---:|
| Training | 3,840 | 800 | **4,640** |
| Validation | 480 | 400 | **880** |
| Test | 468 | 400 | **868** |

The unknown test set contains 252 animal images and 148 object/vehicle images.

> CIFAR-10 is a useful reproducible first unknown distribution, not a complete model of real user uploads. Its images are low resolution and do not cover every difficult case such as people, hands, soil, tools, buildings, flowers, or non-cotton plant leaves.

## Model Experiments

All three executed notebooks are stored in the repository:

- [`notebooks/exp01/exp01-cotton-disease-custom-cnn-results.ipynb`](notebooks/exp01/exp01-cotton-disease-custom-cnn-results.ipynb)
- [`notebooks/exp02/exp02-cotton-disease-efficientnet-b0-results.ipynb`](notebooks/exp02/exp02-cotton-disease-efficientnet-b0-results.ipynb)
- [`notebooks/exp02/exp02-extension-robust-open-set-cifar10-runnable-results.ipynb`](notebooks/exp02/exp02-extension-robust-open-set-cifar10-runnable-results.ipynb)

Each notebook is standalone and records its own methodology, training configuration, evaluation procedure, outputs, and saved artifacts.

### Experiment 1: Custom CNN Baseline

The first experiment uses a compact custom convolutional neural network trained directly on the six cotton categories.

**Architecture and training**

- Six convolutional blocks using 32/64 filters with max pooling.
- Flatten layer, 64-unit dense layer, and six-unit softmax output.
- **183,942 trainable parameters.**
- Input pipeline scales images to `[0, 1]` and applies training-only random horizontal/vertical flips and rotation with factor `0.2`.
- Adam optimizer with sparse categorical cross-entropy.
- Maximum of 100 epochs.
- Early stopping on validation loss with patience 10 and restoration of the best weights.
- The run completed **55 epochs**; the best checkpoint was from epoch 45.

**Test results**

The model evaluated all 468 test images and made 20 errors.

| Metric | Score |
|---|---:|
| Accuracy | **95.73%** |
| Balanced accuracy | **95.64%** |
| Macro precision | **95.68%** |
| Macro recall | **95.64%** |
| Macro F1 | **95.64%** |
| Weighted precision | **95.75%** |
| Weighted recall | **95.73%** |
| Weighted F1 | **95.72%** |

The strongest class-level F1 was Powdery mildew at 98.29%. The most difficult classes in this run were Target spot at 92.62% F1 and Bacterial blight at 93.79% F1.

### Experiment 2: EfficientNetB0 Transfer Learning

The second experiment improves the closed-set classifier with ImageNet transfer learning and controlled fine-tuning. It was designed to improve representation quality without changing the comparable dataset size or evaluation protocol.

**Architecture and preprocessing**

- ImageNet-pretrained `EfficientNetB0` with `include_top=False`.
- Global average pooling, batch normalization, dropout `0.35`, and a six-unit softmax head.
- **4,062,377 total parameters.**
- Initial training stage: 10,246 trainable parameters and 4,052,131 non-trainable parameters.
- Dataset tensors are initially in `[0, 1]`; a model rescaling layer converts them to `[0, 255]` before the Keras EfficientNet implementation's built-in preprocessing.
- Training augmentation: horizontal flip, rotation `0.08`, zoom `±0.10`, translation `0.08`, and contrast `0.15`.

**Two-stage training**

1. **Frozen-backbone head training:** Adam at `0.001`, validation macro-F1 checkpointing, early stopping patience 8, and ReduceLROnPlateau with factor `0.25`, patience 3, and minimum learning rate `1e-7`. The stage ran for 19 epochs; its best checkpoint was epoch 11.
2. **Controlled fine-tuning:** The upper part of EfficientNet was unfrozen while BatchNormalization layers stayed frozen. Adam used learning rate `1e-5`. Eight layers were trainable in the recorded run. The stage ran for 13 epochs; its best checkpoint was epoch 5.

The notebook executed **32 epochs across the two stages**. The best validation checkpoint had validation accuracy 98.75%, validation loss 0.0381, and validation macro-F1 98.74%.

**Test results**

The final model evaluated all 468 test images and made only five errors.

| Metric | Score |
|---|---:|
| Accuracy | **98.93%** |
| Balanced accuracy | **98.93%** |
| Macro precision | **98.96%** |
| Macro recall | **98.93%** |
| Macro F1 | **98.93%** |
| Weighted precision | **98.96%** |
| Weighted recall | **98.93%** |
| Weighted F1 | **98.94%** |

Healthy reached 100.00% F1. Target spot was the lowest class at 97.44% F1, which is still substantially above its Experiment 1 result.

**What changed from the baseline?**

The improvement came from a stronger pretrained visual representation, global average pooling instead of flattening a large feature map, moderate domain-appropriate augmentation, validation macro-F1 checkpointing, and a lower-learning-rate fine-tuning stage. The dataset size and comparable test size were not increased, so the result is a meaningful model-method comparison rather than a data-volume comparison.

### Experiment 2 Extension: Robust Open-Set Classification

The robust extension addresses the failure mode where a closed-set classifier assigns every arbitrary image to a known class. It adds a seventh operational class, `Unclassified`, and a separate plant/leaf gate.

#### Multi-Stage Decision Pipeline

The deployed backend applies these stages in order:

1. **Quality Gate:** Converts the upload to RGB and rejects images smaller than 32 × 32 pixels or images with pixel standard deviation below `3.0`, which catches blank or nearly uniform inputs.
2. **Plant/Leaf Gate:** A MobileNetV3Small binary classifier estimates whether the image is plant/leaf-like. A probability below **0.57** returns `Unclassified` before disease inference.
3. **Disease Classifier:** A seven-output ImageNet-pretrained EfficientNetB0 predicts the six cotton categories plus `Unclassified`.
4. **Confidence Rejection:** If the maximum disease probability is below **0.30**, the result is returned as `Unclassified`. A top prediction of `Unclassified` is also rejected explicitly.

This design separates two questions that a single softmax model should not be expected to answer alone:

- Does the image look like an eligible plant/leaf input?
- If it does, which supported cotton category is most likely?

The API includes the rejection stage, threshold values, quality details, plant-gate probability, top disease probability, and all available class probabilities in its response.

#### Robust Model Training

**Plant/leaf gate**

- MobileNetV3Small with ImageNet initialization and a sigmoid output.
- Plant-like positives include cotton, PlantVillage, and flower/plant examples available to the notebook.
- Non-plant negatives include CIFAR-10 and Caltech-101 examples.
- The gate trained for four of 12 maximum epochs.
- Validation accuracy and AUC reached 1.0000 in the recorded run.
- Threshold calibration required at least 98% plant acceptance and selected `0.57`.

**Seven-class disease model**

- EfficientNetB0 with ImageNet weights.
- Global average pooling, BatchNormalization, dropout `0.35`, and seven-output softmax.
- The same 256 × 256 RGB preprocessing and moderate augmentation family as Experiment 2.
- Frozen-head stage: Adam at `1e-3`, maximum 25 epochs, early stopping on validation macro-F1; ran for 16 epochs.
- Fine-tuning stage: Adam at `1e-5`, maximum 35 epochs, upper EfficientNet layers considered while BatchNormalization remained frozen; ran for 20 epochs.
- Validation macro-F1 was the checkpoint metric.
- Disease confidence threshold calibration selected `0.30`, retaining 100% of known validation images and rejecting 100% of unknown validation images in this run.

#### Robust Test Results

The complete test set contained 468 known cotton images and 400 CIFAR-10 unknown images.

| Metric | Result |
|---|---:|
| Raw seven-class accuracy | **99.54%** |
| Thresholded end-to-end accuracy | **99.54%** |
| Balanced accuracy | **99.27%** |
| Macro precision | **99.27%** |
| Macro recall | **99.27%** |
| Macro F1 | **99.27%** |
| Weighted F1 | **99.54%** |
| Known cotton accuracy | **99.15%** |
| Known false-rejection rate | **0.00%** |
| Final unknown rejection rate | **100.00%** on 400/400 CIFAR-10 images |
| Plant-gate non-plant rejection rate | **99.75%** on 399/400 images |

Per-class test results:

| Class | Precision | Recall | F1-score | Support |
|---|---:|---:|---:|---:|
| Aphids | 100.00% | 100.00% | 100.00% | 78 |
| Army worm | 98.73% | 100.00% | 99.36% | 78 |
| Bacterial blight | 98.73% | 98.73% | 98.73% | 79 |
| Healthy | 100.00% | 98.72% | 99.35% | 78 |
| Powdery mildew | 98.72% | 98.72% | 98.72% | 78 |
| Target spot | 98.70% | 98.70% | 98.70% | 77 |
| Unclassified | 100.00% | 100.00% | 100.00% | 400 |

The robust artifact configuration in [`models/robust/robust_config.json`](models/robust/robust_config.json) records the deployed class order, thresholds, and aggregate metrics. The classification report, confusion matrix, manifests, training logs, and threshold search outputs are also versioned in `models/robust/`.

## Application Architecture

```text
User uploads image
        |
        v
React frontend (Vercel)
        |  multipart/form-data POST /predict
        v
FastAPI backend (Render or local)
        |
        +--> Quality Gate: size + pixel variation
        |
        +--> MobileNetV3Small Plant/Leaf Gate
        |       probability < 0.57 -> Unclassified
        |
        +--> EfficientNetB0 7-class disease model
                confidence < 0.30 -> Unclassified
                otherwise -> supported class or Unclassified
```

### Backend Files

- [`api/main.py`](api/main.py) is the active robust inference service.
- [`api/test_backend.py`](api/test_backend.py) exercises the quality-gate cases and a synthetic non-plant/noise case.
- [`api/main-tf-serving.py`](api/main-tf-serving.py) is the earlier TensorFlow Serving integration path for the original six-class model. It is retained for reference; the robust local-model service in `main.py` is the path used by the current robust artifact package.
- [`api/requirements.txt`](api/requirements.txt) pins FastAPI, Uvicorn, multipart upload support, TensorFlow, NumPy, and Pillow.

### API Endpoints

#### `GET /ping`

Returns service health and whether the plant gate and disease classifier were loaded.

Example response shape:

```json
{
  "status": "healthy",
  "message": "Robust Cotton Plant Disease Detector API is online",
  "models_loaded": {
    "plant_leaf_gate": true,
    "disease_classifier": true
  }
}
```

#### `GET /model-info`

Returns the loaded class names, gate threshold, disease threshold, aggregate metrics, classification report, and confusion matrix used by the Model Info page.

#### `POST /predict`

Accepts an image upload using the `file` multipart field. A successful response contains:

- `class`: supported class name or `Unclassified`;
- `confidence`: relevant gate or disease probability;
- `stage`: `quality_gate`, `plant_gate`, `confidence_rejection`, or `disease_classifier`;
- `status`: `passed` or `rejected`;
- `message`: user-readable explanation;
- `details`: quality measurements, gate information, and class probabilities when available.

### Model Artifacts

The active robust package is in [`models/robust/`](models/robust/):

- `cotton_efficientnetb0_robust_open_set.keras` — seven-class disease classifier.
- `plant_leaf_gate.keras` — plant/leaf binary gate.
- `robust_config.json` — class names, thresholds, sources, and aggregate metrics.
- `classification_report.csv` and `confusion_matrix.csv` — final test evaluation.
- `train_manifest.csv`, `validation_manifest.csv`, and `test_manifest.csv` — reproducible image manifests.
- `gate_thresholds.csv` and `disease_thresholds.csv` — validation threshold searches.
- `best_head.keras` and `best_finetune.keras` — selected intermediate checkpoints.
- `head.csv` and `finetune.csv` — training logs.

## Running Locally

### Backend

From the repository root:

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r api/requirements.txt
python api/main.py
```

The API starts on `http://localhost:8000`.

Health check:

```bash
curl http://localhost:8000/ping
```

Prediction request:

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/cotton-leaf.jpg"
```

Run the backend smoke tests after dependencies and model artifacts are available:

```bash
python api/test_backend.py
```

The tests cover a too-small image, a uniform image, and a synthetic noise image. The first two must be rejected by the quality gate. The noise case is passed through the plant gate and its returned details are printed for inspection.

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm start
```

By default, the scanner calls `http://localhost:8000/predict` and the Model Info page calls `http://localhost:8000/model-info`. To point the frontend at a deployed backend, set `REACT_APP_API_URL` to the full prediction endpoint before building:

```bash
REACT_APP_API_URL=https://your-backend.example.com/predict npm run build
```

The frontend reads the model-info URL by replacing `/predict` with `/model-info`, so keep the endpoint suffixes consistent.

## Deployment

The repository includes [`render.yaml`](render.yaml) for a Render Python web service:

- Service name: `cotton-disease-backend`
- Runtime: Python
- Region: Singapore
- Plan: free
- Build command: `pip install -r api/requirements.txt`
- Start command: `cd api && python main.py`
- Python version: `3.11.10`

The frontend is a Create React App project and is deployed at the Vercel URL listed at the top of this README. Configure the frontend's `REACT_APP_API_URL` to the publicly reachable backend `/predict` endpoint, then redeploy the frontend. Because the backend currently allows cross-origin requests, the browser can call the deployed API; production deployments should narrow `allow_origins` to the actual frontend domain.

## Evaluation and Reproducibility

The notebooks do more than report accuracy. They record balanced accuracy, macro and weighted precision/recall/F1, per-class reports, confusion matrices, test errors, training histories, and saved manifests. Macro metrics are especially important here because they prevent a strong result on the most frequent or easiest class from hiding weaker disease categories.

The experiments use random seed `123`, fixed image size 256 × 256, batch size 32, and explicit class ordering. The EfficientNet notebooks keep augmentation inside the model/data pipeline so validation, testing, and inference use deterministic preprocessing. The test set is held out until final evaluation in the file-level stratified workflows.

For the robust system, threshold selection is performed on validation data rather than the final test set. The plant-gate threshold is selected with a minimum plant acceptance requirement, and the disease threshold is selected to retain known cotton images while improving unknown rejection and mixed validation macro-F1.

## Challenges and Solutions

### The Dataset Contains More Than One Representation

The Kaggle download includes alternate processed folders. A naive recursive loader can accidentally combine source images with transformed duplicates. The notebooks therefore target the six-class `40 Images` directory explicitly and audit image integrity and duplicate hashes.

### EfficientNet Preprocessing Differs by Keras Version

The available Keras version did not accept the `include_preprocessing` argument used in some examples. The working solution keeps the model's built-in EfficientNet preprocessing and explicitly rescales the `[0, 1]` input back to `[0, 255]` inside the model before the backbone. This avoids silently feeding the wrong numeric range.

### Open-Dataset Endpoints Were Unreliable

The robust notebook originally considered broader plant and non-plant sources, but some TFDS/Mendeley endpoints returned access errors in the execution environment. The runnable version uses the stable Keras CIFAR-10 loader and records the limitation instead of pretending that CIFAR-10 represents every possible deployment input.

### A Seventh Class Alone Is Not Sufficient

Adding unknown examples to a softmax head helps, but it does not guarantee safe behavior for arbitrary images. The final implementation adds quality checks, a separate MobileNetV3Small plant/leaf gate, confidence calibration, explicit rejection stages, and source-specific evaluation.

### Model Serialization Compatibility

The active API includes a small compatibility patch that removes an unsupported `quantization_config` entry while deserializing a Dense layer. This allows the committed Keras artifacts to load under the pinned TensorFlow/Keras environment.

## Key Takeaways

The main lesson is that high closed-set accuracy is not the same as safe deployment. Experiment 2 improved the six-class benchmark from 95.73% to 98.93% accuracy, but neither a custom CNN nor a strong transfer-learning model knows when an input is outside its label space unless that behavior is designed and evaluated explicitly.

The robust extension turns uncertainty into an application-level decision. It preserves the six-class task, adds a meaningful `Unclassified` outcome, rejects obvious invalid inputs early, and exposes the reason for rejection to both the API consumer and the user interface.

The second lesson is that evaluation must match the risk. A model can achieve excellent accuracy on a curated cotton test split and still fail on people, soil, tools, other plants, or flowers. The robust notebook demonstrates a strong result on its CIFAR-10 unknown distribution, but a production-quality next step is to add a held-out, high-resolution open-set benchmark containing those harder categories and recalibrate thresholds without touching the final test set.

The third lesson is reproducibility. Preserving the exact 3,840/480/468 cotton split, recording the preprocessing range, saving manifests and thresholds, and keeping executed notebooks with outputs makes the improvement measurable rather than anecdotal.

## Limitations and Future Work

- The robust unknown test set is limited to CIFAR-10 animals and objects/vehicles, most at 32 × 32 source resolution.
- Results do not guarantee rejection of every person, object, flower, non-cotton plant, or poor-quality photograph.
- The six supported labels reflect the dataset taxonomy and should not be interpreted as a complete cotton disease ontology.
- Field images may contain multiple leaves, complex backgrounds, occlusion, different lighting, disease mixtures, or symptoms not represented in training.
- The application provides management reminders, not a regulated treatment prescription. Local label requirements and expert confirmation remain necessary.
- The current backend uses permissive CORS (`allow_origins=["*"]`); production hardening should restrict this to the deployed frontend origin.
- Thresholds should be recalibrated when the camera population, geography, image quality, or unknown-image distribution changes.

Recommended next steps are to collect a high-resolution open-set validation suite, add non-cotton plant and flower negatives, test real user photographs, monitor false rejection and false acceptance rates after deployment, and version threshold updates alongside model artifacts.

## License and Attribution

This project is licensed under the [MIT License](LICENSE).

The project uses the [Cotton Plant Disease dataset on Kaggle](https://www.kaggle.com/datasets/dhamur/cotton-plant-disease) and standard open-source TensorFlow/Keras, FastAPI, React, and Tailwind tooling. The robust notebook also references the [Keras CIFAR-10 loader](https://www.tensorflow.org/api_docs/python/tf/keras/datasets/cifar10/load_data), [PlantDoc dataset](https://github.com/pratikkayal/PlantDoc-Dataset), and [PlantDoc paper](https://arxiv.org/html/1911.10317v1).

Please check the terms and attribution requirements of third-party datasets and dependencies separately; the project's MIT license does not automatically relicense those materials.
