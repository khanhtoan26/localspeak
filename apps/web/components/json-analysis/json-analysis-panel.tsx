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
import { SummaryMetricCards } from "./summary-metric-cards";
import { ValidationPreviewCard } from "./validation-preview-card";

const PREVIEW_DEBOUNCE_MS = 600;
const PREVIEW_UNAVAILABLE_COPY =
  "We couldn't validate this JSON with LocalSpeak yet. Try again after refreshing.";
const PREVIEW_CONTRACT_MISMATCH_COPY =
  "Backend preview response did not match the expected contract.";
const ANALYZE_ERROR_COPY =
  "We couldn't analyze this JSON. The backend may be unavailable or the response did not match the contract.";
const ANALYZE_ERROR_NEXT_STEP =
  "Check the validation preview, then try Analyze JSON again.";

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

function parseJson(text: string): SyntaxState {
  if (text.trim().length === 0) return { status: "empty" };

  try {
    return { status: "parseable", parsed: JSON.parse(text) };
  } catch (error) {
    return {
      status: "invalid",
      error: error instanceof Error ? error.message : "Unknown JSON parser error",
    };
  }
}

export function JsonAnalysisPanel() {
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<JsonAnalysisPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<PreviewError | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [lastValidatedText, setLastValidatedText] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: "idle",
  });
  const [resultsStale, setResultsStale] = useState(false);
  const [aiCoachState, setAiCoachState] = useState<AiCoachState>({ status: "idle" });

  const syntaxState = useMemo(() => parseJson(jsonText), [jsonText]);

  const resetForNewInput = useCallback((nextText: string) => {
    setJsonText(nextText);
    setPreview(null);
    setPreviewError(null);
    setLastValidatedText("");
    setAiCoachState({ status: "idle" });
    if (analysisState.status === "done") {
      setResultsStale(true);
    }
  }, [analysisState.status]);

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
                : PREVIEW_CONTRACT_MISMATCH_COPY,
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

      const sample = JsonAnalysisSampleResponseSchema.parse(await response.json());
      setFileName(null);
      setFileError(null);
      resetForNewInput(JSON.stringify(sample.speechAssessment, null, 2));
    } catch {
      setFileError("We couldn't load the sample JSON. Try again after refreshing.");
    }
  }, [jsonText, resetForNewInput]);

  const handleClear = useCallback(() => {
    const hasContent =
      jsonText.trim().length > 0 || preview !== null || analysisState.status !== "idle";
    if (
      hasContent &&
      !window.confirm("Clear the pasted JSON and current results? This cannot be undone.")
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

      const feedback = GeminiFeedbackResponseSchema.parse(await response.json());
      setAiCoachState({ status: "done", feedback });
    } catch {
      setAiCoachState({
        status: "error",
        message: "AI feedback unavailable, please try again.",
      });
    }
  }, [analysisState]);

  const lastValidationStatus = preview
    ? preview.status
    : syntaxState.status === "parseable"
      ? "pending preview"
      : syntaxState.status;

  return (
    <main className="json-analysis-page">
      <section className="json-analysis-shell" aria-label="JSON analysis">
        <header className="json-analysis-header">
          <span className="json-analysis-tag">JSON Mode</span>
          <h1 className="json-analysis-title">Analyze speech assessment JSON</h1>
          <p className="json-analysis-intro">
            Paste a speech assessment response, load the sample, or upload a JSON
            file to preview deterministic pronunciation and fluency metrics.
          </p>
        </header>

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

        {resultsStale ? (
          <p className="json-analysis-stale">Input changed. Analyze again to update results.</p>
        ) : null}

        {analysisState.status === "loading" ? (
          <p className="json-analysis-loading" aria-live="polite">
            Computing deterministic metrics from the JSON...
          </p>
        ) : null}

        {analysisState.status === "done" ? (
          <section className="json-results-region" aria-live="polite">
            {analysisState.result.warnings.length > 0 ? (
              <div className="json-analysis-card json-analysis-card--warning">
                <h2 className="json-analysis-card__title">Analyzable with warnings</h2>
                <p className="json-analysis-card__detail">
                  Metrics will still be computed, but review these unusual values.
                </p>
              </div>
            ) : null}
            <SummaryMetricCards summary={analysisState.result.summary} />
            <button
              type="button"
              className="json-action-button json-action-button--ai"
              onClick={() => void handleGetFeedback()}
              disabled={aiCoachState.status === "loading"}
            >
              {aiCoachState.status === "loading" ? "Generating…" : "Get AI Feedback"}
            </button>
            <ResultTabs
              analysis={analysisState.result}
              aiCoachState={aiCoachState}
              onRetryFeedback={() => void handleGetFeedback()}
            />
          </section>
        ) : null}

        {analysisState.status === "error" ? (
          <section className="json-analysis-card json-analysis-card--danger" aria-live="polite">
            <h2 className="json-analysis-card__title">{analysisState.message}</h2>
            <p className="json-analysis-card__detail">{analysisState.nextStep}</p>
          </section>
        ) : null}
      </section>
    </main>
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
  if (jsonText.trim().length === 0) return "Paste JSON or load the sample to continue.";
  if (syntaxState.status === "invalid") return "Fix the JSON syntax before analysis.";
  if (isPreviewing) return "Wait for validation preview to finish.";
  if (previewError) return "Preview this JSON again before analysis.";
  if (preview && !preview.acceptedForAnalysis) return "Fix validation issues before analysis.";
  if (resultsStale) return "Result is stale until backend validation finishes.";
  if (!preview) return "Wait for backend validation before analysis.";
  return "Ready to analyze.";
}
