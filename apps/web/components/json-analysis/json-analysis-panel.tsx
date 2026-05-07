"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  JsonAnalysisPreviewResponseSchema,
  JsonAnalysisResponseSchema,
  JsonAnalysisSampleResponseSchema,
  type JsonAnalysisPreviewResponse,
  type JsonAnalysisResponse,
} from "@localspeak/contracts";
import { JsonInputCard } from "./json-input-card";
import { ValidationPreviewCard } from "./validation-preview-card";

const PREVIEW_DEBOUNCE_MS = 600;
const PREVIEW_UNAVAILABLE_COPY =
  "We couldn't validate this JSON with LocalSpeak yet. Try again after refreshing.";
const PREVIEW_CONTRACT_MISMATCH_COPY =
  "Backend preview response did not match the expected contract.";

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
  | { status: "error"; message: string };

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

  const syntaxState = useMemo(() => parseJson(jsonText), [jsonText]);

  const resetForNewInput = useCallback((nextText: string) => {
    setJsonText(nextText);
    setPreview(null);
    setPreviewError(null);
    setLastValidatedText("");
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
    !resultsStale &&
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
        message: "We couldn't analyze this JSON yet. Try again after previewing it.",
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
  }, [analysisState.status, jsonText, preview]);

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

        {analysisState.status === "done" ? (
          <section className="json-analysis-card" aria-live="polite">
            <h2 className="json-analysis-card__title">Analysis ready</h2>
            <p className="json-analysis-card__detail">
              Results are ready for the next view. Pronunciation{" "}
              {analysisState.result.summary.pronunciationPercentage}% · WPM{" "}
              {analysisState.result.summary.wpm}
            </p>
          </section>
        ) : null}

        {analysisState.status === "error" ? (
          <p className="json-analysis-error">{analysisState.message}</p>
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
  if (resultsStale) return "Input changed. Analyze again to update results.";
  if (!preview) return "Wait for backend validation before analysis.";
  return "Ready to analyze.";
}
