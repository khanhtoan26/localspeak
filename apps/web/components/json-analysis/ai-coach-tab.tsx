"use client";

import type { GeminiFeedbackResponse } from "@localspeak/contracts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AiCoachState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; feedback: GeminiFeedbackResponse }
  | { status: "error"; message: string };

type AiCoachTabProps = {
  state: AiCoachState;
  onRequestFeedback: () => void;
  onRetry: () => void;
};

export type { AiCoachState };

export function AiCoachTab({
  state,
  onRequestFeedback,
  onRetry,
}: AiCoachTabProps) {
  if (state.status === "idle") {
    return (
      <section className="flex flex-col gap-4 py-6">
        <p className="text-base text-muted-foreground">
          Get AI feedback after reviewing the deterministic metrics.
        </p>
        <Button className="min-h-[44px]" onClick={onRequestFeedback}>
          Get AI Feedback
        </Button>
      </section>
    );
  }

  if (state.status === "loading") {
    return (
      <section className="flex flex-col gap-4 py-6" aria-busy="true">
        <div role="status" aria-label="Loading AI feedback" className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <p className="text-base text-muted-foreground">
          Generating personalized IELTS feedback…
        </p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="border-[#edd0ca] p-4 flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-foreground m-0">AI feedback unavailable</h2>
        <p className="text-base text-muted-foreground">
          {state.message}
        </p>
        <Button className="min-h-[44px]" onClick={onRetry}>
          Retry AI Feedback
        </Button>
      </Card>
    );
  }

  const { feedback } = state;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground m-0">AI Coach Feedback</h2>

      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3 flex flex-col gap-1">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">Pronunciation Band</span>
          <span className="font-display text-3xl text-foreground">
            {feedback.pronunciationBand}
          </span>
        </Card>
        <Card className="p-3 flex flex-col gap-1">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">Fluency Band</span>
          <span className="font-display text-3xl text-foreground">{feedback.fluencyBand}</span>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground m-0">Top Errors</h3>
        <ol className="flex flex-col gap-3 list-none p-0 m-0">
          {feedback.topErrors.map((error, i) => (
            <li key={i} className="flex flex-col gap-1 text-sm rounded-xl border border-border p-3">
              <strong>{error.word}</strong> — <code>{error.phoneme}</code>
              <p>{error.explanation}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground m-0">Practice Drills</h3>
        <ol className="flex flex-col gap-2 list-decimal list-inside text-sm">
          {feedback.drills.map((drill, i) => (
            <li key={i} className="text-sm">
              {drill}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground m-0">Summary</h3>
        <p className="text-base text-muted-foreground">{feedback.summary}</p>
      </div>
    </section>
  );
}
