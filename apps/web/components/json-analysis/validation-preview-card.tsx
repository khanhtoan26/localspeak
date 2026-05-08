"use client";

import { useEffect, useState } from "react";
import type {
  JsonAnalysisPreviewResponse,
  ValidationIssue,
  ValidationWarning,
} from "@localspeak/contracts";

type SyntaxState =
  | { status: "empty" }
  | { status: "invalid"; error: string }
  | { status: "parseable"; parsed: unknown };

type PreviewError = {
  message: string;
  technical: string;
};

type ValidationPreviewCardProps = {
  syntaxState: SyntaxState;
  preview: JsonAnalysisPreviewResponse | null;
  previewError: PreviewError | null;
  isPreviewing: boolean;
};

export function ValidationPreviewCard({
  syntaxState,
  preview,
  previewError,
  isPreviewing,
}: ValidationPreviewCardProps) {
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    setShowAllIssues(false);
    setShowTechnical(false);
  }, [syntaxState, preview, previewError]);

  if (syntaxState.status === "empty") {
    return (
      <section className="json-analysis-card" aria-live="polite">
        <h2 className="json-analysis-card__title">Start with an analysis</h2>
        <p className="json-analysis-card__detail">
          Paste assessment JSON, load the sample, or switch to Live Audio
          Practice to see your pronunciation dashboard.
        </p>
      </section>
    );
  }

  if (syntaxState.status === "invalid") {
    return (
      <section className="json-analysis-card json-analysis-card--danger" aria-live="polite">
        <h2 className="json-analysis-card__title">This does not look like valid JSON yet.</h2>
        <p className="json-analysis-card__detail">
          Check for a missing comma, quote, or closing bracket.
        </p>
        <TechnicalDetails
          showTechnical={showTechnical}
          onToggle={() => setShowTechnical((current) => !current)}
        >
          {syntaxState.error}
        </TechnicalDetails>
      </section>
    );
  }

  if (previewError) {
    return (
      <section className="json-analysis-card json-analysis-card--danger" aria-live="polite">
        <h2 className="json-analysis-card__title">{previewError.message}</h2>
        <p className="json-analysis-card__detail">
          No success state is shown until the backend response matches the shared contract.
        </p>
        <TechnicalDetails
          showTechnical={showTechnical}
          onToggle={() => setShowTechnical((current) => !current)}
        >
          {previewError.technical}
        </TechnicalDetails>
      </section>
    );
  }

  if (isPreviewing) {
    return (
      <section className="json-analysis-card" aria-live="polite">
        <h2 className="json-analysis-card__title">Validating speech assessment fields...</h2>
        <p className="json-analysis-card__detail">
          Local syntax passed. The backend is checking required fields and timing data.
        </p>
      </section>
    );
  }

  if (!preview) {
    return (
      <section className="json-analysis-card" aria-live="polite">
        <h2 className="json-analysis-card__title">JSON format looks readable.</h2>
        <p className="json-analysis-card__detail">
          Validation will confirm the speech assessment fields.
        </p>
      </section>
    );
  }

  if (preview.status === "invalid") {
    return (
      <section className="json-analysis-card json-analysis-card--danger" aria-live="polite">
        <div className="json-analysis-card__header">
          <h2 className="json-analysis-card__title">
            Some required speech assessment fields are missing or malformed.
          </h2>
          <span className="json-analysis-pill json-analysis-pill--danger">
            {preview.issueCount} issues
          </span>
        </div>
        <IssueList issues={preview.issues} showTechnical={showTechnical} />
        {preview.issueCount > preview.issues.length ? (
          <p className="json-analysis-card__meta">
            Showing {preview.issues.length} of {preview.issueCount} issues.
          </p>
        ) : null}
        {preview.allIssues.length > preview.issues.length ? (
          <button
            className="json-link-button"
            type="button"
            onClick={() => setShowAllIssues((current) => !current)}
          >
            {showAllIssues ? "Hide all issues" : "Show all issues"}
          </button>
        ) : null}
        {showAllIssues ? (
          <div className="json-all-issues">
            <h3 className="json-analysis-subtitle">All validation issues</h3>
            <IssueList issues={preview.allIssues} showTechnical={showTechnical} />
          </div>
        ) : null}
        {hasTechnicalIssues(preview.allIssues) ? (
          <TechnicalDetails
            showTechnical={showTechnical}
            onToggle={() => setShowTechnical((current) => !current)}
          />
        ) : null}
      </section>
    );
  }

  if (preview.status === "valid_with_warnings") {
    return (
      <section className="json-analysis-card json-analysis-card--warning" aria-live="polite">
        <div className="json-analysis-card__header">
          <h2 className="json-analysis-card__title">Analyzable with warnings</h2>
          <span className="json-analysis-pill json-analysis-pill--warning">
            {preview.warnings.length} warnings
          </span>
        </div>
        <p className="json-analysis-card__detail">
          Metrics will still be computed, but review these unusual values.
        </p>
        <WarningList warnings={preview.warnings} />
      </section>
    );
  }

  return (
    <section className="json-analysis-card json-analysis-card--success" aria-live="polite">
      <h2 className="json-analysis-card__title">This JSON can be analyzed.</h2>
      <p className="json-analysis-card__detail">
        The backend accepted the speech assessment fields for deterministic analysis.
      </p>
    </section>
  );
}

function IssueList({
  issues,
  showTechnical,
}: {
  issues: ValidationIssue[];
  showTechnical: boolean;
}) {
  return (
    <ul className="json-issue-list">
      {issues.map((issue, index) => (
        <li className="json-issue-row" key={`${issue.path}-${issue.code}-${index}`}>
          <strong>{issue.label}</strong>
          <span>path: {issue.path}</span>
          {issue.hint ? <p>{issue.hint}</p> : null}
          {showTechnical && issue.technical ? (
            <code className="json-technical-line">{issue.technical}</code>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function WarningList({ warnings }: { warnings: ValidationWarning[] }) {
  return (
    <ul className="json-issue-list">
      {warnings.map((warning, index) => (
        <li className="json-issue-row" key={`${warning.code}-${warning.path ?? index}`}>
          <strong>{warning.label}</strong>
          {warning.path ? <span>path: {warning.path}</span> : null}
          <p>{warning.message}</p>
          {warning.hint ? <p>{warning.hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function TechnicalDetails({
  children,
  showTechnical,
  onToggle,
}: {
  children?: string;
  showTechnical: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="json-technical-details">
      <button className="json-link-button" type="button" onClick={onToggle}>
        {showTechnical ? "Hide technical details" : "Show technical details"}
      </button>
      {showTechnical && children ? (
        <code className="json-technical-line">{children}</code>
      ) : null}
    </div>
  );
}

function hasTechnicalIssues(issues: ValidationIssue[]) {
  return issues.some((issue) => Boolean(issue.technical));
}
