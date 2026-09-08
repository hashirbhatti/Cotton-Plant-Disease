import React, { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  Zap,
  Activity
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/predict";

const DISEASE_INFO = {
  "Aphids": {
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    barColor: "from-amber-500 to-yellow-400",
    summary: "Infestation of tiny sap-sucking insects causing foliage distortion and honeydew mold.",
    remedy: "Apply neem oil, insecticidal soap, or target systemic insecticides like Imidacloprid if economic thresholds are exceeded."
  },
  "Army worm": {
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    barColor: "from-red-600 to-rose-400",
    summary: "Voracious foliage-feeding caterpillars capable of rapid defoliation.",
    remedy: "Deploy biological controls like Bacillus thuringiensis (Bt) or Spinetoram during early instar stage."
  },
  "Bacterial blight": {
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    barColor: "from-orange-500 to-amber-400",
    summary: "Angular water-soaked leaf lesions caused by Xanthomonas citri pv. malvacearum.",
    remedy: "Use resistant cultivars, copper oxychloride sprays, and strictly avoid overhead irrigation."
  },
  "Healthy": {
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    barColor: "from-emerald-500 to-green-400",
    summary: "Optimal physiological vigor with no visible pathogen or pest lesions.",
    remedy: "Maintain standard balanced NPK fertilization and routine field monitoring."
  },
  "Powdery mildew": {
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    barColor: "from-purple-500 to-pink-400",
    summary: "Fungal infection producing white powdery mycelial coats on leaf undersides.",
    remedy: "Apply wettable sulfur or systemic triazole fungicides like Hexaconazole."
  },
  "Target spot": {
    badgeColor: "bg-red-600/20 text-red-300 border-red-600/30",
    barColor: "from-red-500 to-amber-500",
    summary: "Concentric circular leaf spots caused by Corynespora cassiicola causing premature leaf drop.",
    remedy: "Improve canopy air airflow; apply Strobilurin/SDHI fungicides at bloom."
  },
  "Unclassified": {
    badgeColor: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    barColor: "from-gray-500 to-slate-400",
    summary: "Open-set rejection: Image does not match known cotton plant disease profiles.",
    remedy: "Please capture a clear, well-lit photograph focusing directly on a cotton leaf."
  }
};

export const Scanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Quality, 2: Gate, 3: Disease
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setError(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageMeta({ width: img.width, height: img.height });
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setActiveStep(1); // Quality Check

    // Simulate step progression for responsive UX
    const timer1 = setTimeout(() => setActiveStep(2), 300); // Plant Gate
    const timer2 = setTimeout(() => setActiveStep(3), 600); // Disease Classifier

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      setResult(response.data);
      setActiveStep(3);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to process image. Make sure the FastAPI backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageMeta(null);
    setResult(null);
    setError(null);
    setActiveStep(0);
    setShowDetails(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Intro Banner */}
      <div className="text-center space-y-3 py-4">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Zap className="w-3.5 h-3.5" />
          <span>Multi-Stage Robust inference Pipeline</span>
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cotton Leaf Health Diagnostic System
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
          Upload an image of a cotton plant leaf. Our two-stage AI pipeline automatically validates leaf quality and rejects non-plant images or low-confidence inputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Image Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-emerald-800/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Image Input</span>
            </h3>

            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-emerald-600/40 hover:border-emerald-400/80 rounded-xl p-8 text-center bg-emerald-950/20 hover:bg-emerald-950/40 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="leaf-upload"
                />
                <label htmlFor="leaf-upload" className="cursor-pointer flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Drop leaf image here, or <span className="text-emerald-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP (Min 32x32)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-emerald-700/40 group">
                  <img
                    src={previewUrl}
                    alt="Uploaded leaf"
                    className="w-full h-64 object-cover object-center"
                  />
                  {imageMeta && (
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur text-[11px] font-mono text-emerald-300 px-2 py-1 rounded border border-emerald-600/30">
                      {imageMeta.width} x {imageMeta.height} px
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={processImage}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Run Robust Diagnosis</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetAll}
                    disabled={loading}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 disabled:opacity-50"
                    title="Clear Image"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines Mini Card */}
          <div className="glass-card rounded-xl p-4 text-xs text-slate-300 space-y-2 border border-emerald-800/30">
            <div className="font-semibold text-emerald-300 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Robust Gate Verification:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Quality Gate rejects images &lt;32x32 or std dev &lt;3.0 (blank images).</li>
              <li>Plant Gate (MobileNetV3) rejects non-leaf inputs (threshold 0.57).</li>
              <li>Disease Model (EfficientNetB0) rejects predictions below 30% confidence.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Progress & Results */}
        <div className="lg:col-span-7 space-y-6">

          {/* Stepper Progress Indicator */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl border border-emerald-800/30">
            <h3 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-4 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Pipeline Stage Status</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Step 1 */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeStep >= 1
                    ? result?.stage === "quality_gate" && result?.status === "rejected"
                      ? "bg-red-950/40 border-red-500/50 text-red-300"
                      : "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="text-[11px] font-semibold">1. Quality Gate</div>
                <div className="text-[10px] mt-1 font-mono">32x32 &amp; StdDev</div>
                {activeStep === 1 && loading && (
                  <div className="mt-2 text-emerald-400 text-xs flex justify-center">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {activeStep >= 1 && !loading && (
                  <div className="mt-1 flex justify-center">
                    {result?.stage === "quality_gate" && result?.status === "rejected" ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeStep >= 2
                    ? result?.stage === "plant_gate" && result?.status === "rejected"
                      ? "bg-red-950/40 border-red-500/50 text-red-300"
                      : "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="text-[11px] font-semibold">2. Leaf Gate</div>
                <div className="text-[10px] mt-1 font-mono">MobileNetV3 (0.57)</div>
                {activeStep === 2 && loading && (
                  <div className="mt-2 text-emerald-400 text-xs flex justify-center">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {activeStep >= 2 && !loading && (
                  <div className="mt-1 flex justify-center">
                    {result?.stage === "plant_gate" && result?.status === "rejected" ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeStep >= 3
                    ? result?.status === "rejected" && (result?.stage === "confidence_rejection" || result?.stage === "disease_classifier")
                      ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                      : "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="text-[11px] font-semibold">3. Disease Engine</div>
                <div className="text-[10px] mt-1 font-mono">EfficientNetB0 (0.30)</div>
                {activeStep === 3 && loading && (
                  <div className="mt-2 text-emerald-400 text-xs flex justify-center">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {activeStep >= 3 && !loading && result && (
                  <div className="mt-1 flex justify-center">
                    {result?.status === "passed" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-start space-x-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-300">Connection or Processing Error</div>
                <div className="text-xs text-red-200/80 mt-1">{error}</div>
              </div>
            </div>
          )}

          {/* Idle Placeholder */}
          {!result && !loading && !error && (
            <div className="glass-panel rounded-2xl p-12 text-center border border-emerald-900/30 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
              <Activity className="w-12 h-12 text-emerald-500/40 mb-3 animate-pulse" />
              <p className="text-base font-semibold text-slate-300">System Ready</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload a leaf image on the left and click "Run Robust Diagnosis" to test through the gate pipeline.
              </p>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="glass-panel rounded-2xl p-12 text-center border border-emerald-800/40 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-900/40"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-lg font-bold text-white">Running Multi-Stage Verification</p>
              <p className="text-xs text-emerald-300/80 mt-1 animate-pulse font-mono">
                {activeStep === 1 && "Evaluating Image Quality & Pixel Variance..."}
                {activeStep === 2 && "Checking Plant/Leaf Gate (MobileNetV3)..."}
                {activeStep === 3 && "Analyzing Disease Patterns (EfficientNetB0)..."}
              </p>
            </div>
          )}

          {/* Result Output Card */}
          {result && !loading && (
            <div className="glass-panel rounded-2xl p-6 space-y-6 border border-emerald-700/40 shadow-2xl">
              
              {/* Outcome Header */}
              {result.status === "passed" ? (
                /* SUCCESS RESULT */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-800/40">
                    <div>
                      <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                        Diagnosis Identified
                      </span>
                      <h3 className="text-2xl font-extrabold text-white mt-0.5">
                        {result.class}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          DISEASE_INFO[result.class]?.badgeColor || "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {(result.confidence * 100).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Model Confidence</span>
                      <span className="font-mono font-bold text-emerald-300">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-950">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          DISEASE_INFO[result.class]?.barColor || "from-emerald-500 to-green-400"
                        } transition-all duration-1000`}
                        style={{ width: `${Math.min(100, Math.max(0, result.confidence * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Summary & Remedy Box */}
                  <div className="glass-card rounded-xl p-4 space-y-3 border border-emerald-800/30">
                    <div>
                      <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                        Symptom Summary
                      </div>
                      <p className="text-sm text-slate-200 mt-1">
                        {DISEASE_INFO[result.class]?.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-900/40">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Recommended Agronomic Action</span>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                        {DISEASE_INFO[result.class]?.remedy}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* REJECTED / UNCLASSIFIED RESULT */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start space-x-3">
                    <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-amber-300">
                          Unclassified Input Rejected
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300">
                          {result.stage}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-amber-100 mt-1">
                        System Message: "{result.message}"
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4 text-xs text-slate-300 space-y-2 border border-amber-900/30">
                    <div className="font-bold text-amber-300">Why was this image rejected?</div>
                    {result.stage === "quality_gate" && (
                      <div className="space-y-2">
                        <p className="text-slate-400">
                          The uploaded image failed low-level quality checks. This may indicate:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-500 space-y-1 ml-2">
                          <li>Resolution below 32x32 pixels</li>
                          <li>Blank or solid-color image (pixel standard deviation &lt; 3.0)</li>
                          <li>Corrupt or unreadable image file</li>
                        </ul>
                      </div>
                    )}
                    {result.stage === "plant_gate" && (
                      <div className="space-y-2">
                        <p className="text-slate-400">
                          The Plant Leaf Gate (MobileNetV3Small) determined this image does not contain a plant leaf.
                        </p>
                        <div className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-700/50">
                          <span className="text-xs text-slate-400">Detected probability:</span>
                          <span className="font-mono font-bold text-red-400">
                            {((result.details?.plant_gate?.probability || 0) * 100).toFixed(1)}%
                          </span>
                          <span className="text-slate-500">/</span>
                          <span className="text-xs text-emerald-400">Required: {((result.details?.plant_gate?.threshold || 0.57) * 100).toFixed(0)}%+</span>
                        </div>
                      </div>
                    )}
                    {result.stage === "confidence_rejection" && (
                      <div className="space-y-2">
                        <p className="text-slate-400">
                          The AI model could not confidently identify a specific disease. This may indicate:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-500 space-y-1 ml-2">
                          <li>Multiple overlapping conditions</li>
                          <li>Unusual disease presentation</li>
                          <li>Image quality issues</li>
                          <li>Novel/unknown condition</li>
                        </ul>
                        <div className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-700/50">
                          <span className="text-xs text-slate-400">Best match confidence:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {((result.confidence || 0) * 100).toFixed(1)}%
                          </span>
                          <span className="text-slate-500">/</span>
                          <span className="text-xs text-emerald-400">Minimum: 30%</span>
                        </div>
                      </div>
                    )}
                    {result.stage === "disease_classifier" && (
                      <div className="space-y-2">
                        <p className="text-slate-400">
                          The disease classifier identified this image as matching the "Unclassified" category in the training set.
                        </p>
                        <p className="text-xs text-slate-500">
                          This category was specifically trained to handle unknown/out-of-distribution inputs.
                        </p>
                      </div>
                    )}
                    {/* Rejection Tip Box */}
                    <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-xs text-emerald-200/80 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-300">Tip for better results: </span>
                        Ensure your image shows a clear cotton leaf with visible symptoms, captured in natural daylight with the affected area in focus.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible Details / Probabilities */}
              <div className="pt-2 border-t border-emerald-900/40">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-xs font-semibold text-emerald-300 flex items-center justify-between transition-colors border border-emerald-800/30"
                >
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4" />
                    <span>View All Class Probabilities &amp; Gate Metrics</span>
                  </span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDetails && (
                  <div className="mt-3 space-y-4 text-xs">
                    {/* Probabilities list */}
                    {result.details?.disease_classifier?.all_probabilities && (
                      <div className="space-y-2">
                        <div className="font-bold text-slate-300">Disease Probability Distribution:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(result.details.disease_classifier.all_probabilities).map(([cls, prob]) => (
                            <div
                              key={cls}
                              className={`p-2 rounded-lg border flex items-center justify-between ${
                                cls === result.class
                                  ? "bg-emerald-900/40 border-emerald-500/50 text-white font-bold"
                                  : "bg-slate-900/30 border-slate-800 text-slate-400"
                              }`}
                            >
                              <span>{cls}</span>
                              <span className="font-mono">{(prob * 100).toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stage Metrics */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                      <div>Quality Gate StdDev: {result.details?.quality?.std_dev ?? "N/A"}</div>
                      <div>Plant Gate Probability: {result.details?.plant_gate?.probability ?? "N/A"} (Threshold: {result.details?.plant_gate?.threshold ?? 0.57})</div>
                      <div>Disease Classifier Top Score: {result.details?.disease_classifier?.top_confidence ?? "N/A"} (Threshold: 0.30)</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
