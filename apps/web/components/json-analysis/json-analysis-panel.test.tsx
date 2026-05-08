import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  JSON_ANALYSIS_MAX_BYTES,
  SpeechAssessmentResponseSchema,
} from "@localspeak/contracts";
import fixture from "../../../../.artifacts/speech-response.json";
import { JsonAnalysisPanel } from "./json-analysis-panel";
import { createJsonAnalysisResponseFixture } from "./test-fixtures";

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

const analysisResponse = {
  contract: "json-analysis-response.v1",
  inputMode: "json",
  summary: {
    pronunciationPercentage: 89,
    pronunciationBand: 7,
    fluencyBand: 5.5,
    wpm: 153,
    pauseRatio: 0.332,
  },
  extracted: {
    totalScore: 0.894,
    referenceText: "The sample response",
    wordCount: 3,
    phoneCount: 9,
    durationSeconds: 31.74,
  },
  pronunciation: {
    totalScore: 0.894,
    percentage: 89,
    band: 7,
    phonemeAverages: [],
    weakPatterns: [],
    wordBandCounts: { weak: 1, okay: 1, good: 1 },
  },
  fluency: {
    durationSeconds: 31.74,
    wordCount: 3,
    wpm: 153,
    totalPauseTime: 2.5,
    pauseRatio: 0.332,
    pauseCount: 3,
    criticalPauseCount: 1,
    band: 5.5,
    notablePauses: [],
  },
  words: [
    {
      index: 0,
      word: "<script>alert(1)</script>",
      score: 0.64,
      scorePercent: 64,
      band: "weak",
      startTime: 0,
      endTime: 0.5,
      duration: 0.5,
    },
    {
      index: 1,
      word: "steady",
      score: 0.72,
      scorePercent: 72,
      band: "okay",
      startTime: 0.9,
      endTime: 1.4,
      duration: 0.5,
    },
    {
      index: 2,
      word: "clear",
      score: 0.91,
      scorePercent: 91,
      band: "good",
      startTime: 1.8,
      endTime: 2.2,
      duration: 0.4,
    },
  ],
  phonemes: [],
  weakPhonemePatterns: [
    {
      arpabet: "T",
      ipaExamples: ["t"],
      averageScore: 0.51,
      weakOccurrenceCount: 5,
      exampleWords: ["to", "tea"],
    },
    {
      arpabet: "Z",
      ipaExamples: ["z"],
      averageScore: 0.58,
      weakOccurrenceCount: 4,
      exampleWords: ["zoo"],
    },
    {
      arpabet: "S",
      ipaExamples: ["s"],
      averageScore: 0.6,
      weakOccurrenceCount: 3,
      exampleWords: ["see"],
    },
    {
      arpabet: "IH2",
      ipaExamples: ["ɪ"],
      averageScore: 0.62,
      weakOccurrenceCount: 2,
      exampleWords: ["city"],
    },
    {
      arpabet: "R",
      ipaExamples: ["r"],
      averageScore: 0.64,
      weakOccurrenceCount: 2,
      exampleWords: ["red"],
    },
    {
      arpabet: "SH",
      ipaExamples: ["ʃ"],
      averageScore: 0.7,
      weakOccurrenceCount: 2,
      exampleWords: ["ship"],
    },
  ],
  pauses: [
    {
      index: 1,
      severity: "critical",
      duration: 1.4,
      startTime: 2.2,
      endTime: 3.6,
      beforeWord: "clear",
      afterWord: "again",
      nearbyWords: "clear again",
      explanation: "This suggests a planning or word-search pause.",
    },
    {
      index: 0,
      severity: "noticeable",
      duration: 0.7,
      startTime: 0.5,
      endTime: 1.2,
      beforeWord: "sample",
      afterWord: "steady",
      nearbyWords: "sample steady",
      explanation: "This pause is noticeable in the word timing data.",
    },
    {
      index: 2,
      severity: "natural",
      duration: 0.35,
      startTime: 3.6,
      endTime: 3.95,
      beforeWord: "again",
      afterWord: "now",
      nearbyWords: "again now",
      explanation: "This pause is noticeable in the word timing data.",
    },
  ],
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

const emptyAnalysisResponse = {
  ...analysisResponse,
  pronunciation: {
    ...analysisResponse.pronunciation,
    weakPatterns: [],
    wordBandCounts: { weak: 0, okay: 2, good: 1 },
  },
  fluency: {
    ...analysisResponse.fluency,
    notablePauses: [],
    pauseCount: 0,
    criticalPauseCount: 0,
  },
  words: analysisResponse.words.map((word) => ({
    ...word,
    score: Math.max(word.score, 0.72),
    scorePercent: Math.max(word.scorePercent, 72),
    band: word.index === 2 ? "good" : "okay",
  })),
  weakPhonemePatterns: [],
  pauses: [],
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

async function previewValid() {
  fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
    target: { value: JSON.stringify(parsedFixture) },
  });
  await advancePreviewDebounce();
  expect(screen.getByText("This JSON can be analyzed.")).toBeInTheDocument();
}

