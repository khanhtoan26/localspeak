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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Reference text input */}
      <div>
        <label
          htmlFor="reference-text"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reference sentence
        </label>
        <input
          id="reference-text"
          type="text"
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          placeholder="Enter the sentence you want to practice..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={status === "recording" || status === "connecting"}
        />
      </div>

      {/* Record button with waveform */}
      <RecordButton
        status={status}
        onStart={() => void start()}
        onStop={stop}
        disabled={!referenceText.trim()}
        analyserNode={analyserNode}
      />

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Live analysis output */}
      <LiveAnalysisPanel
        analysis={analysis}
        isStreaming={status === "recording"}
      />
    </div>
  );
}
