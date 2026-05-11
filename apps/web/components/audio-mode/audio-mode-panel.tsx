"use client";

import { useState, useMemo } from "react";
import { useDeepgramSession } from "./use-deepgram-session";
import { RecordButton } from "./record-button";
import { LiveAnalysisPanel } from "./live-analysis-panel";
import { scorePronunciation } from "../../lib/audio/score-pronunciation";
import type { PronunciationResult } from "../../lib/audio/score-pronunciation";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const scoreColor: Record<"good" | "okay" | "weak", string> = {
  good: "text-success",
  okay: "text-warning",
  weak: "text-danger",
};

function getChipColor(level: "good" | "ok" | "weak" | "missed"): string {
  switch (level) {
    case "good":
      return "bg-[#f0f7f2] text-success border border-[#d9e8dd]";
    case "ok":
      return "bg-[#fdf7ec] text-warning border border-[#eadcb8]";
    case "weak":
    case "missed":
      return "bg-[#fdf1ee] text-danger border border-[#edd0ca]";
  }
}

function WordScoreCard({ result }: { result: PronunciationResult }) {
  const level = getScoreLevel(result.overallScore);

  return (
    <Card className="p-4 min-w-0">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
          Pronunciation Score
        </span>
        <span className={cn("font-display text-3xl", scoreColor[level])}>
          {result.overallScore}/100
        </span>
      </div>

      {/* Word-by-word scores */}
      <div className="flex flex-wrap gap-1.5">
        {result.wordScores.map((ws, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-center rounded-xl px-3 py-1.5 text-sm font-medium min-h-[44px]",
              getChipColor(ws.level),
            )}
            title={ws.spoken ? `"${ws.spoken}" (${Math.round(ws.confidence * 100)}%)` : "not detected"}
          >
            {ws.expected}
          </span>
        ))}
      </div>

      {/* Fluency metrics */}
      <div className="flex flex-wrap gap-3 font-mono text-[11px] text-subtle mt-2">
        <span>{result.fluency.wordsPerMinute} WPM</span>
        <span>
          {result.fluency.hesitationCount} pause
          {result.fluency.hesitationCount !== 1 ? "s" : ""}
        </span>
        <span>{result.fluency.totalDurationSeconds}s total</span>
      </div>

      <p className="text-sm text-muted-foreground mt-2">{result.summary}</p>
    </Card>
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
    <div className="flex flex-col gap-5 rounded-[28px] border border-border bg-card/90 p-5 shadow-sm sm:p-6">
      <header>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
          Live Audio
        </span>
        <h1 className="mt-4 font-display text-4xl leading-none tracking-[-0.04em] text-foreground">
          Practice the sentence out loud.
        </h1>
        <p className="mt-3 max-w-[720px] text-base leading-7 text-muted-foreground">
          Record a focused attempt, watch the transcript stream in, and compare
          the pronunciation score against your target sentence.
        </p>
      </header>
      {/* Reference text input */}
      <label htmlFor="reference-text" className="block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        Reference sentence
      </label>
      <Input
        id="reference-text"
        type="text"
        value={referenceText}
        onChange={(e) => setReferenceText(e.target.value)}
        placeholder="Enter the sentence you want to practice..."
        className="bg-input"
        disabled={status === "recording" || status === "connecting"}
      />

      {/* Record button with waveform */}
      <div className="flex flex-col gap-2">
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
        <p className="text-sm text-danger font-medium">{error}</p>
      )}

      {/* Live transcript */}
      <div className="flex flex-col gap-2">
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
