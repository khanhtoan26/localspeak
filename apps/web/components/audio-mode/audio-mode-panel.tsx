"use client";

import { useState, useMemo } from "react";
import { useDeepgramSession } from "./use-deepgram-session";
import { RecordButton } from "./record-button";
import { LiveAnalysisPanel } from "./live-analysis-panel";
import { scorePronunciation } from "../../lib/audio/score-pronunciation";
import type { PronunciationResult } from "../../lib/audio/score-pronunciation";

function WordScoreCard({ result }: { result: PronunciationResult }) {
  return (
    <div className="json-analysis-card audio-score-card">
      <div className="audio-score-card__header">
        <span className="json-input-label audio-score-card__label">
          Pronunciation Score
        </span>
        <span
          className={`audio-score-card__value audio-score-card__value--${getScoreLevel(
            result.overallScore,
          )}`}
        >
          {result.overallScore}/100
        </span>
      </div>

      {/* Word-by-word scores */}
      <div className="audio-word-chip-list">
        {result.wordScores.map((ws, i) => (
          <span
            key={i}
            className={`audio-word-chip audio-word-chip--${ws.level}`}
            title={ws.spoken ? `"${ws.spoken}" (${Math.round(ws.confidence * 100)}%)` : "not detected"}
          >
            {ws.expected}
          </span>
        ))}
      </div>

      {/* Fluency metrics */}
      <div className="audio-fluency-meta">
        <span>{result.fluency.wordsPerMinute} WPM</span>
        <span>
          {result.fluency.hesitationCount} pause
          {result.fluency.hesitationCount !== 1 ? "s" : ""}
        </span>
        <span>{result.fluency.totalDurationSeconds}s total</span>
      </div>

      <p className="audio-score-card__summary">{result.summary}</p>
    </div>
  );
}

function getScoreLevel(score: number): "good" | "okay" | "weak" {
  if (score >= 80) return "good";
  if (score >= 60) return "okay";
  return "weak";
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
        className="json-input-textarea audio-reference-input"
        disabled={status === "recording" || status === "connecting"}
      />

      {/* Record button with waveform */}
      <div className="audio-section">
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
      <div className="audio-section">
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
