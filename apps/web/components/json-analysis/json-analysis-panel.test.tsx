import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  JSON_ANALYSIS_MAX_BYTES,
  SpeechAssessmentResponseSchema,
} from "@localspeak/contracts";
import fixture from "../../../../.artifacts/speech-response.json";
import { JsonAnalysisPanel } from "./json-analysis-panel";

const parsedFixture = SpeechAssessmentResponseSchema.parse(fixture);

const validPreview = {
  contract: "json-analysis-preview.v1",
  status: "valid",
  valid: true,
  acceptedForAnalysis: true,
  issueCount: 0,
  issues: [],
  allIssues: [],
  warnings: [],
};

const warningPreview = {
  ...validPreview,
  status: "valid_with_warnings",
  warnings: [
    {
      severity: "warning",
      code: "very_high_wpm",
      label: "Very high WPM",
      path: "result",
      value: 210,
      message: "The computed speaking rate is unusually high.",
      hint: "Check whether the duration or timing units are correct.",
    },
  ],
};

const allIssues = Array.from({ length: 6 }, (_, index) => ({
  severity: "error",
  code: "missing_required_field",
  label:
    index === 0
      ? "Missing Start Time"
      : `Missing Field ${String(index + 1).padStart(2, "0")}`,
  path: index === 0 ? "result[0].start_time" : `result[${index}].score`,
  message: "A required speech assessment field is missing.",
  hint: `Add the missing value for result[${index}].score.`,
  technical: "invalid_type: expected number",
}));

const invalidPreview = {
  contract: "json-analysis-preview.v1",
  status: "invalid",
  valid: false,
  acceptedForAnalysis: false,
  issueCount: allIssues.length,
  issues: allIssues.slice(0, 5),
  allIssues,
  warnings: [],
};

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

async function advancePreviewDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(600);
  });
  await flushPromises();
}

