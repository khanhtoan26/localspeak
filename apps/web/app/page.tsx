"use client";

import { useState } from "react";
import { JsonAnalysisPanel } from "../components/json-analysis/json-analysis-panel";
import { AudioModePanel } from "../components/audio-mode/audio-mode-panel";

type Mode = "json" | "audio";

export default function Home() {
  const [mode, setMode] = useState<Mode>("json");

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold text-center mb-6">LocalSpeak</h1>

      {/* Mode tabs */}
      <div className="flex justify-center gap-1 mb-8">
        <button
          type="button"
          onClick={() => setMode("json")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            mode === "json"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          JSON Analysis
        </button>
        <button
          type="button"
          onClick={() => setMode("audio")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            mode === "audio"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          Live Audio
        </button>
      </div>

      {/* Mode content */}
      {mode === "json" ? <JsonAnalysisPanel /> : <AudioModePanel />}
    </main>
  );
}

