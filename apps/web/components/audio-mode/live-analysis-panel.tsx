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
    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 min-h-[200px] font-mono text-sm leading-relaxed">
      {!analysis && !isStreaming ? (
        <p className="text-gray-500 italic">
          Live analysis will appear here...
        </p>
      ) : (
        <div className="whitespace-pre-wrap">
          {analysis}
          {isStreaming && (
            <span className="inline-block w-[2px] h-[1em] bg-gray-100 ml-[1px] animate-[blink_1s_step-end_infinite]" />
          )}
        </div>
      )}
    </div>
  );
}
