import type { Page } from "@playwright/test";

export const validPreview = {
  contract: "json-analysis-preview.v1",
  status: "valid",
  valid: true,
  acceptedForAnalysis: true,
  issueCount: 0,
  issues: [],
  allIssues: [],
  warnings: [],
};

export const analysisResponse = {
  contract: "json-analysis-response.v1",
  inputMode: "json",
  summary: {
    pronunciationPercentage: 82,
    pronunciationBand: 7,
    fluencyBand: 6.5,
    wpm: 118,
    pauseRatio: 0.24,
  },
  extracted: {
    totalScore: 0.82,
    referenceText: "The three trees stood strongly in the street.",
    wordCount: 8,
    phoneCount: 28,
    durationSeconds: 4.8,
  },
  pronunciation: {
    totalScore: 0.82,
    percentage: 82,
    band: 7,
    phonemeAverages: [],
    weakPatterns: [
      {
        arpabet: "TH",
        ipaExamples: ["theta"],
        averageScore: 0.48,
        weakOccurrenceCount: 3,
        exampleWords: ["three"],
      },
    ],
    wordBandCounts: { weak: 1, okay: 1, good: 1 },
  },
  fluency: {
    durationSeconds: 4.8,
    wordCount: 8,
    wpm: 118,
    totalPauseTime: 1.15,
    pauseRatio: 0.24,
    pauseCount: 2,
    criticalPauseCount: 1,
    band: 6.5,
    notablePauses: [
      {
        index: 1,
        severity: "critical",
        duration: 0.95,
        startTime: 2.1,
        endTime: 3.05,
        beforeWord: "trees",
        afterWord: "stood",
        nearbyWords: "trees stood",
        explanation: "This pause may interrupt fluency between key content words.",
      },
    ],
  },
  words: [
    {
      index: 0,
      word: "three",
      score: 0.48,
      scorePercent: 48,
      band: "weak",
      startTime: 0.2,
      endTime: 0.75,
      duration: 0.55,
    },
  ],
  phonemes: [],
  weakPhonemePatterns: [
    {
      arpabet: "TH",
      ipaExamples: ["theta"],
      averageScore: 0.48,
      weakOccurrenceCount: 3,
      exampleWords: ["three"],
    },
  ],
  pauses: [
    {
      index: 1,
      severity: "critical",
      duration: 0.95,
      startTime: 2.1,
      endTime: 3.05,
      beforeWord: "trees",
      afterWord: "stood",
      nearbyWords: "trees stood",
      explanation: "This pause may interrupt fluency between key content words.",
    },
  ],
  warnings: [],
};

export async function mockDashboardApi(page: Page) {
  await page.route("**/api/json-analysis/preview", async (route) => {
    await route.fulfill({ json: validPreview });
  });
  await page.route("**/api/json-analysis/analyze", async (route) => {
    await route.fulfill({ json: analysisResponse });
  });
  await page.route("**/api/saved-sessions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: { contract: "saved-session-list.v1", sessions: [] },
      });
      return;
    }
    const timestamp = new Date().toISOString();
    await route.fulfill({
      json: {
        contract: "saved-session-create.v1",
        session: {
          id: "00000000-0000-4000-8000-000000000001",
          ownerKey: "mock-owner-key-1234567890",
          userId: null,
          inputMode: "json",
          title: "Mock session",
          referenceText: analysisResponse.extracted.referenceText,
          pronunciationBand: analysisResponse.summary.pronunciationBand,
          fluencyBand: analysisResponse.summary.fluencyBand,
          wpm: analysisResponse.summary.wpm,
          createdAt: timestamp,
          updatedAt: timestamp,
          inputMetadata: { source: "e2e" },
          metrics: analysisResponse,
          feedback: null,
        },
      },
      status: 201,
    });
  });
}
