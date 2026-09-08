import React from "react";
import { Leaf, Activity, BarChart2, BookOpen, ShieldCheck } from "lucide-react";

export const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-emerald-900/40 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/30">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                CottonGuard <span className="text-emerald-400 font-extrabold">AI</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                v2.0 Robust
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              Open-Set Multi-Stage Leaf Diagnostic Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/40">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "scanner"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                : "text-emerald-200/70 hover:text-white hover:bg-emerald-900/40"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "metrics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                : "text-emerald-200/70 hover:text-white hover:bg-emerald-900/40"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Model Info</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "guide"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                : "text-emerald-200/70 hover:text-white hover:bg-emerald-900/40"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Field Guide</span>
          </button>
        </nav>

        {/* Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-emerald-300/80 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-700/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Open-Set Protection</span>
        </div>

      </div>
    </header>
  );
};