async function flushPromises() {
  for (let tick = 0; tick < 5; tick += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

function renderPanel() {
  render(<JsonAnalysisPanel />);
}

describe("JsonAnalysisPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("confirm", vi.fn(() => true));
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(validPreview)));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the empty JSON mode input state", () => {
    renderPanel();

    expect(
      screen.getByRole("heading", { name: "Analyze speech assessment JSON" }),
    ).toBeInTheDocument();
    expect(screen.getByText("JSON Mode")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Speech assessment JSON input"),
    ).toBeInTheDocument();
    expect(screen.getByText("Paste speech assessment JSON to begin.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze JSON" })).toBeDisabled();
    expect(
      screen.getByText("Paste JSON or load the sample to continue."),
    ).toBeInTheDocument();
  });

  it("debounces parseable pasted JSON for preview without auto-analyzing", async () => {
    renderPanel();
    const fetchMock = vi.mocked(fetch);

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify(parsedFixture) },
    });

    await act(async () => {
      vi.advanceTimersByTime(599);
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await advancePreviewDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/json-analysis/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speechAssessment: parsedFixture }),
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/json-analysis/analyze",
      expect.anything(),
    );
  });

  it("shows malformed JSON details only inside the collapsed technical section", async () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: '{"result":' },
    });

    await advancePreviewDebounce();

    expect(screen.getByText("This does not look like valid JSON yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Check for a missing comma, quote, or closing bracket."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/SyntaxError|Unexpected|Expected/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show technical details" }));
    await flushPromises();
    expect(screen.getByText(/SyntaxError|Unexpected|Expected/i)).toBeInTheDocument();
  });

  it("shows top backend issues first and reveals allIssues on request", async () => {
    renderPanel();
    vi.mocked(fetch).mockImplementation(() => jsonResponse(invalidPreview));
    expect(invalidPreview.issueCount).toBe(invalidPreview.allIssues.length);

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify(parsedFixture) },
    });
    await advancePreviewDebounce();

    expect(
      screen.getByText("Some required speech assessment fields are missing or malformed."),
    ).toBeInTheDocument();
    expect(screen.getByText("Missing Start Time")).toBeInTheDocument();
    expect(screen.getByText("path: result[0].start_time")).toBeInTheDocument();
    expect(screen.getByText("Showing 5 of 6 issues.")).toBeInTheDocument();
    expect(screen.queryByText("Missing Field 06")).not.toBeInTheDocument();
    expect(screen.queryByText("invalid_type: expected number")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show all issues" }));
    await flushPromises();
    expect(screen.getByText("Missing Field 06")).toBeInTheDocument();
    expect(screen.getByText("path: result[5].score")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show technical details" }));
    await flushPromises();
    expect(screen.getAllByText("invalid_type: expected number").length).toBeGreaterThan(0);
  });

  it("shows warnings while enabling Analyze JSON", async () => {
    renderPanel();
    vi.mocked(fetch).mockImplementation(() => jsonResponse(warningPreview));

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify(parsedFixture) },
    });
    await advancePreviewDebounce();

    expect(screen.getByText("Analyzable with warnings")).toBeInTheDocument();
    expect(
      screen.getByText("Metrics will still be computed, but review these unusual values."),
    ).toBeInTheDocument();
    expect(screen.getByText("Very high WPM")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze JSON" })).toBeEnabled();
  });

  it("loads the sample JSON after confirmation and triggers preview", async () => {
    renderPanel();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        jsonResponse({
          contract: "speech-assessment-response.v1",
          speechAssessment: parsedFixture,
        }),
      )
      .mockImplementationOnce(() => jsonResponse(validPreview));
    vi.stubGlobal("fetch", fetchMock);

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: '{"existing": true}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load sample JSON" }));
    await flushPromises();
    await advancePreviewDebounce();

    expect(confirm).toHaveBeenCalledWith("Replace the current JSON with the sample JSON?");
    expect(fetchMock).toHaveBeenCalledWith("/api/json-analysis/sample", {
      cache: "no-store",
    });
    expect(screen.getByLabelText("Speech assessment JSON input")).toHaveValue(
      JSON.stringify(parsedFixture, null, 2),
    );
    expect(fetchMock).toHaveBeenLastCalledWith("/api/json-analysis/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speechAssessment: parsedFixture }),
    });
  });

  it("accepts .json uploads under 2 MB and previews the file text", async () => {
    renderPanel();
    const input = screen.getByLabelText("Upload .json file");
    const file = new File([JSON.stringify(parsedFixture)], "sample.json", {
      type: "application/json",
    });
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(JSON.stringify(parsedFixture)),
    });

    expect(input).toHaveAttribute("accept", ".json,application/json");
    fireEvent.change(input, { target: { files: [file] } });
    await flushPromises();
    await advancePreviewDebounce();

    expect(screen.getByLabelText("Speech assessment JSON input")).toHaveValue(
      JSON.stringify(parsedFixture),
    );
    expect(screen.getByText("This JSON can be analyzed.")).toBeInTheDocument();
    expect(screen.getByText("sample.json")).toBeInTheDocument();
  });

  it("blocks uploaded files over 2 * 1024 * 1024 bytes", async () => {
    renderPanel();
    const hugeFile = new File(
      ["x".repeat(JSON_ANALYSIS_MAX_BYTES + 1)],
      "huge.json",
      { type: "application/json" },
    );

    fireEvent.change(screen.getByLabelText("Upload .json file"), {
      target: { files: [hugeFile] },
    });
    await flushPromises();

    expect(JSON_ANALYSIS_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(
      screen.getByText(
        "This file is too large for JSON mode. Upload a .json file under 2 MB.",
      ),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("clears input and preview after destructive confirmation", async () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify(parsedFixture) },
    });
    await advancePreviewDebounce();
    expect(screen.getByText("This JSON can be analyzed.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear JSON" }));
    await flushPromises();

    expect(confirm).toHaveBeenCalledWith(
      "Clear the pasted JSON and current results? This cannot be undone.",
    );
    expect(screen.getByLabelText("Speech assessment JSON input")).toHaveValue("");
    expect(screen.getByText("Paste speech assessment JSON to begin.")).toBeInTheDocument();
  });

  it("keeps malformed backend preview responses out of success UI", async () => {
    renderPanel();
    vi.mocked(fetch).mockImplementation(() =>
      jsonResponse({ contract: "json-analysis-preview.v1", status: "valid" }),
    );

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify(parsedFixture) },
    });
    await advancePreviewDebounce();

    expect(
      screen.getByText(
        "We couldn't validate this JSON with LocalSpeak yet. Try again after refreshing.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("This JSON can be analyzed.")).not.toBeInTheDocument();
    expect(screen.queryByText(/ZodError|Error:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show technical details" }));
    await flushPromises();
    expect(screen.getByText("Backend preview response did not match the expected contract.")).toBeInTheDocument();
  });

  it("renders script-like vendor text as plain text only", async () => {
    renderPanel();
    vi.mocked(fetch).mockImplementation(() =>
      jsonResponse({
        ...invalidPreview,
        issues: [
          {
            ...invalidPreview.issues[0],
            label: "<script>alert(1)</script>",
          },
        ],
        allIssues: [
          {
            ...invalidPreview.allIssues[0],
            label: "<script>alert(1)</script>",
          },
        ],
        issueCount: 1,
      }),
    );

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify(parsedFixture) },
    });
    await advancePreviewDebounce();

    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });
});
