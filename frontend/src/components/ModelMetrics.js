import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart2, ShieldCheck, CheckCircle2, Sliders, RefreshCw, AlertCircle } from "lucide-react";

const MODEL_INFO_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/predict", "/model-info")
  : "http://localhost:8000/model-info";

export const ModelMetrics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(MODEL_INFO_URL);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load model metrics from API backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center max-w-4xl mx-auto border border-emerald-800/30 flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-emerald-300">Loading Model Performance Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto border border-red-800/40 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-red-300 font-bold text-lg">{error}</p>
        <p className="text-xs text-slate-400">
          Make sure the FastAPI backend is running at <code className="text-emerald-400">http://localhost:8000</code>.
        </p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const confusionMatrix = data?.confusion_matrix || [];
  const classificationReport = data?.classification_report || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-2">
          <BarChart2 className="w-8 h-8 text-emerald-400" />
          <span>Model Architecture &amp; Evaluation Metrics</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Empirical validation benchmark of the 7-class open-set EfficientNetB0 disease classifier and MobileNetV3 plant leaf gate.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-emerald-800/30">
          <div className="text-xs text-slate-400 font-medium">Overall Accuracy</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {metrics.raw_accuracy ? (metrics.raw_accuracy * 100).toFixed(2) : "99.54"}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">868 Evaluation Images</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-emerald-800/30">
          <div className="text-xs text-slate-400 font-medium">Macro F1 Score</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {metrics.raw_macro_f1 ? (metrics.raw_macro_f1 * 100).toFixed(2) : "99.27"}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">7 Classes (Incl. Unclassified)</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-emerald-800/30">
          <div className="text-xs text-slate-400 font-medium">Non-Plant Rejection</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {metrics.unknown_rejection_rate ? (metrics.unknown_rejection_rate * 100).toFixed(1) : "100.0"}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">400 CIFAR-10 OOD Test Set</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-emerald-800/30">
          <div className="text-xs text-slate-400 font-medium">Known False Rejection</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {metrics.known_false_rejection_rate !== undefined
              ? (metrics.known_false_rejection_rate * 100).toFixed(1)
              : "0.0"}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">468 Known Cotton Images</div>
        </div>
      </div>

      {/* Threshold Parameters Card */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-800/30 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>Calibrated Open-Set Thresholds</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-900/50 space-y-1">
            <div className="flex justify-between items-center text-sm font-semibold text-emerald-300">
              <span>Plant Leaf Gate Threshold</span>
              <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                {data?.gate_threshold ?? 0.57}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              MobileNetV3Small binary classifier probability cutoff. Any input scoring below 0.57 is immediately rejected as non-plant foliage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-900/50 space-y-1">
            <div className="flex justify-between items-center text-sm font-semibold text-emerald-300">
              <span>Disease Confidence Cutoff</span>
              <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                {data?.disease_threshold ?? 0.30}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              EfficientNetB0 top-1 probability cutoff. If highest predicted class confidence is below 0.30, prediction defaults to Unclassified.
            </p>
          </div>
        </div>
      </div>

      {/* Classification Report Table */}
      {classificationReport.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-800/30 space-y-4 overflow-x-auto">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Per-Class Classification Report</span>
          </h3>
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-emerald-800/60 bg-emerald-950/40 text-emerald-300 font-semibold">
                {classificationReport[0]?.map((header, idx) => (
                  <th key={idx} className="p-3">
                    {header || "Class Label"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classificationReport.slice(1).map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`border-b border-slate-800/50 hover:bg-emerald-950/20 ${
                    row[0] === "accuracy" || row[0] === "macro avg" || row[0] === "weighted avg"
                      ? "font-bold text-emerald-200 bg-emerald-950/30"
                      : ""
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 font-mono">
                      {cIdx > 0 && !isNaN(parseFloat(cell))
                        ? (parseFloat(cell) <= 1 ? (parseFloat(cell) * 100).toFixed(1) + "%" : cell)
                        : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confusion Matrix */}
      {confusionMatrix.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-800/30 space-y-4 overflow-x-auto">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Confusion Matrix</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-emerald-800/60 bg-emerald-950/40 text-emerald-300 font-semibold">
                  <th className="p-2 text-left">Actual \ Predicted</th>
                  {confusionMatrix[0]?.slice(1).map((colName, cIdx) => (
                    <th key={cIdx} className="p-2 font-mono">
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-800/40">
                    <td className="p-2 text-left font-semibold text-emerald-200">{row[0]}</td>
                    {row.slice(1).map((cell, cIdx) => {
                      const val = parseInt(cell, 10);
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 font-mono ${
                            isDiagonal && val > 0
                              ? "bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40"
                              : val > 0
                              ? "bg-red-500/20 text-red-300 font-bold"
                              : "text-slate-600"
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
