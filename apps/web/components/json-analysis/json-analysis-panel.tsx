"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GeminiFeedbackResponseSchema,
  JsonAnalysisPreviewResponseSchema,
  JsonAnalysisResponseSchema,
  JsonAnalysisSampleResponseSchema,
  type GeminiFeedbackRequest,
  type JsonAnalysisPreviewResponse,
  type JsonAnalysisResponse,
} from "@localspeak/contracts";
import type { AiCoachState } from "./ai-coach-tab";
import { JsonInputCard } from "./json-input-card";
import { ResultTabs } from "./result-tabs";
import { SavedSessionsPanel } from "./saved-sessions-panel";
import { SummaryMetricCards } from "./summary-metric-cards";
import { ValidationPreviewCard } from "./validation-preview-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PREVIEW_DEBOUNCE_MS = 600;
const PREVIEW_UNAVAILABLE_COPY =
  "We couldn't validate this JSON with LocalSpeak yet. Try again after refreshing.";
const PREVIEW_CONTRACT_MISMATCH_COPY =
  "Backend preview response did not match the expected contract.";
const ANALYZE_ERROR_COPY =
  "We couldn't analyze this JSON. Check the validation preview, then try Analyze Pronunciation again.";
const ANALYZE_ERROR_NEXT_STEP =
  "The deterministic analysis endpoint did not return a usable result.";

type SyntaxState =
  | { status: "empty" }
  | { status: "invalid"; error: string }
  | { status: "parseable"; parsed: unknown };

type PreviewError = {
  message: string;
  technical: string;
};

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: JsonAnalysisResponse }
  | { status: "error"; message: string; nextStep: string };

export function derivePracticePriority(analysis: JsonAnalysisResponse): {
  priority: string;
  reason: string;
} {
  const weakPattern = analysis.weakPhonemePatterns[0];
  if (weakPattern) {
    const sound = `${weakPattern.arpabet}${
      weakPattern.ipaExamples.length > 0
        ? ` / ${weakPattern.ipaExamples.join(", ")}`
        : ""
    }`;
    return {
      priority: `Start with the ${sound} sound pattern.`,
      reason: `${weakPattern.weakOccurrenceCount} repeated weak occurrence${
        weakPattern.weakOccurrenceCount === 1 ? "" : "s"
      } appeared in ${weakPattern.exampleWords.slice(0, 3).join(", ")}.`,
    };
  }

  const longestPause = [...analysis.pauses].sort(
    (left, right) => right.duration - left.duration,
  )[0];
  if (longestPause) {
    return {
      priority: `Smooth the pause between "${longestPause.beforeWord}" and "${longestPause.afterWord}".`,
      reason: `That gap lasted ${longestPause.duration.toFixed(
        2,
      )}s and was marked as ${longestPause.severity}.`,
    };
  }

  const weakWords = analysis.words.filter((word) => word.band === "weak");
  if (weakWords.length > 0) {
    return {
      priority: `Repeat ${weakWords[0].word} and nearby weak words.`,
      reason: `${weakWords.length} word${
        weakWords.length === 1 ? "" : "s"
      } scored in the weak band.`,
    };
  }

  if (analysis.summary.wpm < 120 || analysis.summary.pauseRatio >= 0.15) {
    return {
      priority: "Practice a steadier speaking rhythm.",
      reason: `WPM is ${analysis.summary.wpm} and pause ratio is ${Math.round(
        analysis.summary.pauseRatio * 100,
      )}%.`,
    };
  }

  return {
    priority:
      "Analyze a speaking attempt to see your highest-priority pronunciation or fluency issue.",
    reason:
      "LocalSpeak uses your word scores, weak sound patterns, pauses, and WPM to choose one focused next step.",
  };
}

function parseJson(text: string): SyntaxState {
  if (text.trim().length === 0) return { status: "empty" };

  try {
    return { status: "parseable", parsed: JSON.parse(text) };
  } catch (error) {
    return {
      status: "invalid",
      error:
        error instanceof Error ? error.message : "Unknown JSON parser error",
    };
  }
}

