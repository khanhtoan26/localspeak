"use client";

import type { GeminiFeedbackResponse } from "@localspeak/contracts";

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
      <section className="json-analysis-card">
        <p className="json-analysis-card__detail">
          Get AI feedback after reviewing the deterministic metrics.
        </p>
        <button
          type="button"
          className="json-primary-button json-action-button json-action-button--ai"
          onClick={onRequestFeedback}
        >
          Get AI Feedback
        </button>
      </section>
    );
  }

  if (state.status === "loading") {
    return (
      <section
        className="json-analysis-card ai-coach-loading"
        aria-busy="true"
      >
        <div className="ai-coach-skeleton" />
        <p className="json-analysis-card__detail">
          Generating personalized IELTS feedback…
        </p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="json-analysis-card json-analysis-card--danger">
        <h2 className="json-analysis-card__title">AI feedback unavailable</h2>
        <p className="json-analysis-card__detail">
          {state.message}
        </p>
        <button
          type="button"
          className="json-primary-button json-action-button json-action-button--ai"
          onClick={onRetry}
        >
          Retry AI Feedback
        </button>
      </section>
    );
  }

  const { feedback } = state;

  return (
    <section className="json-analysis-card ai-coach-result">
      <h2 className="json-analysis-card__title">AI Coach Feedback</h2>

      <div className="ai-coach-bands">
        <div className="ai-coach-band">
          <span className="ai-coach-band__label">Pronunciation Band</span>
          <span className="ai-coach-band__value">
            {feedback.pronunciationBand}
          </span>
        </div>
        <div className="ai-coach-band">
          <span className="ai-coach-band__label">Fluency Band</span>
          <span className="ai-coach-band__value">{feedback.fluencyBand}</span>
        </div>
      </div>

      <div className="ai-coach-section">
        <h3 className="json-analysis-subtitle">Top Errors</h3>
        <ol className="ai-coach-errors">
          {feedback.topErrors.map((error, i) => (
            <li key={i} className="ai-coach-error">
              <strong>{error.word}</strong> — <code>{error.phoneme}</code>
              <p>{error.explanation}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="ai-coach-section">
        <h3 className="json-analysis-subtitle">Practice Drills</h3>
        <ol className="ai-coach-drills">
          {feedback.drills.map((drill, i) => (
            <li key={i} className="ai-coach-drill">
              {drill}
            </li>
          ))}
        </ol>
      </div>

      <div className="ai-coach-section">
        <h3 className="json-analysis-subtitle">Summary</h3>
        <p className="json-analysis-card__detail">{feedback.summary}</p>
      </div>
    </section>
  );
}
