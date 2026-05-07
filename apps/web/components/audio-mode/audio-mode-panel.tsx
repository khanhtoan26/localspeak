"use client";

import { useState } from "react";
import { useAudioSession } from "./use-audio-session";
import { RecordButton } from "./record-button";
import { LiveAnalysisPanel } from "./live-analysis-panel";

export function AudioModePanel() {
  const [referenceText, setReferenceText] = useState("");
  const { status, analysis, error, analyserNode, start, stop } =
    useAudioSession(referenceText);

  return (
    <div className="json-analysis-card">
      {/* Reference text input */}
      <label htmlFor="reference-text" className="json-input-label">
        Reference sentence
      </label>
      <input
        id="reference-text"
        type="text"
        value={referenceText}
        onChange={(e) => setReferenceText(e.target.value)}
        placeholder="Enter the sentence you want to practice..."
        className="json-input-textarea"
        style={{ minHeight: "auto", padding: "12px 16px" }}
        disabled={status === "recording" || status === "connecting"}
      />

      {/* Record button with waveform */}
      <div style={{ marginTop: "24px" }}>
        <RecordButton
          status={status}
          onStart={() => void start()}
          onStop={stop}
          disabled={!referenceText.trim()}
          analyserNode={analyserNode}
        />
      </div>

      {/* Error display */}
      {error && (
        <p className="json-analysis-error">{error}</p>
      )}

      {/* Live analysis output */}
      <div style={{ marginTop: "24px" }}>
        <LiveAnalysisPanel
          analysis={analysis}
          isStreaming={status === "recording"}
        />
      </div>
    </div>
  );
}
