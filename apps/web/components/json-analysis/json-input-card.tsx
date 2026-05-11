import type { ChangeEvent } from "react";
import { JSON_ANALYSIS_MAX_BYTES } from "@localspeak/contracts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const FILE_TOO_LARGE_COPY =
  "This file is too large for JSON mode. Upload a .json file under 2 MB.";
const FILE_READ_ERROR_COPY = "We couldn't read this file. Try pasting the JSON instead.";

type JsonInputCardProps = {
  jsonText: string;
  fileName: string | null;
  fileError: string | null;
  lastValidationStatus: string;
  canAnalyze: boolean;
  isAnalyzing: boolean;
  disabledHelper: string;
  onJsonTextChange: (text: string) => void;
  onFileNameChange: (name: string | null) => void;
  onFileErrorChange: (error: string | null) => void;
  onLoadSample: () => void;
  onClear: () => void;
  onAnalyze: () => void;
};

export function JsonInputCard({
  jsonText,
  fileName,
  fileError,
  lastValidationStatus,
  canAnalyze,
  isAnalyzing,
  disabledHelper,
  onJsonTextChange,
  onFileNameChange,
  onFileErrorChange,
  onLoadSample,
  onClear,
  onAnalyze,
}: JsonInputCardProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.size > JSON_ANALYSIS_MAX_BYTES) {
      onFileNameChange(null);
      onFileErrorChange(FILE_TOO_LARGE_COPY);
      return;
    }

    try {
      const text = await file.text();
      onFileNameChange(file.name);
      onFileErrorChange(null);
      onJsonTextChange(text);
    } catch {
      onFileNameChange(null);
      onFileErrorChange(FILE_READ_ERROR_COPY);
    }
  };

  return (
    <Card className="flex flex-col gap-4 rounded-[24px] bg-card/90 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground m-0">
            Speech assessment JSON
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Validate first, then generate the coach recommendation.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
          Primary input
        </span>
      </div>

      <label className="block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mt-4" htmlFor="speech-json-input">
        Speech assessment JSON input
      </label>
      <Textarea
        id="speech-json-input"
        className="font-mono min-h-[240px] resize-y bg-input w-full max-w-full rounded-[18px]"
        aria-label="Speech assessment JSON input"
        placeholder="Paste the full speech assessment JSON here."
        value={jsonText}
        onChange={(event) => onJsonTextChange(event.target.value)}
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2 mt-2">
        <Button variant="outline" size="sm" asChild>
          <label>
            Upload .json file
            <input
              className="sr-only"
              aria-label="Upload .json file"
              type="file"
              accept=".json,application/json"
              onChange={(event) => void handleFileChange(event)}
            />
          </label>
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={onLoadSample}>
          Load sample JSON
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={onClear}>
          Clear JSON
        </Button>
      </div>

      {fileError ? <p className="text-sm text-danger font-medium">{fileError}</p> : null}

      <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px] text-muted-foreground" aria-label="JSON input metadata">
        <span>{jsonText.length} characters</span>
        {fileName ? <span>{fileName}</span> : null}
        <span>validation: {lastValidationStatus}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Button
          disabled={!canAnalyze}
          className="min-h-[44px]"
          type="button"
          onClick={onAnalyze}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Pronunciation"}
        </Button>
        <p className="text-sm text-muted-foreground">{canAnalyze ? "Ready to analyze." : disabledHelper}</p>
      </div>
    </Card>
  );
}
