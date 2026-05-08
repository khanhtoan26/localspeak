import {
  GeminiFeedbackResponseSchema,
  JsonAnalysisResponseSchema,
  type GeminiFeedbackResponse,
  type JsonAnalysisResponse,
  type SavedAnalysisSession,
} from "@localspeak/contracts";

export function createJsonAnalysisResponseFixture(): JsonAnalysisResponse {
  return JsonAnalysisResponseSchema.parse({
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
      phonemeAverages: [
        {
          arpabet: "TH",
          ipaExamples: ["θ"],
          averageScore: 0.48,
          averageScorePercent: 48,
          occurrenceCount: 3,
          weakOccurrenceCount: 3,
          exampleWords: ["three"],
        },
      ],
      weakPatterns: [
        {
          arpabet: "TH",
          ipaExamples: ["θ"],
          averageScore: 0.48,
          weakOccurrenceCount: 3,
          exampleWords: ["three"],
        },
        {
          arpabet: "T",
          ipaExamples: ["t"],
          averageScore: 0.62,
          weakOccurrenceCount: 2,
          exampleWords: ["stood", "street"],
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
        {
          index: 0,
          severity: "noticeable",
          duration: 0.45,
          startTime: 0.75,
          endTime: 1.2,
          beforeWord: "three",
          afterWord: "trees",
          nearbyWords: "three trees",
          explanation: "This pause is noticeable in the word timing data.",
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
      {
        index: 1,
        word: "trees",
        score: 0.76,
        scorePercent: 76,
        band: "okay",
        startTime: 1.2,
        endTime: 1.7,
        duration: 0.5,
      },
      {
        index: 2,
        word: "stood",
        score: 0.9,
        scorePercent: 90,
        band: "good",
        startTime: 3.05,
        endTime: 3.55,
        duration: 0.5,
      },
    ],
    phonemes: [
      {
        arpabet: "TH",
        ipaExamples: ["θ"],
        averageScore: 0.48,
        averageScorePercent: 48,
        occurrenceCount: 3,
        weakOccurrenceCount: 3,
        exampleWords: ["three"],
      },
    ],
    weakPhonemePatterns: [
      {
        arpabet: "TH",
        ipaExamples: ["θ"],
        averageScore: 0.48,
        weakOccurrenceCount: 3,
        exampleWords: ["three"],
      },
      {
        arpabet: "T",
        ipaExamples: ["t"],
        averageScore: 0.62,
        weakOccurrenceCount: 2,
        exampleWords: ["stood", "street"],
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
      {
        index: 0,
        severity: "noticeable",
        duration: 0.45,
        startTime: 0.75,
        endTime: 1.2,
        beforeWord: "three",
        afterWord: "trees",
        nearbyWords: "three trees",
        explanation: "This pause is noticeable in the word timing data.",
      },
    ],
    warnings: [],
  });
}

export function createGeminiFeedbackFixture(): GeminiFeedbackResponse {
  return GeminiFeedbackResponseSchema.parse({
    pronunciationBand: 7,
    fluencyBand: 6.5,
    topErrors: [
      {
        word: "three",
        phoneme: "TH / θ",
        explanation: "Keep airflow continuous for the /θ/ sound.",
      },
      {
        word: "street",
        phoneme: "STR",
        explanation: "Keep the consonant cluster connected before the vowel.",
      },
      {
        word: "stood",
        phoneme: "final D",
        explanation: "Finish the final consonant clearly without adding a vowel.",
      },
    ],
    drills: [
      "Repeat three trees slowly, keeping air flowing for /θ/.",
      "Say street in one beat without dropping the cluster.",
      "Contrast stood and stew to keep the final consonant audible.",
    ],
    summary: "Focus first on /θ/ airflow, then keep consonant clusters connected.",
  });
}

export function createSavedSessionFixture(): SavedAnalysisSession {
  const analysis = createJsonAnalysisResponseFixture();

  return {
    id: "11111111-1111-4111-8111-111111111111",
    ownerKey: "localspeak-owner-key-0001",
    userId: null,
    inputMode: "json",
    title: "Three trees practice",
    referenceText: analysis.extracted.referenceText,
    pronunciationBand: analysis.summary.pronunciationBand,
    fluencyBand: analysis.summary.fluencyBand,
    wpm: analysis.summary.wpm,
    inputMetadata: {
      inputMode: "json",
      wordCount: analysis.extracted.wordCount,
    },
    metrics: analysis,
    feedback: createGeminiFeedbackFixture(),
    createdAt: "2026-05-08T00:00:00.000Z",
    updatedAt: "2026-05-08T00:00:00.000Z",
  };
}
