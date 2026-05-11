"use client";

import { useState, useMemo } from "react";
import { useDeepgramSession } from "./use-deepgram-session";
import { LiveAnalysisPanel } from "./live-analysis-panel";
import { scorePronunciation } from "../../lib/audio/score-pronunciation";
import type { PronunciationResult } from "../../lib/audio/score-pronunciation";
import { RecordingControl } from "@/components/design-system/recording-control";
import { PracticeReadinessCard } from "@/components/design-system/practice-readiness-card";
import { StatePanel } from "@/components/design-system/state-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const scoreColor: Record<"good" | "okay" | "weak", string> = {
  good: "text-success-foreground",
  okay: "text-warning-foreground",
  weak: "text-destructive",
};

function getChipColor(level: "good" | "ok" | "weak" | "missed"): string {
  switch (level) {
    case "good":
      return "border border-success-border bg-success/10 text-success-foreground";
    case "ok":
      return "border border-warning-border bg-warning/10 text-warning-foreground";
    case "weak":
    case "missed":
      return "border border-destructive-border bg-destructive/10 text-destructive";
  }
}

function WordScoreCard({ result }: { result: PronunciationResult }) {
  const level = getScoreLevel(result.overallScore);

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <CardTitle>Pronunciation result</CardTitle>
          <CardDescription>{result.summary}</CardDescription>
        </div>
        <span className={cn("shrink-0 text-3xl font-semibold", scoreColor[level])}>
          {result.overallScore}/100
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5" aria-label="Word pronunciation scores">
          {result.wordScores.map((ws, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-xl px-3 py-1.5 text-sm font-medium",
                getChipColor(ws.level),
              )}
              title={ws.spoken ? `"${ws.spoken}" (${Math.round(ws.confidence * 100)}%)` : "not detected"}
            >
              {ws.expected}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground">
          <span>{result.fluency.wordsPerMinute} WPM</span>
          <span>
            {result.fluency.hesitationCount} pause
            {result.fluency.hesitationCount !== 1 ? "s" : ""}
          </span>
          <span>{result.fluency.totalDurationSeconds}s total duration</span>
        </div>
      </CardContent>
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
  const hasReferenceText = Boolean(referenceText.trim());
  const readinessStatus = !hasReferenceText
    ? "empty"
    : status === "recording"
      ? "recording"
      : status === "complete"
        ? "complete"
        : "ready";

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="Live Audio Practice">
      <Card className="min-w-0">
        <CardHeader>
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
            Live Audio Practice
          </span>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Practice the sentence out loud.
          </CardTitle>
          <CardDescription className="max-w-[720px] text-base leading-7">
            Record a focused attempt, watch the transcript stream in, and compare
            the pronunciation score against your target sentence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label
            htmlFor="reference-text"
            className="block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
          >
            Reference sentence
          </Label>
          <Input
            id="reference-text"
            type="text"
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            placeholder="Enter one sentence you want to practice."
            className="min-w-0 bg-input"
            disabled={status === "recording" || status === "connecting"}
          />
        </CardContent>
      </Card>

      <PracticeReadinessCard
        title={hasReferenceText ? "Get ready to speak" : "Reference sentence needed"}
        description={
          hasReferenceText
            ? "Read the sentence once, then record one focused attempt."
            : "Enter one sentence first. Recording stays disabled until LocalSpeak knows what you want to practice."
        }
        status={readinessStatus}
      />

      <RecordingControl
        status={status}
        disabled={!hasReferenceText}
        onStart={() => void start()}
        onStop={stop}
        analyserNode={analyserNode}
        disabledMessage="Enter one sentence first. Recording stays disabled until LocalSpeak knows what you want to practice."
      />

      {error && (
        <StatePanel
          title="We couldn't start recording. Check microphone permission and try again."
          description={error}
          tone="destructive"
        />
      )}

      <LiveAnalysisPanel
        analysis={displayText}
        isStreaming={status === "recording"}
      />

      {pronunciationResult && <WordScoreCard result={pronunciationResult} />}
    </section>
  );
}
