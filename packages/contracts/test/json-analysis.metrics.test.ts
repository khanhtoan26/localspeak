import { describe, expect, it } from "vitest";
import fixture from "../../../.artifacts/speech-response.json";
import { SpeechAssessmentResponseSchema } from "../src";
import {
  computeJsonAnalysis,
  getFluencyBand,
  getPauseSeverity,
  getPronunciationBand,
  getWordBand,
  validateSpeechAssessmentForAnalysis,
} from "../src/json-analysis";

const parsedFixture = SpeechAssessmentResponseSchema.parse(fixture);

const withFirstWord = (
  updates: Partial<(typeof parsedFixture.result)[number]>,
) => ({
  ...parsedFixture,
  result: [{ ...parsedFixture.result[0], ...updates }, ...parsedFixture.result.slice(1)],
});

const scaleWordTimings = (
  word: (typeof parsedFixture.result)[number],
  factor: number,
) => ({
  ...word,
  start_time: word.start_time * factor,
  end_time: word.end_time * factor,
  phones: word.phones.map((phone) => ({
    ...phone,
    start_time: phone.start_time * factor,
    end_time: phone.end_time * factor,
  })),
  letters: word.letters.map((letter) => ({
    ...letter,
    start_time: letter.start_time * factor,
    end_time: letter.end_time * factor,
    phones: letter.phones.map((phone) => ({
      ...phone,
      start_time: phone.start_time * factor,
      end_time: phone.end_time * factor,
    })),
  })),
});