async function previewAndAnalyze(response: unknown = analysisResponse) {
  vi.mocked(fetch)
    .mockImplementationOnce(() => jsonResponse(validPreview))
    .mockImplementationOnce(() => jsonResponse(response));

  await previewValid();
  fireEvent.click(screen.getByRole("button", { name: "Analyze JSON" }));
  await flushPromises();
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

  it("posts to analyze only after the manual Analyze JSON action", async () => {
    renderPanel();
    vi.mocked(fetch)
      .mockImplementationOnce(() => jsonResponse(validPreview))
      .mockImplementationOnce(() => jsonResponse(analysisResponse));

    await previewValid();
    expect(fetch).not.toHaveBeenCalledWith(
      "/api/json-analysis/analyze",
      expect.anything(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Analyze JSON" }));
    await flushPromises();

    expect(fetch).toHaveBeenLastCalledWith("/api/json-analysis/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speechAssessment: parsedFixture }),
    });
  });

  it("shows a safe analyze error when the backend response is malformed", async () => {
    renderPanel();
    await previewAndAnalyze({ contract: "json-analysis-response.v1" });

    expect(
      screen.getByText(
        "We couldn't analyze this JSON. The backend may be unavailable or the response did not match the contract.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Check the validation preview, then try Analyze JSON again."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Pronunciation percentage")).not.toBeInTheDocument();
  });

  it("renders dashboard priority and exact four primary metrics", async () => {
    renderPanel();
    await previewAndAnalyze(createJsonAnalysisResponseFixture());

    expect(screen.getAllByTestId("summary-metric-label").map((node) => node.textContent)).toEqual([
      "Pronunciation",
      "Pronunciation Band",
      "Fluency Band",
      "WPM",
    ]);
    expect(screen.getByText("What should I practice next?")).toBeInTheDocument();
    expect(screen.getByText("Start with the TH / θ sound pattern.")).toBeInTheDocument();
    expect(
      screen.getByText("3 repeated weak occurrences appeared in three."),
    ).toBeInTheDocument();
    expect(screen.getByText("Computed from word and phone scores.")).toBeInTheDocument();
    expect(
      screen.getByText("Estimated from deterministic score thresholds."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Estimated from WPM, pause ratio, and critical pauses."),
    ).toBeInTheDocument();
    expect(screen.getByText("Words per minute from word timings.")).toBeInTheDocument();
    const metricGrid = screen.getByLabelText("Summary metrics");
    expect(within(metricGrid).queryByText("Pause ratio")).not.toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("7.0")).toBeInTheDocument();
    expect(screen.getByText("6.5")).toBeInTheDocument();
    expect(screen.getByText("118")).toBeInTheDocument();
  });

  it("renders exact Phase 6 tabs with Pause Analysis selected by default", async () => {
    renderPanel();
    await previewAndAnalyze();

    const tabs = screen.getAllByRole("button").filter((button) =>
      ["Pause Analysis", "Words", "Phonemes", "IELTS Analysis"].includes(
        button.textContent ?? "",
      ),
    );
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      "Pause Analysis",
      "Words",
      "Phonemes",
      "IELTS Analysis",
    ]);
    expect(screen.getByRole("button", { name: "Pause Analysis" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("button", { name: "Summary" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pauses" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Gemini says|examiner thinks|IELTS examiner/i)).not.toBeInTheDocument();
    expect(screen.getByText("Very high WPM")).toBeInTheDocument();
    expect(screen.getByText("The computed speaking rate is unusually high.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "IELTS Analysis" }));
    expect(
      screen.getByText(/Click "Get AI Feedback" above to receive personalized IELTS/i),
    ).toBeInTheDocument();
  });

  it("renders original-order word bands with scores and timings", async () => {
    renderPanel();
    await previewAndAnalyze();

    fireEvent.click(screen.getByRole("button", { name: "Words" }));

    const wordRows = screen.getAllByTestId("word-row");
    expect(wordRows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("<script>alert(1)</script>Weak - 64%0.00s-0.50s"),
      expect.stringContaining("steadyOkay - 72%0.90s-1.40s"),
      expect.stringContaining("clearGood - 91%1.80s-2.20s"),
    ]);
    expect(document.querySelector("script")).toBeNull();
  });

  it("renders up to five repeated weak phoneme patterns and the empty state", async () => {
    renderPanel();
    await previewAndAnalyze();

    fireEvent.click(screen.getByRole("button", { name: "Phonemes" }));

    expect(screen.getAllByTestId("phoneme-row")).toHaveLength(5);
    expect(screen.getByText("T / t")).toBeInTheDocument();
    expect(screen.getByText("5 weak occurrences - average 51%")).toBeInTheDocument();
    expect(screen.getByText("Examples: to, tea")).toBeInTheDocument();
    expect(screen.queryByText("SH / ʃ")).not.toBeInTheDocument();

    cleanup();
    renderPanel();
    await previewAndAnalyze(emptyAnalysisResponse);
    fireEvent.click(screen.getByRole("button", { name: "Phonemes" }));

    expect(screen.getByText("No repeated weak pattern found.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The JSON did not show the same low-scoring phone repeated at least twice.",
      ),
    ).toBeInTheDocument();
  });

  it("renders pause severities without Long pause text and shows empty states", async () => {
    renderPanel();
    await previewAndAnalyze();

    fireEvent.click(screen.getByRole("button", { name: "Pause Analysis" }));

    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Noticeable")).toBeInTheDocument();
    expect(screen.getByText("Natural")).toBeInTheDocument();
    expect(screen.getByText("1.40s between \"clear\" and \"again\"")).toBeInTheDocument();
    expect(screen.getByText("gap: 2.20s-3.60s")).toBeInTheDocument();
    expect(
      screen.getByText("This suggests a planning or word-search pause."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Long pause")).not.toBeInTheDocument();

    cleanup();
    renderPanel();
    await previewAndAnalyze(emptyAnalysisResponse);
    fireEvent.click(screen.getByRole("button", { name: "Pause Analysis" }));

    expect(screen.getByText("No notable pauses found.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The word timings did not include pauses long enough to flag in this analysis.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a positive empty weak-word state when no weak words are returned", async () => {
    renderPanel();
    await previewAndAnalyze(emptyAnalysisResponse);

    fireEvent.click(screen.getByRole("button", { name: "Words" }));

    expect(screen.getByText("No major weak words found.")).toBeInTheDocument();
    expect(
      screen.getByText("Most word scores are in the okay or good range for this sample."),
    ).toBeInTheDocument();
  });

  it("marks successful results stale when the input changes", async () => {
    renderPanel();
    await previewAndAnalyze();

    fireEvent.change(screen.getByLabelText("Speech assessment JSON input"), {
      target: { value: JSON.stringify({ ...parsedFixture, msg: "changed" }) },
    });

    expect(
      screen.getByText("Input changed. Analyze again to update results."),
    ).toBeInTheDocument();
  });
});
