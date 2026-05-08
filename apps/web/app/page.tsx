"use client";

import { useState } from "react";
import { JsonAnalysisPanel } from "../components/json-analysis/json-analysis-panel";
import { AudioModePanel } from "../components/audio-mode/audio-mode-panel";

type Mode = "json" | "audio";

export default function Home() {
  const [mode, setMode] = useState<Mode>("json");

  return (
    <main className="status-page">
      <div
        className={`status-shell status-shell--practice${
          mode === "json" ? " status-shell--dashboard" : ""
        }`}
      >
        <header className="status-header">
          <span className="status-tag">IELTS Coach</span>
          <h1 className="status-title">LocalSpeak</h1>
          <p className="status-intro">
            Practice pronunciation with AI-powered feedback
          </p>
        </header>

        <div className="practice-layout">
          <aside className="practice-sidebar">
            <p className="practice-sidebar__eyebrow">Practice path</p>
            <div className="mode-switch-list" aria-label="Practice paths">
              <button
                type="button"
                className="mode-switch-button"
                aria-label="JSON Analysis"
                aria-pressed={mode === "json"}
                onClick={() => setMode("json")}
              >
                <span className="mode-switch-button__label">JSON Analysis</span>
                <span className="mode-switch-button__helper">
                  Import assessment data to inspect scores, pauses, words, and phonemes.
                </span>
              </button>
              <button
                type="button"
                className="mode-switch-button"
                aria-label="Live Audio Practice"
                aria-pressed={mode === "audio"}
                onClick={() => setMode("audio")}
              >
                <span className="mode-switch-button__label">
                  Live Audio Practice
                </span>
                <span className="mode-switch-button__helper">
                  Record from your microphone and watch live transcript feedback.
                </span>
              </button>
            </div>
          </aside>

          <div className="practice-content">
            <div className="mode-panel" hidden={mode !== "json"}>
              <JsonAnalysisPanel />
            </div>
            <div className="mode-panel" hidden={mode !== "audio"}>
              <AudioModePanel />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
