"use client";

import { useState } from "react";
import { JsonAnalysisPanel } from "../components/json-analysis/json-analysis-panel";
import { AudioModePanel } from "../components/audio-mode/audio-mode-panel";

type Mode = "json" | "audio";

export default function Home() {
  const [mode, setMode] = useState<Mode>("json");

  return (
    <main className="status-page">
      <div className="status-shell">
        <header className="status-header">
          <span className="status-tag">IELTS Coach</span>
          <h1 className="status-title">LocalSpeak</h1>
          <p className="status-intro">
            Practice pronunciation with AI-powered feedback
          </p>
        </header>

        {/* Mode tabs */}
        <div className="json-tab-list">
          <button
            type="button"
            className="json-tab-button"
            aria-pressed={mode === "json"}
            onClick={() => setMode("json")}
          >
            JSON Analysis
          </button>
          <button
            type="button"
            className="json-tab-button"
            aria-pressed={mode === "audio"}
            onClick={() => setMode("audio")}
          >
            Live Audio
          </button>
        </div>

        {/* Mode content */}
        {mode === "json" ? <JsonAnalysisPanel /> : <AudioModePanel />}
      </div>
    </main>
  );
}