describe("json analysis deterministic metrics", () => {
  it("extracts fixture fields without echoing the full input (JSON-03, D-20)", () => {
    const analysis = computeJsonAnalysis(parsedFixture);

    expect(analysis.contract).toBe("json-analysis-response.v1");
    expect(analysis.inputMode).toBe("json");
    expect(analysis.extracted.totalScore).toBe(parsedFixture.total_score);
    expect(analysis.extracted.referenceText).toBe(parsedFixture.text_refs);
    expect(analysis.extracted.wordCount).toBe(81);
    expect(analysis.extracted.phoneCount).toBe(255);
    expect(analysis).not.toHaveProperty("speechAssessment");
  });

  it("uses locked word band thresholds (MET-03, D-17)", () => {
    expect(getWordBand(0.64)).toBe("weak");
    expect(getWordBand(0.65)).toBe("okay");
    expect(getWordBand(0.84)).toBe("okay");
    expect(getWordBand(0.85)).toBe("good");
  });

  it("uses locked pronunciation band thresholds (MET-04, D-09)", () => {
    expect(getPronunciationBand(0.95)).toBe(8.5);
    expect(getPronunciationBand(0.9)).toBe(7.5);
    expect(getPronunciationBand(0.85)).toBe(7.0);
    expect(getPronunciationBand(0.8)).toBe(6.5);
    expect(getPronunciationBand(0.75)).toBe(6.0);
    expect(getPronunciationBand(0.74)).toBe(5.5);
  });

  it("uses the locked fluency rubric and WPM caps (MET-06, D-18)", () => {
    expect(
      getFluencyBand({ criticalPauseCount: 3, pauseRatio: 0.1, wpm: 150 }),
    ).toBe(5.5);
    expect(
      getFluencyBand({ criticalPauseCount: 2, pauseRatio: 0.1, wpm: 150 }),
    ).toBe(6.0);
    expect(
      getFluencyBand({ criticalPauseCount: 1, pauseRatio: 0.1, wpm: 150 }),
    ).toBe(6.5);
    expect(
      getFluencyBand({ criticalPauseCount: 0, pauseRatio: 0.1, wpm: 150 }),
    ).toBe(7.5);
    expect(
      getFluencyBand({ criticalPauseCount: 0, pauseRatio: 0.11, wpm: 150 }),
    ).toBe(7.0);
    expect(
      getFluencyBand({ criticalPauseCount: 0, pauseRatio: 0.1, wpm: 99 }),
    ).toBeLessThanOrEqual(6.0);
    expect(
      getFluencyBand({ criticalPauseCount: 0, pauseRatio: 0.1, wpm: 191 }),
    ).toBeLessThanOrEqual(6.0);
    expect(
      getFluencyBand({ criticalPauseCount: 0, pauseRatio: 0.1, wpm: 119 }),
    ).toBeLessThanOrEqual(6.5);
    expect(
      getFluencyBand({ criticalPauseCount: 0, pauseRatio: 0.1, wpm: 181 }),
    ).toBeLessThanOrEqual(6.5);
  });

  it("uses PROJECT pause severities and excludes the extra UI label (MET-05, D-19)", () => {
    expect(getPauseSeverity(0.29)).toBeNull();
    expect(getPauseSeverity(0.3)).toBe("natural");
    expect(getPauseSeverity(0.49)).toBe("natural");
    expect(getPauseSeverity(0.5)).toBe("noticeable");
    expect(getPauseSeverity(0.99)).toBe("noticeable");
    expect(getPauseSeverity(1.0)).toBe("critical");

    const analysis = computeJsonAnalysis(parsedFixture);
    const extraSeverity = "lo" + "ng";
    const extraLabel = "Lo" + "ng";
    expect(analysis.pauses.map((pause) => pause.severity)).not.toContain(
      extraSeverity,
    );
    expect(analysis.pauses.map((pause) => pause.severity)).not.toContain(
      extraLabel,
    );
  });

  it("detects top repeated weak phoneme patterns (MET-01, MET-02, D-10)", () => {
    const analysis = computeJsonAnalysis(parsedFixture);

    expect(analysis.phonemes.length).toBeGreaterThan(0);
    expect(analysis.weakPhonemePatterns.length).toBeLessThanOrEqual(5);
    expect(
      analysis.weakPhonemePatterns.map((pattern) => pattern.arpabet),
    ).toEqual(["T", "Z", "S", "IH2", "R"]);

    for (const pattern of analysis.weakPhonemePatterns) {
      expect(pattern.weakOccurrenceCount).toBeGreaterThanOrEqual(2);
      expect(pattern.arpabet.length).toBeGreaterThan(0);
      expect(pattern.ipaExamples.length).toBeGreaterThan(0);
    }
  });

  it("computes fixture fluency metrics from word timings (MET-05, D-12)", () => {
    const analysis = computeJsonAnalysis(parsedFixture);

    expect(analysis.fluency.wordCount).toBe(81);
    expect(analysis.fluency.durationSeconds).toBeCloseTo(
      31.740012228488922,
      6,
    );
    expect(analysis.fluency.wpm).toBeCloseTo(153, 0);
    expect(analysis.fluency.pauseRatio).toBeCloseTo(0.332388, 5);
    expect(analysis.fluency.criticalPauseCount).toBeGreaterThanOrEqual(3);
    expect(analysis.fluency.band).toBe(5.5);

    const pauseDurations = analysis.fluency.notablePauses.map(
      (pause) => pause.duration,
    );
    expect(pauseDurations).toEqual([...pauseDurations].sort((a, b) => b - a));
  });

  it("returns validation issues for analysis-blocking shapes (JSON-02, D-07)", () => {
    const emptyResult = validateSpeechAssessmentForAnalysis({
      ...parsedFixture,
      result: [],
    });
    expect(emptyResult.acceptedForAnalysis).toBe(false);
    expect(emptyResult.allIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "empty_result", path: "result" }),
      ]),
    );

    const emptyPhones = validateSpeechAssessmentForAnalysis(
      withFirstWord({ phones: [] }),
    );
    expect(emptyPhones.acceptedForAnalysis).toBe(false);
    expect(emptyPhones.allIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "empty_phone_list",
          path: "result[0].phones",
        }),
      ]),
    );
  });

  it("keeps full safe validation details behind the top issue list (D-06, D-07)", () => {
    const invalidPreview = validateSpeechAssessmentForAnalysis({
      ...parsedFixture,
      result: [
        {
          ...parsedFixture.result[0],
          start_time: undefined,
          end_time: -1,
          score: 2,
          phones: [],
        },
      ],
      total_score: 2,
      audio_url: "javascript:alert(1)",
    });

    expect(invalidPreview.acceptedForAnalysis).toBe(false);
    expect(invalidPreview.issues.length).toBeLessThanOrEqual(5);
    expect(invalidPreview.issueCount).toBe(invalidPreview.allIssues.length);
    expect(invalidPreview.allIssues.length).toBeGreaterThanOrEqual(
      invalidPreview.issues.length,
    );
    expect(invalidPreview.allIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          path: expect.stringMatching(/^result\[0\]\./),
          message: expect.any(String),
        }),
      ]),
    );
    expect(JSON.stringify(invalidPreview)).not.toContain("GEMINI_API_KEY");
    expect(JSON.stringify(invalidPreview)).not.toContain("SUPABASE_SECRET_KEY");
    expect(JSON.stringify(invalidPreview)).not.toContain("Error:");
  });

  it("returns warnings for suspicious but computable payloads (JSON-02, D-08)", () => {
    const overlapping = SpeechAssessmentResponseSchema.parse({
      ...parsedFixture,
      result: [
        parsedFixture.result[0],
        {
          ...parsedFixture.result[1],
          start_time: parsedFixture.result[0].end_time - 0.1,
        },
        ...parsedFixture.result.slice(2),
      ],
    });
    expect(computeJsonAnalysis(overlapping).warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "overlapping_words" }),
      ]),
    );

    const zeroDurationWord = SpeechAssessmentResponseSchema.parse(
      withFirstWord({ end_time: parsedFixture.result[0].start_time }),
    );
    expect(computeJsonAnalysis(zeroDurationWord).warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "zero_duration_word" }),
      ]),
    );

    const zeroDurationPhone = SpeechAssessmentResponseSchema.parse(
      withFirstWord({
        phones: [
          {
            ...parsedFixture.result[0].phones[0],
            end_time: parsedFixture.result[0].phones[0].start_time,
          },
          ...parsedFixture.result[0].phones.slice(1),
        ],
      }),
    );
    expect(computeJsonAnalysis(zeroDurationPhone).warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "zero_duration_phone" }),
      ]),
    );

    const veryLowWpm = SpeechAssessmentResponseSchema.parse({
      ...parsedFixture,
      result: [
        ...parsedFixture.result.slice(0, -1),
        { ...parsedFixture.result.at(-1)!, end_time: 500 },
      ],
    });
    expect(computeJsonAnalysis(veryLowWpm).warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "very_low_wpm" })]),
    );

    const veryHighWpm = SpeechAssessmentResponseSchema.parse({
      ...parsedFixture,
      result: parsedFixture.result.map((word) => scaleWordTimings(word, 0.5)),
    });
    expect(computeJsonAnalysis(veryHighWpm).warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "very_high_wpm" }),
      ]),
    );
  });
});
