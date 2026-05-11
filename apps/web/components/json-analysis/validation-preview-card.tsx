"use client";

import { useEffect, useState } from "react";
import type {
  JsonAnalysisPreviewResponse,
  ValidationIssue,
  ValidationWarning,
} from "@localspeak/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatePanel } from "@/components/design-system/state-panel";

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
      <StatePanel
        title="Validation preview"
        description="Paste JSON, upload a .json file, or load the sample to validate pronunciation evidence before analysis."
      />
    );
  }

  if (syntaxState.status === "invalid") {
    return (
      <StatePanel
        title="This does not look like valid JSON yet."
        description="Check for a missing comma, quote, or closing bracket."
        tone="destructive"
      >
        <TechnicalDetails
          showTechnical={showTechnical}
          onToggle={() => setShowTechnical((current) => !current)}
        >
          {syntaxState.error}
        </TechnicalDetails>
      </StatePanel>
    );
  }

  if (previewError) {
    return (
      <StatePanel
        title={previewError.message}
        description="No success state is shown until the backend response matches the shared contract."
        tone="destructive"
      >
        <TechnicalDetails
          showTechnical={showTechnical}
          onToggle={() => setShowTechnical((current) => !current)}
        >
          {previewError.technical}
        </TechnicalDetails>
      </StatePanel>
    );
  }

  if (isPreviewing) {
    return (
      <StatePanel
        title="Checking whether this JSON is ready for analysis..."
        description="Local syntax passed. The backend is checking required fields and timing data."
      />
    );
  }

  if (!preview) {
    return (
      <StatePanel
        title="JSON format looks readable."
        description="Validation will confirm the speech assessment fields."
      />
    );
  }

  if (preview.status === "invalid") {
    return (
      <Card className="min-w-0 border-destructive-border p-4" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground m-0">
            Some required speech assessment fields are missing or malformed.
          </h2>
          <Badge variant="destructive">
            {preview.issueCount} issues
          </Badge>
        </div>
        <IssueList issues={preview.issues} showTechnical={showTechnical} />
        {preview.issueCount > preview.issues.length ? (
            <p className="font-mono text-[11px] text-muted-foreground mt-2">
            Showing {preview.issues.length} of {preview.issueCount} issues.
          </p>
        ) : null}
        {preview.allIssues.length > preview.issues.length ? (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto"
            type="button"
            onClick={() => setShowAllIssues((current) => !current)}
          >
            {showAllIssues ? "Hide all issues" : "Show all issues"}
          </Button>
        ) : null}
        {showAllIssues ? (
          <div className="mt-3">
            <h3 className="text-base font-semibold text-foreground m-0 mb-2">All validation issues</h3>
            <IssueList issues={preview.allIssues} showTechnical={showTechnical} />
          </div>
        ) : null}
        {hasTechnicalIssues(preview.allIssues) ? (
          <TechnicalDetails
            showTechnical={showTechnical}
            onToggle={() => setShowTechnical((current) => !current)}
          />
        ) : null}
      </Card>
    );
  }

  if (preview.status === "valid_with_warnings") {
    return (
      <Card className="min-w-0 border-warning-border p-4" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground m-0">Analyzable with warnings</h2>
          <Badge className="bg-warning text-white">
            {preview.warnings.length} warnings
          </Badge>
        </div>
        <p className="text-base text-muted-foreground mt-3">
          Metrics will still be computed, but review these unusual values.
        </p>
        <WarningList warnings={preview.warnings} />
      </Card>
    );
  }

  return (
    <Card className="min-w-0 border-success-border p-4" aria-live="polite">
      <h2 className="text-xl font-semibold text-foreground m-0">This JSON can be analyzed.</h2>
      <p className="text-base text-muted-foreground mt-3">
        The backend accepted the speech assessment fields for deterministic analysis.
      </p>
    </Card>
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
    <ul className="flex flex-col gap-2 mt-3 list-none p-0">
      {issues.map((issue, index) => (
        <li className="flex flex-col gap-1 text-sm" key={`${issue.path}-${issue.code}-${index}`}>
          <strong>{issue.label}</strong>
          <span>path: {issue.path}</span>
          {issue.hint ? <p>{issue.hint}</p> : null}
          {showTechnical && issue.technical ? (
            <code className="block font-mono text-[11px] text-muted-foreground bg-sidebar rounded p-2 mt-1 break-all">{issue.technical}</code>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function WarningList({ warnings }: { warnings: ValidationWarning[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-3 list-none p-0">
      {warnings.map((warning, index) => (
        <li className="flex flex-col gap-1 text-sm" key={`${warning.code}-${warning.path ?? index}`}>
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
    <div className="mt-3">
      <Button variant="link" size="sm" className="p-0 h-auto" type="button" onClick={onToggle}>
        {showTechnical ? "Hide technical details" : "Show technical details"}
      </Button>
      {showTechnical && children ? (
        <code className="block font-mono text-[11px] text-muted-foreground bg-sidebar rounded p-2 mt-1 break-all">{children}</code>
      ) : null}
    </div>
  );
}

function hasTechnicalIssues(issues: ValidationIssue[]) {
  return issues.some((issue) => Boolean(issue.technical));
}
