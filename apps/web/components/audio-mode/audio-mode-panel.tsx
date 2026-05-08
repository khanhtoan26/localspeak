"use client";

import { useState, useMemo } from "react";
import { useDeepgramSession } from "./use-deepgram-session";
import { RecordButton } from "./record-button";
import { LiveAnalysisPanel } from "./live-analysis-panel";
import { scorePronunciation } from "../../lib/audio/score-pronunciation";
import type { PronunciationResult } from "../../lib/audio/score-pronunciation";

function WordScoreCard({ result }: { result: PronunciationResult }) {
  const levelColor: Record<string, string> = {
    good: "var(--color-ok)",
    ok: "var(--color-warning, #f59e0b)",
    weak: "var(--color-error)",
    missed: "var(--color-muted, #6b7280)",
  };

  return (
    <div className="json-analysis-card" style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span className="json-input-label" style={{ margin: 0 }}>Pronunciation Score</span>
        <span style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: result.overallScore >= 80 ? "var(--color-ok)" : result.overallScore >= 60 ? "var(--color-warning, #f59e0b)" : "var(--color-error)",
        }}>
          {result.overallScore}/100
        </span>
      </div>

      {/* Word-by-word scores */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {result.wordScores.map((ws, i) => (
          <span
            key={i}
            title={ws.spoken ? `"${ws.spoken}" (${Math.round(ws.confidence * 100)}%)` : "not detected"}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-bg)",
              backgroundColor: levelColor[ws.level],
              opacity: ws.level === "missed" ? 0.5 : 1,
              textDecoration: ws.level === "missed" ? "line-through" : "none",
              cursor: "default",
            }}
          >
            {ws.expected}
          </span>
        ))}
      </div>

      {/* Fluency metrics */}
      <div style={{ display: "flex", gap: "24px", fontSize: "0.8rem", color: "var(--color-muted, #888)" }}>
        <span>⏱ {result.fluency.wordsPerMinute} WPM</span>
        <span>⏸ {result.fluency.hesitationCount} pause{result.fluency.hesitationCount !== 1 ? "s" : ""}</span>
        <span>🕐 {result.fluency.totalDurationSeconds}s</span>
      </div>

      <p style={{ marginTop: "12px", fontSize: "0.875rem", color: "var(--color-fg)" }}>
        {result.summary}
      </p>
    </div>
  );
}

export function AudioModePanel() {
  const [referenceText, setReferenceText] = useState("");
  const { status, transcript, error, analyserNode, start, stop } =
    useDeepgramSession(referenceText);

  const pronunciationResult = useMemo<PronunciationResult | null>(() => {
    if (status !== "complete" || transcript.words.length === 0) return null;
    return scorePronunciation(transcript.words, referenceText);
  }, [status, transcript.words, referenceText]);

  // Build display text: final + interim
  const displayText = transcript.final
    ? transcript.interim
      ? `${transcript.final} ${transcript.interim}`
      : transcript.final
    : transcript.interim || "";

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

      {/* Live transcript */}
      <div style={{ marginTop: "24px" }}>
        <LiveAnalysisPanel
          analysis={displayText}
          isStreaming={status === "recording"}
        />
      </div>

      {/* Pronunciation score card (after recording) */}
      {pronunciationResult && <WordScoreCard result={pronunciationResult} />}
    </div>
  );
}
