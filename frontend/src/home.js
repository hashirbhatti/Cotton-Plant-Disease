import React, { useState } from "react";
import { Header } from "./components/Header";
import { Scanner } from "./components/Scanner";
import { ModelMetrics } from "./components/ModelMetrics";
import { FieldGuide } from "./components/FieldGuide";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("scanner");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-green-700/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Navigation Bar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "scanner" && <Scanner />}
        {activeTab === "metrics" && <ModelMetrics />}
        {activeTab === "guide" && <FieldGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/30 glass-panel py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>CottonGuard AI &copy; {new Date().getFullYear()} — Multi-Stage Robust Engine v2.0</span>
          <span className="text-emerald-400/70 font-mono">Open-Set MobileNetV3 + EfficientNetB0 Pipeline</span>
        </div>
      </footer>

    </div>
  );
};

export default Home;
