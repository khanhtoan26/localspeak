"use client";

interface LiveAnalysisPanelProps {
  analysis: string;
  isStreaming: boolean;
}

export function LiveAnalysisPanel({
  analysis,
  isStreaming,
}: LiveAnalysisPanelProps) {
  return (
    <div
      style={{
        background: "var(--ink)",
        color: "#f5f5f0",
        borderRadius: "14px",
        padding: "16px",
        minHeight: "160px",
        fontFamily: "var(--font-mono)",
        fontSize: "14px",
        lineHeight: "1.6",
      }}
    >
      {!analysis && !isStreaming ? (
        <p style={{ color: "var(--ink-muted)", fontStyle: "italic", margin: 0 }}>
          Live analysis will appear here…
        </p>
      ) : (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {analysis}
          {isStreaming && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1em",
                background: "#f5f5f0",
                marginLeft: "1px",
                animation: "blink 1s step-end infinite",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