export function JsonAnalysisPanel() {
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<JsonAnalysisPreviewResponse | null>(
    null,
  );
  const [previewError, setPreviewError] = useState<PreviewError | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [lastValidatedText, setLastValidatedText] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: "idle",
  });
  const [resultsStale, setResultsStale] = useState(false);
  const [aiCoachState, setAiCoachState] = useState<AiCoachState>({
    status: "idle",
  });
  const [reopenedMarker, setReopenedMarker] = useState<string | null>(null);
  const [isInputOpen, setIsInputOpen] = useState(false);

  const syntaxState = useMemo(() => parseJson(jsonText), [jsonText]);

  const resetForNewInput = useCallback(
    (nextText: string) => {
      setJsonText(nextText);
      setPreview(null);
      setPreviewError(null);
      setLastValidatedText("");
      setAiCoachState({ status: "idle" });
      setReopenedMarker(null);
      if (analysisState.status === "done") {
        setResultsStale(true);
      }
    },
    [analysisState.status],
  );

  useEffect(() => {
    setPreview(null);
    setPreviewError(null);
    setLastValidatedText("");

    if (syntaxState.status !== "parseable") {
      setIsPreviewing(false);
      return;
    }

    let cancelled = false;
    const textForRequest = jsonText;
    const parsedForRequest = syntaxState.parsed;

    const timeout = window.setTimeout(() => {
      setIsPreviewing(true);

      fetch("/api/json-analysis/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speechAssessment: parsedForRequest }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Preview failed with status ${response.status}`);
          }

          return JsonAnalysisPreviewResponseSchema.parse(await response.json());
        })
        .then((data) => {
          if (cancelled) return;
          setPreview(data);
          setPreviewError(null);
          setLastValidatedText(textForRequest);
        })
        .catch((error) => {
          if (cancelled) return;
          setPreview(null);
          setPreviewError({
            message: PREVIEW_UNAVAILABLE_COPY,
            technical:
              error instanceof Error && error.name === "ZodError"
                ? PREVIEW_CONTRACT_MISMATCH_COPY
                : error instanceof Error
                  ? `Preview request failed: ${error.message}`
                  : "Preview request failed for an unknown reason.",
          });
        })
        .finally(() => {
          if (!cancelled) setIsPreviewing(false);
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [jsonText, syntaxState]);

  const canAnalyze =
    preview?.acceptedForAnalysis === true &&
    lastValidatedText === jsonText &&
    !isPreviewing &&
    analysisState.status !== "loading";

  const disabledHelper = getDisabledHelper({
    jsonText,
    syntaxState,
    preview,
    previewError,
    isPreviewing,
    resultsStale,
  });

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze || syntaxState.status !== "parseable") return;

    setAnalysisState({ status: "loading" });
    try {
      const response = await fetch("/api/json-analysis/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speechAssessment: syntaxState.parsed }),
      });

      if (!response.ok) {
        throw new Error(`Analyze failed with status ${response.status}`);
      }

      const result = JsonAnalysisResponseSchema.parse(await response.json());
      setAnalysisState({ status: "done", result });
      setResultsStale(false);
      setReopenedMarker(null);
      setIsInputOpen(false); // Auto-collapse input when analysis completes (UIX-02)
    } catch {
      setAnalysisState({
        status: "error",
        message: ANALYZE_ERROR_COPY,
        nextStep: ANALYZE_ERROR_NEXT_STEP,
      });
    }
  }, [canAnalyze, syntaxState]);

  const handleLoadSample = useCallback(async () => {
    if (
      jsonText.trim().length > 0 &&
      !window.confirm("Replace the current JSON with the sample JSON?")
    ) {
      return;
    }

    try {
      const response = await fetch("/api/json-analysis/sample", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Sample failed with status ${response.status}`);
      }

      const sample = JsonAnalysisSampleResponseSchema.parse(
        await response.json(),
      );
      setFileName(null);
      setFileError(null);
      resetForNewInput(JSON.stringify(sample.speechAssessment, null, 2));
    } catch {
      setFileError(
        "We couldn't load the sample JSON. Try again after refreshing.",
      );
    }
  }, [jsonText, resetForNewInput]);

  const handleClear = useCallback(() => {
    const hasContent =
      jsonText.trim().length > 0 ||
      preview !== null ||
      analysisState.status !== "idle";
    if (
      hasContent &&
      !window.confirm(
        "Clear the pasted JSON and current results? This cannot be undone.",
      )
    ) {
      return;
    }

    setJsonText("");
    setFileName(null);
    setFileError(null);
    setPreview(null);
    setPreviewError(null);
    setIsPreviewing(false);
    setLastValidatedText("");
    setAnalysisState({ status: "idle" });
    setResultsStale(false);
    setAiCoachState({ status: "idle" });
    setReopenedMarker(null);
  }, [analysisState.status, jsonText, preview]);

  const handleGetFeedback = useCallback(async () => {
    if (analysisState.status !== "done") return;

    setAiCoachState({ status: "loading" });

    const analysis = analysisState.result;
    const requestBody: GeminiFeedbackRequest = {
      referenceText: analysis.extracted.referenceText,
      pronunciationBand: analysis.summary.pronunciationBand,
      fluencyBand: analysis.summary.fluencyBand,
      wpm: analysis.summary.wpm,
      pauseRatio: analysis.summary.pauseRatio,
      weakWords: analysis.words
        .filter((w) => w.band === "weak")
        .map((w) => ({ word: w.word, score: w.score })),
      weakPhonemePatterns: analysis.weakPhonemePatterns.map((p) => ({
        arpabet: p.arpabet,
        ipaExamples: p.ipaExamples,
        averageScore: p.averageScore,
        exampleWords: p.exampleWords,
      })),
      notablePauses: analysis.fluency.notablePauses.map((p) => ({
        duration: p.duration,
        severity: p.severity,
        beforeWord: p.beforeWord,
        afterWord: p.afterWord,
      })),
    };

    try {
      const response = await fetch("/api/gemini-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Feedback failed with status ${response.status}`);
      }

      const feedback = GeminiFeedbackResponseSchema.parse(
        await response.json(),
      );
      setAiCoachState({ status: "done", feedback });
    } catch {
      setAiCoachState({
        status: "error",
        message:
          "AI feedback unavailable. Your deterministic results are still available — try again when you're ready.",
      });
    }
  }, [analysisState]);

  const lastValidationStatus = preview
    ? preview.status
    : syntaxState.status === "parseable"
      ? "pending preview"
      : syntaxState.status;

  const handleReopenSavedResult = useCallback(
    (analysis: JsonAnalysisResponse, marker: string) => {
      setAnalysisState({ status: "done", result: analysis });
      setResultsStale(false);
      setAiCoachState({ status: "idle" });
      setReopenedMarker(marker);
    },
    [],
  );

  return (
    <section className="flex flex-col gap-5" aria-label="JSON analysis dashboard">
      <section
        className="flex flex-col gap-5"
        aria-label="JSON analysis"
      >
        <header className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
            JSON Analysis
          </span>
          <h1 className="mt-4 mb-3 text-3xl font-semibold tracking-tight text-foreground">
            {analysisState.status === "done"
              ? "Review pronunciation evidence"
              : "Add speech assessment JSON"}
          </h1>
          <p className="max-w-[760px] text-base leading-7 text-muted-foreground m-0">
            {analysisState.status === "done"
              ? "Your current result stays in focus while input and saved history remain secondary."
              : "Paste JSON, upload a .json file, or load the sample to validate pronunciation evidence before analysis."}
          </p>
        </header>

        {analysisState.status === "done" ? (
          <section className="flex flex-col gap-4" aria-live="polite">
            {reopenedMarker ? (
              <p className="inline-flex items-center rounded-full bg-sidebar text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1">
                {reopenedMarker}
              </p>
            ) : null}
            <PracticePriorityCard analysis={analysisState.result} />
            {analysisState.result.warnings.length > 0 ? (
              <Card className="border-[#eadcb8] p-4 min-w-0">
                <h2 className="text-xl font-semibold text-foreground m-0">
                  Analyzable with warnings
                </h2>
                <p className="text-base text-muted-foreground mt-3">
                  Metrics will still be computed, but review these unusual
                  values.
                </p>
                <ul className="flex flex-col gap-2 mt-3 list-none p-0">
                  {analysisState.result.warnings.map((warning) => (
                    <li
                      className="flex flex-col gap-1 text-sm"
                      key={`${warning.code}-${warning.path ?? ""}`}
                    >
                      <strong>{warning.label}</strong>
                      <p>{warning.message}</p>
                      {warning.hint ? <p>{warning.hint}</p> : null}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
            <SummaryMetricCards summary={analysisState.result.summary} />
            <div id="analysis-details" className="flex flex-col gap-4 min-w-0">
              <ResultTabs
                analysis={analysisState.result}
                aiCoachState={aiCoachState}
                onRequestFeedback={() => void handleGetFeedback()}
                onRetryFeedback={() => void handleGetFeedback()}
              />
              <SavedSessionsPanel
                analysis={analysisState.result}
                aiCoachState={aiCoachState}
                onReopen={handleReopenSavedResult}
              />
            </div>
          </section>
        ) : null}

        {analysisState.status === "done" ? (
          <Collapsible open={isInputOpen} onOpenChange={setIsInputOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between min-h-[44px] font-medium">
                {isInputOpen ? "Hide JSON input" : "Change JSON input"}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isInputOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3 pt-2">
              {resultsStale ? (
                <p className="text-sm text-warning font-medium">
                  Input changed. Analyze again to update results.
                </p>
              ) : null}
              <JsonInputCard
                jsonText={jsonText}
                fileName={fileName}
                fileError={fileError}
                lastValidationStatus={lastValidationStatus}
                canAnalyze={canAnalyze}
                isAnalyzing={false}
                disabledHelper={disabledHelper}
                onJsonTextChange={resetForNewInput}
                onFileNameChange={setFileName}
                onFileErrorChange={setFileError}
                onLoadSample={() => void handleLoadSample()}
                onClear={handleClear}
                onAnalyze={() => void handleAnalyze()}
              />
              <ValidationPreviewCard
                syntaxState={syntaxState}
                preview={preview}
                previewError={previewError}
                isPreviewing={isPreviewing}
              />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <>
            <JsonInputCard
              jsonText={jsonText}
              fileName={fileName}
              fileError={fileError}
              lastValidationStatus={lastValidationStatus}
              canAnalyze={canAnalyze}
              isAnalyzing={analysisState.status === "loading"}
              disabledHelper={disabledHelper}
              onJsonTextChange={resetForNewInput}
              onFileNameChange={setFileName}
              onFileErrorChange={setFileError}
              onLoadSample={() => void handleLoadSample()}
              onClear={handleClear}
              onAnalyze={() => void handleAnalyze()}
            />

            <ValidationPreviewCard
              syntaxState={syntaxState}
              preview={preview}
              previewError={previewError}
              isPreviewing={isPreviewing}
            />
          </>
        )}

        {analysisState.status === "loading" ? (
          <div className="flex flex-col gap-3 py-4" aria-live="polite">
            <div role="status" aria-label="Computing metrics" className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <p className="text-base text-muted-foreground">
              Computing deterministic pronunciation and fluency metrics...
            </p>
          </div>
        ) : null}

        {analysisState.status === "error" ? (
          <Card
            className="border-[#edd0ca] p-4 min-w-0"
            aria-live="polite"
          >
            <h2 className="text-xl font-semibold text-foreground m-0">
              {analysisState.message}
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              {analysisState.nextStep}
            </p>
          </Card>
        ) : null}
      </section>
    </section>
  );
}

function PracticePriorityCard({
  analysis,
}: {
  analysis: JsonAnalysisResponse;
}) {
  const priority = derivePracticePriority(analysis);

  return (
      <Card
        className="relative overflow-hidden border-foreground bg-foreground p-6 text-card shadow-[0_24px_70px_rgba(35,30,23,0.18)] sm:p-7"
        aria-labelledby="json-priority-title"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center rounded-full bg-card/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#f4eee5]">
            Highest impact next
          </p>
          <h2
            id="json-priority-title"
            className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#ded6ca]"
          >
            What should I practice next?
          </h2>
          <p className="font-display text-4xl leading-[0.98] tracking-[-0.04em] text-card mt-3 mb-3">
            {priority.priority}
          </p>
          <p className="max-w-[760px] text-base leading-7 text-[#ded6ca] m-0">
            {priority.reason}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#analysis-details"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Review evidence
            </a>
            <span className="inline-flex min-h-[44px] items-center rounded-full border border-card/15 px-5 text-sm font-semibold text-[#f4eee5]">
              5-minute focused drill
            </span>
          </div>
        </div>
      </Card>
  );
}

function getDisabledHelper({
  jsonText,
  syntaxState,
  preview,
  previewError,
  isPreviewing,
  resultsStale,
}: {
  jsonText: string;
  syntaxState: SyntaxState;
  preview: JsonAnalysisPreviewResponse | null;
  previewError: PreviewError | null;
  isPreviewing: boolean;
  resultsStale: boolean;
}) {
  if (jsonText.trim().length === 0)
    return "Paste JSON or load the sample to continue.";
  if (syntaxState.status === "invalid")
    return "Fix the JSON syntax before analysis.";
  if (isPreviewing) return "Wait for validation preview to finish.";
  if (previewError) return "Preview this JSON again before analysis.";
  if (preview && !preview.acceptedForAnalysis)
    return "Fix validation issues before analysis.";
  if (resultsStale) return "Result is stale until backend validation finishes.";
  if (!preview) return "Wait for backend validation before analysis.";
  return "Ready to analyze.";
}
