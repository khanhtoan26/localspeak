import type { ChangeEvent } from "react";
import { JSON_ANALYSIS_MAX_BYTES } from "@localspeak/contracts";

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
    <section className="json-analysis-card">
      <div className="json-analysis-card__header">
        <h2 className="json-analysis-card__title">Speech assessment JSON</h2>
        <span className="json-analysis-pill">Primary input</span>
      </div>

      <label className="json-input-label" htmlFor="speech-json-input">
        Speech assessment JSON input
      </label>
      <textarea
        id="speech-json-input"
        className="json-input-textarea"
        aria-label="Speech assessment JSON input"
        placeholder="Paste the full speech assessment JSON here."
        value={jsonText}
        onChange={(event) => onJsonTextChange(event.target.value)}
        spellCheck={false}
      />

      <div className="json-input-actions">
        <label className="json-secondary-button">
          Upload .json file
          <input
            className="json-input-file"
            aria-label="Upload .json file"
            type="file"
            accept=".json,application/json"
            onChange={(event) => void handleFileChange(event)}
          />
        </label>
        <button className="json-secondary-button" type="button" onClick={onLoadSample}>
          Load sample JSON
        </button>
        <button className="json-secondary-button" type="button" onClick={onClear}>
          Clear JSON
        </button>
      </div>

      {fileError ? <p className="json-analysis-error">{fileError}</p> : null}

      <div className="json-input-meta" aria-label="JSON input metadata">
        <span>{jsonText.length} characters</span>
        {fileName ? <span>{fileName}</span> : null}
        <span>validation: {lastValidationStatus}</span>
      </div>

      <div className="json-analyze-row">
        <button
          className="json-primary-button"
          type="button"
          disabled={!canAnalyze}
          onClick={onAnalyze}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze JSON"}
        </button>
        <p className="json-input-helper">{canAnalyze ? "Ready to analyze." : disabledHelper}</p>
      </div>
    </section>
  );
}
