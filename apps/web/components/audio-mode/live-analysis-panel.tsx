"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LiveAnalysisPanelProps {
  analysis: string;
  isStreaming: boolean;
}

export function LiveAnalysisPanel({
  analysis,
  isStreaming,
}: LiveAnalysisPanelProps) {
  return (
    <Card className="min-w-0" aria-live="polite">
      <CardHeader>
        <CardTitle>Live transcript</CardTitle>
        <CardDescription>
          {isStreaming
            ? "Transcript updates as LocalSpeak hears your sentence."
            : "Your live transcript will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <p className="m-0 whitespace-pre-wrap break-words text-base leading-7 text-foreground">
            {analysis}
            {isStreaming ? (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-primary align-middle" />
            ) : null}
          </p>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">
            Your live transcript will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
