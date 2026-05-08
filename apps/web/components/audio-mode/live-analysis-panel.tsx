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
    <div className="audio-live-panel">
      {!analysis && !isStreaming ? (
        <p className="audio-live-panel__empty">
          Live analysis will appear here…
        </p>
      ) : (
        <div className="audio-live-panel__text">
          {analysis}
          {isStreaming && <span className="audio-live-panel__cursor" />}
        </div>
      )}
    </div>
  );
}
