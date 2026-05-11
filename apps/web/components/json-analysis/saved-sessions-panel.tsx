"use client";

import { useCallback, useEffect, useState } from "react";
import {
  JsonAnalysisResponseSchema,
  SavedSessionCreateResponseSchema,
  SavedSessionDetailResponseSchema,
  SavedSessionListResponseSchema,
  type GeminiFeedbackResponse,
  type JsonAnalysisResponse,
  type SavedSessionListItem,
} from "@localspeak/contracts";
import type { AiCoachState } from "./ai-coach-tab";
import { tryGetOrCreateOwnerKey } from "../../lib/saved-sessions/owner-key";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SavedSessionsPanelProps = {
  analysis: JsonAnalysisResponse;
  aiCoachState: AiCoachState;
  onReopen: (analysis: JsonAnalysisResponse, marker: string) => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; sessions: SavedSessionListItem[] }
  | { status: "error"; message: string };

const HISTORY_LOAD_ERROR =
  "We couldn't load saved attempts. Refresh and try again.";
const SAVE_ERROR = "We couldn't save this result. Check your connection and try again.";
const SAVE_SUCCESS = "Saved to this browser's history.";

export function SavedSessionsPanel({
  analysis,
  aiCoachState,
  onReopen,
}: SavedSessionsPanelProps) {
  const [ownerKey] = useState(() => tryGetOrCreateOwnerKey());
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reopenError, setReopenError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!ownerKey) return;

    try {
      const response = await fetch(
        "/api/saved-sessions",
        {
          cache: "no-store",
          headers: { "X-Localspeak-Owner-Key": ownerKey },
        },
      );
      if (!response.ok) throw new Error(`List failed with status ${response.status}`);
      const data = SavedSessionListResponseSchema.parse(await response.json());
      setLoadState({ status: "ready", sessions: data.sessions });
    } catch {
      setLoadState({ status: "error", message: HISTORY_LOAD_ERROR });
    }
  }, [ownerKey]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleSave = useCallback(async () => {
    if (!ownerKey) return;

    setIsSaving(true);
    setSaveStatus(null);
    const feedback = aiCoachState.status === "done" ? aiCoachState.feedback : undefined;
    const body = buildSaveRequest(ownerKey, analysis, feedback);

    try {
      const response = await fetch("/api/saved-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Localspeak-Owner-Key": ownerKey,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Save failed with status ${response.status}`);
      SavedSessionCreateResponseSchema.parse(await response.json());
      setSaveStatus(SAVE_SUCCESS);
      await loadSessions();
    } catch {
      setSaveStatus(SAVE_ERROR);
    } finally {
      setIsSaving(false);
    }
  }, [aiCoachState, analysis, loadSessions, ownerKey]);

  const handleReopen = useCallback(
    async (sessionId: string) => {
      if (!ownerKey) return;

      setReopenError(null);
      try {
        const response = await fetch(
          `/api/saved-sessions/${sessionId}`,
          {
            cache: "no-store",
            headers: { "X-Localspeak-Owner-Key": ownerKey },
          },
        );
        if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
        const data = SavedSessionDetailResponseSchema.parse(await response.json());
        const savedAnalysis = JsonAnalysisResponseSchema.parse(data.session.metrics);
        onReopen(savedAnalysis, "Reopened saved result");
      } catch {
        setReopenError("We couldn't reopen this result. Refresh and try again.");
      }
    },
    [onReopen, ownerKey],
  );

  if (!ownerKey) {
    return (
      <aside className="flex min-w-0 flex-col gap-4" aria-label="Saved sessions">
        <Card>
          <CardHeader>
            <CardTitle>Saved sessions</CardTitle>
            <CardDescription>
              This browser cannot create secure local saved-session keys.
            </CardDescription>
          </CardHeader>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="flex min-w-0 flex-col gap-4" aria-label="Saved sessions">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle>Saved sessions</CardTitle>
              <CardDescription>
                Reopen a previous analysis without replacing the current input until you choose one.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="min-h-[44px] shrink-0"
            >
              {isSaving ? "Saving…" : "Save Result"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

      {saveStatus ? <p className="text-sm text-muted-foreground">{saveStatus}</p> : null}
      {reopenError ? <p className="text-sm font-medium text-destructive">{reopenError}</p> : null}

      {loadState.status === "loading" ? (
        <p className="text-base text-muted-foreground">Loading saved attempts...</p>
      ) : null}

      {loadState.status === "error" ? (
        <p className="text-sm font-medium text-destructive">{loadState.message}</p>
      ) : null}

      {loadState.status === "ready" && loadState.sessions.length === 0 ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-foreground m-0">No saved attempts yet</h3>
          <p className="text-base text-muted-foreground">
            Save a result to reopen it later from this browser.
          </p>
        </section>
      ) : null}

      {loadState.status === "ready" && loadState.sessions.length > 0 ? (
        <details className="flex flex-col gap-2">
          <summary className="cursor-pointer text-sm font-medium text-foreground">View saved attempts</summary>
          <ol className="flex flex-col gap-2 mt-2 list-none p-0">
            {loadState.sessions.map((session) => {
              const formattedDate = formatSavedSessionDate(session.createdAt);
              return (
                <li key={session.id}>
                  <Card className="p-4 min-w-0 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <strong className="text-sm font-semibold text-foreground">{session.title ?? "Saved speaking attempt"}</strong>
                      <span className="font-mono text-[11px] text-muted-foreground">{`JSON Analysis · ${formattedDate}`}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Band {session.pronunciationBand ?? "-"} / Fluency{" "}
                        {session.fluencyBand ?? "-"} / {session.wpm ?? "-"} WPM
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 min-h-[44px]"
                      aria-label={`Reopen result from ${formattedDate}`}
                      onClick={() => void handleReopen(session.id)}
                    >
                      Reopen Result
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ol>
        </details>
      ) : null}
        </CardContent>
      </Card>
    </aside>
  );
}

function formatSavedSessionDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildSaveRequest(
  ownerKey: string,
  analysis: JsonAnalysisResponse,
  feedback?: GeminiFeedbackResponse,
) {
  return {
    ownerKey,
    inputMode: "json" as const,
    title: `JSON analysis - Band ${analysis.summary.pronunciationBand.toFixed(1)}`,
    referenceText: analysis.extracted.referenceText,
    inputMetadata: {
      inputMode: "json",
      wordCount: analysis.extracted.wordCount,
      durationSeconds: analysis.extracted.durationSeconds,
    },
    metrics: analysis,
    feedback,
  };
}
