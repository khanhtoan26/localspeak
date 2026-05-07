import { z } from "zod";
import {
  SpeechAssessmentResponseSchema,
  type SpeechAssessmentResponse,
  type SpeechPhone,
  type SpeechWord,
} from "./speech-assessment";

export const JSON_ANALYSIS_MAX_BYTES = 2 * 1024 * 1024;
export const WEAK_PHONE_SCORE_THRESHOLD = 0.85;
export const REPEATED_WEAK_PHONE_MIN_COUNT = 2;
export const WEAK_PHONE_PATTERN_LIMIT = 5;
export const WORD_BAND_THRESHOLDS = { weakBelow: 0.65, goodFrom: 0.85 };
export const PAUSE_THRESHOLDS_SECONDS = {
  notableFrom: 0.3,
  noticeableFrom: 0.5,
  criticalFrom: 1.0,
};
export const FLUENCY_BAND_THRESHOLDS = {
  severe: { criticalPauseCount: 3, pauseRatio: 0.3, band: 5.5 },
  low: { criticalPauseCount: 2, pauseRatio: 0.2, band: 6.0 },
  limited: { criticalPauseCount: 1, pauseRatio: 0.15, band: 6.5 },
  strong: { maxPauseRatio: 0.1, minWpm: 140, maxWpm: 160, band: 7.5 },
  defaultBand: 7.0,
  hardWpmCap: { below: 100, above: 190, band: 6.0 },
  softWpmCap: { below: 120, above: 180, band: 6.5 },
};

const TOP_VALIDATION_ISSUE_LIMIT = 5;
const VERY_LOW_WORD_COUNT = 20;
const VERY_LOW_WPM = 100;
const VERY_HIGH_WPM = 190;
const UNUSUAL_DURATION_SECONDS = 180;

export const ValidationIssueCodeSchema = z.enum([
  "invalid_json",
  "missing_required_field",
  "invalid_type",
  "invalid_range",
  "invalid_url",
  "invalid_timing",
  "empty_result",
  "empty_phone_list",
]);

export const ValidationIssueSchema = z.strictObject({
  severity: z.literal("error"),
  code: ValidationIssueCodeSchema,
  label: z.string().min(1),
  path: z.string().min(1),
  message: z.string().min(1),
  hint: z.string().min(1).optional(),
  technical: z.string().min(1).optional(),
});

export const ValidationWarningCodeSchema = z.enum([
  "overlapping_words",
  "zero_duration_word",
  "zero_duration_phone",
  "unusual_duration",
  "score_mismatch",
  "very_low_word_count",
  "very_high_wpm",
  "very_low_wpm",
]);

export const ValidationWarningSchema = z.strictObject({
  severity: z.literal("warning"),
  code: ValidationWarningCodeSchema,
  label: z.string().min(1),
  path: z.string().min(1).optional(),
  value: z.union([z.number(), z.string()]).optional(),
  message: z.string().min(1),
  hint: z.string().min(1).optional(),
});

export const JsonAnalysisPreviewRequestSchema = z.looseObject({
  speechAssessment: z.unknown(),
});

export const JsonAnalysisPreviewResponseSchema = z.strictObject({
  contract: z.literal("json-analysis-preview.v1"),
  status: z.enum(["valid", "valid_with_warnings", "invalid"]),
  valid: z.boolean(),
  acceptedForAnalysis: z.boolean(),
  issueCount: z.number().int().nonnegative(),
  issues: z.array(ValidationIssueSchema),
  allIssues: z.array(ValidationIssueSchema),
  warnings: z.array(ValidationWarningSchema),
});

export const JsonAnalysisSampleResponseSchema = z.strictObject({
  contract: z.literal("speech-assessment-response.v1"),
  speechAssessment: SpeechAssessmentResponseSchema,
});

export const JsonAnalysisRequestSchema = z.looseObject({
  speechAssessment: SpeechAssessmentResponseSchema,
});

export const WordBandSchema = z.enum(["weak", "okay", "good"]);
export const PauseSeveritySchema = z.enum(["natural", "noticeable", "critical"]);

export const ExtractedSpeechAssessmentSchema = z.strictObject({
  totalScore: z.number().min(0).max(1),
  referenceText: z.string().min(1),
  wordCount: z.number().int().nonnegative(),
  phoneCount: z.number().int().nonnegative(),
  durationSeconds: z.number().nonnegative(),
});

export const JsonAnalysisSummarySchema = z.strictObject({
  pronunciationPercentage: z.number().int().min(0).max(100),
  pronunciationBand: z.number(),
  fluencyBand: z.number(),
  wpm: z.number().int().nonnegative(),
  pauseRatio: z.number().nonnegative(),
});

export const WordMetricSchema = z.strictObject({
  index: z.number().int().nonnegative(),
  word: z.string().min(1),
  score: z.number().min(0).max(1),
  scorePercent: z.number().int().min(0).max(100),
  band: WordBandSchema,
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  duration: z.number().nonnegative(),
});

export const PhonemeMetricSchema = z.strictObject({
  arpabet: z.string().min(1),
  ipaExamples: z.array(z.string().min(1)),
  averageScore: z.number().min(0).max(1),
  averageScorePercent: z.number().int().min(0).max(100),
  occurrenceCount: z.number().int().nonnegative(),
  weakOccurrenceCount: z.number().int().nonnegative(),
  exampleWords: z.array(z.string().min(1)),
});

export const WeakPhonemePatternSchema = z.strictObject({
  arpabet: z.string().min(1),
  ipaExamples: z.array(z.string().min(1)),
  averageScore: z.number().min(0).max(1),
  weakOccurrenceCount: z.number().int().nonnegative(),
  exampleWords: z.array(z.string().min(1)),
});

export const PauseMetricSchema = z.strictObject({
  index: z.number().int().nonnegative(),
  severity: PauseSeveritySchema,
  duration: z.number().nonnegative(),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  beforeWord: z.string().min(1),
  afterWord: z.string().min(1),
  nearbyWords: z.string().min(1),
  explanation: z.string().min(1),
});

export const WordBandCountsSchema = z.strictObject({
  weak: z.number().int().nonnegative(),
  okay: z.number().int().nonnegative(),
  good: z.number().int().nonnegative(),
});

export const PronunciationMetricsSchema = z.strictObject({
  totalScore: z.number().min(0).max(1),
  percentage: z.number().int().min(0).max(100),
  band: z.number(),
  phonemeAverages: z.array(PhonemeMetricSchema),
  weakPatterns: z.array(WeakPhonemePatternSchema),
  wordBandCounts: WordBandCountsSchema,
});

export const FluencyMetricsSchema = z.strictObject({
  durationSeconds: z.number().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  wpm: z.number().int().nonnegative(),
  totalPauseTime: z.number().nonnegative(),
  pauseRatio: z.number().nonnegative(),
  pauseCount: z.number().int().nonnegative(),
  criticalPauseCount: z.number().int().nonnegative(),
  band: z.number(),
  notablePauses: z.array(PauseMetricSchema),
});

export const JsonAnalysisResponseSchema = z.strictObject({
  contract: z.literal("json-analysis-response.v1"),
  inputMode: z.literal("json"),
  summary: JsonAnalysisSummarySchema,
  extracted: ExtractedSpeechAssessmentSchema,
  pronunciation: PronunciationMetricsSchema,
  fluency: FluencyMetricsSchema,
  words: z.array(WordMetricSchema),
  phonemes: z.array(PhonemeMetricSchema),
  weakPhonemePatterns: z.array(WeakPhonemePatternSchema),
  pauses: z.array(PauseMetricSchema),
  warnings: z.array(ValidationWarningSchema),
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type ValidationWarning = z.infer<typeof ValidationWarningSchema>;
export type JsonAnalysisPreviewRequest = z.infer<
  typeof JsonAnalysisPreviewRequestSchema
>;
export type JsonAnalysisPreviewResponse = z.infer<
  typeof JsonAnalysisPreviewResponseSchema
>;
export type JsonAnalysisSampleResponse = z.infer<
  typeof JsonAnalysisSampleResponseSchema
>;
export type JsonAnalysisRequest = z.infer<typeof JsonAnalysisRequestSchema>;
export type WordBand = z.infer<typeof WordBandSchema>;
export type PauseSeverity = z.infer<typeof PauseSeveritySchema>;
export type ExtractedSpeechAssessment = z.infer<
  typeof ExtractedSpeechAssessmentSchema
>;
export type JsonAnalysisSummary = z.infer<typeof JsonAnalysisSummarySchema>;
export type WordMetric = z.infer<typeof WordMetricSchema>;
export type PhonemeMetric = z.infer<typeof PhonemeMetricSchema>;
export type WeakPhonemePattern = z.infer<typeof WeakPhonemePatternSchema>;
export type PauseMetric = z.infer<typeof PauseMetricSchema>;
export type PronunciationMetrics = z.infer<typeof PronunciationMetricsSchema>;
export type FluencyMetrics = z.infer<typeof FluencyMetricsSchema>;
export type JsonAnalysisResponse = z.infer<typeof JsonAnalysisResponseSchema>;

type ZodIssueLike = {
  path: ReadonlyArray<string | number | symbol>;
  code: string;
  message: string;
};

type PhoneWithWord = SpeechPhone & {
  word: string;
};

export function formatJsonPath(path: Array<string | number>): string {
  if (path.length === 0) return "$";

  return path
    .map((part, index) => {
      if (typeof part === "number") return `[${part}]`;
      return index === 0 ? part : `.${part}`;
    })
    .join("");
}

export function toValidationIssues(
  zodIssues: ReadonlyArray<ZodIssueLike>,
): ValidationIssue[] {
  return zodIssues.map((issue) => {
    const path = issue.path.filter(
      (part): part is string | number =>
        typeof part === "string" || typeof part === "number",
    );
    const code = inferValidationIssueCode(issue, path);

    return ValidationIssueSchema.parse({
      severity: "error",
      code,
      label: issueLabel(code, path),
      path: formatJsonPath(path),
      message: issueMessage(code, issue.message),
      hint: issueHint(code, path),
      technical: `${issue.code}: ${issue.message}`,
    });
  });
}

export function validateSpeechAssessmentForAnalysis(
  input: unknown,
): JsonAnalysisPreviewResponse {
  const parsed = SpeechAssessmentResponseSchema.safeParse(input);

  if (!parsed.success) {
    return invalidPreview(toValidationIssues(parsed.error.issues));
  }

  const analysisIssues = getAnalysisReadinessIssues(parsed.data);

  if (analysisIssues.length > 0) {
    return invalidPreview(analysisIssues);
  }

  const warnings = computeWarnings(parsed.data);

  return JsonAnalysisPreviewResponseSchema.parse({
    contract: "json-analysis-preview.v1",
    status: warnings.length > 0 ? "valid_with_warnings" : "valid",
    valid: true,
    acceptedForAnalysis: true,
    issueCount: 0,
    issues: [],
    allIssues: [],
    warnings,
  });
}

export function computeWarnings(
  speechAssessment: SpeechAssessmentResponse,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const words = speechAssessment.result;
  const extracted = tryExtractSpeechAssessment(speechAssessment);

  if (words.length < VERY_LOW_WORD_COUNT) {
    warnings.push(
      warning({
        code: "very_low_word_count",
        label: "Very short response",
        path: "result",
        value: words.length,
        message: "This response has very few words, so fluency metrics may be less stable.",
        hint: "Use a fuller speaking sample when possible.",
      }),
    );
  }

  words.forEach((word, wordIndex) => {
    if (word.end_time === word.start_time) {
      warnings.push(
        warning({
          code: "zero_duration_word",
          label: "Zero-duration word",
          path: `result[${wordIndex}]`,
          value: word.word,
          message: "A word has the same start and end time.",
          hint: "Check the vendor timing data for this word.",
        }),
      );
    }

    word.phones.forEach((phone, phoneIndex) => {
      if (phone.end_time === phone.start_time) {
        warnings.push(
          warning({
            code: "zero_duration_phone",
            label: "Zero-duration phone",
            path: `result[${wordIndex}].phones[${phoneIndex}]`,
            value: phone.phone,
            message: "A phone has the same start and end time.",
            hint: "Check the vendor phone timing data.",
          }),
        );
      }
    });

    const previous = words[wordIndex - 1];
    if (previous && word.start_time < previous.end_time) {
      warnings.push(
        warning({
          code: "overlapping_words",
          label: "Overlapping word timings",
          path: `result[${wordIndex}].start_time`,
          value: round(word.start_time - previous.end_time, 3),
          message: "This word starts before the previous word ends.",
          hint: "Metrics can still be computed, but review the source timings.",
        }),
      );
    }
  });

  if (extracted) {
    if (extracted.durationSeconds > UNUSUAL_DURATION_SECONDS) {
      warnings.push(
        warning({
          code: "unusual_duration",
          label: "Unusual duration",
          value: round(extracted.durationSeconds, 3),
          message: "The response duration is unusually extended for JSON mode.",
          hint: "Confirm the timing units are seconds.",
        }),
      );
    }

    if (extracted.wpm < VERY_LOW_WPM) {
      warnings.push(
        warning({
          code: "very_low_wpm",
          label: "Very low WPM",
          value: extracted.wpm,
          message: "The computed speaking rate is unusually low.",
          hint: "Check whether the word timings include extended silence before or after speech.",
        }),
      );
    }

    if (extracted.wpm > VERY_HIGH_WPM) {
      warnings.push(
        warning({
          code: "very_high_wpm",
          label: "Very high WPM",
          value: extracted.wpm,
          message: "The computed speaking rate is unusually high.",
          hint: "Check whether the duration or timing units are correct.",
        }),
      );
    }

    const averageWordScore =
      words.reduce((sum, word) => sum + word.score, 0) / Math.max(words.length, 1);
    if (Math.abs(averageWordScore - speechAssessment.total_score) > 0.25) {
      warnings.push(
        warning({
          code: "score_mismatch",
          label: "Score mismatch",
          value: round(averageWordScore, 3),
          message: "The word-score average differs from the total score.",
          hint: "Use the vendor total score as the primary pronunciation score.",
        }),
      );
    }
  }

  return warnings;
}

export function extractSpeechAssessment(
  speechAssessment: SpeechAssessmentResponse,
): ExtractedSpeechAssessment {
  const extracted = tryExtractSpeechAssessment(speechAssessment);

  if (!extracted) {
    throw new Error("Speech assessment is not accepted for analysis.");
  }

  return ExtractedSpeechAssessmentSchema.parse({
    totalScore: speechAssessment.total_score,
    referenceText: speechAssessment.text_refs,
    wordCount: speechAssessment.result.length,
    phoneCount: speechAssessment.result.reduce(
      (count, word) => count + word.phones.length,
      0,
    ),
    durationSeconds: extracted.durationSeconds,
  });
}

export function getWordBand(score: number): WordBand {
  if (score < WORD_BAND_THRESHOLDS.weakBelow) return "weak";
  if (score < WORD_BAND_THRESHOLDS.goodFrom) return "okay";
  return "good";
}

export function getPronunciationBand(score: number): number {
  if (score >= 0.95) return 8.5;
  if (score >= 0.9) return 7.5;
  if (score >= 0.85) return 7.0;
  if (score >= 0.8) return 6.5;
  if (score >= 0.75) return 6.0;
  return 5.5;
}

export function getPauseSeverity(gapSeconds: number): PauseSeverity | null {
  if (gapSeconds < PAUSE_THRESHOLDS_SECONDS.notableFrom) return null;
  if (gapSeconds < PAUSE_THRESHOLDS_SECONDS.noticeableFrom) return "natural";
  if (gapSeconds < PAUSE_THRESHOLDS_SECONDS.criticalFrom) return "noticeable";
  return "critical";
}

export function getFluencyBand({
  criticalPauseCount,
  pauseRatio,
  wpm,
}: {
  criticalPauseCount: number;
  pauseRatio: number;
  wpm: number;
}): number {
  let band: number;

  if (
    criticalPauseCount >=
      FLUENCY_BAND_THRESHOLDS.severe.criticalPauseCount ||
    pauseRatio >= FLUENCY_BAND_THRESHOLDS.severe.pauseRatio
  ) {
    band = FLUENCY_BAND_THRESHOLDS.severe.band;
  } else if (
    criticalPauseCount >= FLUENCY_BAND_THRESHOLDS.low.criticalPauseCount ||
    pauseRatio >= FLUENCY_BAND_THRESHOLDS.low.pauseRatio
  ) {
    band = FLUENCY_BAND_THRESHOLDS.low.band;
  } else if (
    criticalPauseCount >= FLUENCY_BAND_THRESHOLDS.limited.criticalPauseCount ||
    pauseRatio >= FLUENCY_BAND_THRESHOLDS.limited.pauseRatio
  ) {
    band = FLUENCY_BAND_THRESHOLDS.limited.band;
  } else if (
    pauseRatio <= FLUENCY_BAND_THRESHOLDS.strong.maxPauseRatio &&
    wpm >= FLUENCY_BAND_THRESHOLDS.strong.minWpm &&
    wpm <= FLUENCY_BAND_THRESHOLDS.strong.maxWpm
  ) {
    band = FLUENCY_BAND_THRESHOLDS.strong.band;
  } else {
    band = FLUENCY_BAND_THRESHOLDS.defaultBand;
  }

  if (
    wpm < FLUENCY_BAND_THRESHOLDS.hardWpmCap.below ||
    wpm > FLUENCY_BAND_THRESHOLDS.hardWpmCap.above
  ) {
    return Math.min(band, FLUENCY_BAND_THRESHOLDS.hardWpmCap.band);
  }

  if (
    wpm < FLUENCY_BAND_THRESHOLDS.softWpmCap.below ||
    wpm > FLUENCY_BAND_THRESHOLDS.softWpmCap.above
  ) {
    return Math.min(band, FLUENCY_BAND_THRESHOLDS.softWpmCap.band);
  }

  return band;
}

export function computePronunciationMetrics(
  speechAssessment: SpeechAssessmentResponse,
): PronunciationMetrics {
  const words = computeWordMetrics(speechAssessment.result);
  const phonemeAverages = computePhonemeAverages(speechAssessment.result);
  const weakPatterns = phonemeAverages
    .filter(
      (phoneme) =>
        phoneme.weakOccurrenceCount >= REPEATED_WEAK_PHONE_MIN_COUNT,
    )
    .sort(
      (a, b) =>
        b.weakOccurrenceCount - a.weakOccurrenceCount ||
        a.averageScore - b.averageScore ||
        a.arpabet.localeCompare(b.arpabet),
    )
    .slice(0, WEAK_PHONE_PATTERN_LIMIT)
    .map((phoneme) =>
      WeakPhonemePatternSchema.parse({
        arpabet: phoneme.arpabet,
        ipaExamples: phoneme.ipaExamples,
        averageScore: phoneme.averageScore,
        weakOccurrenceCount: phoneme.weakOccurrenceCount,
        exampleWords: phoneme.exampleWords,
      }),
    );

  return PronunciationMetricsSchema.parse({
    totalScore: speechAssessment.total_score,
    percentage: Math.round(speechAssessment.total_score * 100),
    band: getPronunciationBand(speechAssessment.total_score),
    phonemeAverages,
    weakPatterns,
    wordBandCounts: countWordBands(words),
  });
}

export function computeFluencyMetrics(
  speechAssessment: SpeechAssessmentResponse,
): FluencyMetrics {
  const extracted = extractSpeechAssessment(speechAssessment);
  const notablePauses = computePauses(speechAssessment.result);
  const totalPauseTime = notablePauses.reduce(
    (sum, pause) => sum + pause.duration,
    0,
  );
  const pauseRatio = totalPauseTime / extracted.durationSeconds;
  const criticalPauseCount = notablePauses.filter(
    (pause) => pause.severity === "critical",
  ).length;
  const wpm = Math.round(extracted.wordCount / (extracted.durationSeconds / 60));

  return FluencyMetricsSchema.parse({
    durationSeconds: extracted.durationSeconds,
    wordCount: extracted.wordCount,
    wpm,
    totalPauseTime,
    pauseRatio,
    pauseCount: notablePauses.length,
    criticalPauseCount,
    band: getFluencyBand({ criticalPauseCount, pauseRatio, wpm }),
    notablePauses,
  });
}

export function computeJsonAnalysis(
  speechAssessment: SpeechAssessmentResponse,
): JsonAnalysisResponse {
  const preview = validateSpeechAssessmentForAnalysis(speechAssessment);
  if (!preview.acceptedForAnalysis) {
    throw new Error("Speech assessment is not accepted for analysis.");
  }

  const extracted = extractSpeechAssessment(speechAssessment);
  const pronunciation = computePronunciationMetrics(speechAssessment);
  const fluency = computeFluencyMetrics(speechAssessment);
  const words = computeWordMetrics(speechAssessment.result);
  const response = {
    contract: "json-analysis-response.v1",
    inputMode: "json",
    summary: {
      pronunciationPercentage: pronunciation.percentage,
      pronunciationBand: pronunciation.band,
      fluencyBand: fluency.band,
      wpm: fluency.wpm,
      pauseRatio: fluency.pauseRatio,
    },
    extracted,
    pronunciation,
    fluency,
    words,
    phonemes: pronunciation.phonemeAverages,
    weakPhonemePatterns: pronunciation.weakPatterns,
    pauses: fluency.notablePauses,
    warnings: preview.warnings,
  };

  return JsonAnalysisResponseSchema.parse(response);
}

function invalidPreview(allIssues: ValidationIssue[]): JsonAnalysisPreviewResponse {
  return JsonAnalysisPreviewResponseSchema.parse({
    contract: "json-analysis-preview.v1",
    status: "invalid",
    valid: false,
    acceptedForAnalysis: false,
    issueCount: allIssues.length,
    issues: allIssues.slice(0, TOP_VALIDATION_ISSUE_LIMIT),
    allIssues,
    warnings: [],
  });
}

function getAnalysisReadinessIssues(
  speechAssessment: SpeechAssessmentResponse,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (speechAssessment.result.length === 0) {
    issues.push(
      issue({
        code: "empty_result",
        label: "No word results",
        path: "result",
        message: "The JSON must include at least one word result.",
        hint: "Check that result contains the vendor word timing array.",
      }),
    );
  }

  speechAssessment.result.forEach((word, wordIndex) => {
    if (word.phones.length === 0) {
      issues.push(
        issue({
          code: "empty_phone_list",
          label: "Missing phone scores",
          path: `result[${wordIndex}].phones`,
          message: "Each word needs at least one phone score for pronunciation metrics.",
          hint: "Check that this word includes ARPAbet and IPA phone details.",
        }),
      );
    }
  });

  const extracted = tryExtractSpeechAssessment(speechAssessment);
  if (!extracted && speechAssessment.result.length > 0) {
    issues.push(
      issue({
        code: "invalid_timing",
        label: "Invalid duration",
        path: "result",
        message: "The word timings do not produce a positive finite duration.",
        hint: "Check the first start_time and final end_time values.",
      }),
    );
  }

  return issues;
}

function tryExtractSpeechAssessment(
  speechAssessment: SpeechAssessmentResponse,
): { durationSeconds: number; wpm: number } | null {
  const words = speechAssessment.result;
  const firstWord = words[0];
  const lastWord = words.at(-1);
  if (!firstWord || !lastWord) return null;

  const durationSeconds = lastWord.end_time - firstWord.start_time;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;

  const wpm = Math.round(words.length / (durationSeconds / 60));
  if (!Number.isFinite(wpm)) return null;

  return { durationSeconds, wpm };
}

function computeWordMetrics(words: SpeechWord[]): WordMetric[] {
  return words.map((word, index) =>
    WordMetricSchema.parse({
      index,
      word: word.word,
      score: word.score,
      scorePercent: Math.round(word.score * 100),
      band: getWordBand(word.score),
      startTime: word.start_time,
      endTime: word.end_time,
      duration: word.end_time - word.start_time,
    }),
  );
}

function computePhonemeAverages(words: SpeechWord[]): PhonemeMetric[] {
  const grouped = new Map<string, PhoneWithWord[]>();

  for (const word of words) {
    for (const phone of word.phones) {
      const phones = grouped.get(phone.phone) ?? [];
      phones.push({ ...phone, word: word.word });
      grouped.set(phone.phone, phones);
    }
  }

  return [...grouped.entries()]
    .map(([arpabet, phones]) => {
      const averageScore =
        phones.reduce((sum, phone) => sum + phone.score, 0) / phones.length;
      return PhonemeMetricSchema.parse({
        arpabet,
        ipaExamples: uniqueStrings(phones.map((phone) => phone.phone_ipa), 3),
        averageScore,
        averageScorePercent: Math.round(averageScore * 100),
        occurrenceCount: phones.length,
        weakOccurrenceCount: phones.filter(
          (phone) => phone.score < WEAK_PHONE_SCORE_THRESHOLD,
        ).length,
        exampleWords: uniqueStrings(phones.map((phone) => phone.word), 5),
      });
    })
    .sort(
      (a, b) =>
        b.weakOccurrenceCount - a.weakOccurrenceCount ||
        a.averageScore - b.averageScore ||
        a.arpabet.localeCompare(b.arpabet),
    );
}

function computePauses(words: SpeechWord[]): PauseMetric[] {
  return words
    .slice(1)
    .map((word, offset) => {
      const previousIndex = offset;
      const previous = words[previousIndex];
      const duration = Math.max(0, word.start_time - previous.end_time);
      const severity = getPauseSeverity(duration);

      if (!severity) return null;

      return PauseMetricSchema.parse({
        index: previousIndex,
        severity,
        duration,
        startTime: previous.end_time,
        endTime: word.start_time,
        beforeWord: previous.word,
        afterWord: word.word,
        nearbyWords: `${previous.word} ${word.word}`,
        explanation:
          severity === "critical"
            ? "This suggests a planning or word-search pause."
            : "This pause is noticeable in the word timing data.",
      });
    })
    .filter((pause): pause is PauseMetric => pause !== null)
    .sort((a, b) => b.duration - a.duration);
}

function countWordBands(words: WordMetric[]): Record<WordBand, number> {
  return words.reduce<Record<WordBand, number>>(
    (counts, word) => {
      counts[word.band] += 1;
      return counts;
    },
    { weak: 0, okay: 0, good: 0 },
  );
}

function uniqueStrings(values: string[], limit: number): string[] {
  return [...new Set(values.filter((value) => value.length > 0))].slice(0, limit);
}

function inferValidationIssueCode(
  issue: ZodIssueLike,
  path: Array<string | number>,
): ValidationIssue["code"] {
  const jsonPath = formatJsonPath(path);
  const code = issue.code;

  if (jsonPath.includes("audio_url")) return "invalid_url";
  if (jsonPath.includes("start_time") || jsonPath.includes("end_time")) {
    if (code === "custom") return "invalid_timing";
  }
  if (code === "invalid_type") {
    return issue.message.toLowerCase().includes("undefined")
      ? "missing_required_field"
      : "invalid_type";
  }
  if (code === "too_small" || code === "too_big") return "invalid_range";
  if (code === "invalid_format") return "invalid_url";
  if (code === "custom") return "invalid_range";

  return "invalid_type";
}

function issueLabel(
  code: ValidationIssue["code"],
  path: Array<string | number>,
): string {
  const field = path.at(-1);
  const fieldName =
    typeof field === "string"
      ? field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "JSON field";

  switch (code) {
    case "missing_required_field":
      return `Missing ${fieldName}`;
    case "invalid_range":
      return `${fieldName} is outside the expected range`;
    case "invalid_url":
      return "Audio URL must be HTTP(S)";
    case "invalid_timing":
      return "Timing values are out of order";
    case "empty_result":
      return "No word results";
    case "empty_phone_list":
      return "Missing phone scores";
    case "invalid_json":
      return "Invalid JSON";
    case "invalid_type":
      return `${fieldName} has the wrong type`;
  }
}

function issueMessage(code: ValidationIssue["code"], fallback: string): string {
  switch (code) {
    case "missing_required_field":
      return "A required speech assessment field is missing.";
    case "invalid_range":
      return "A numeric value is outside the supported range.";
    case "invalid_url":
      return "The audio_url field must use an http or https URL.";
    case "invalid_timing":
      return "An end time must be greater than or equal to its start time.";
    case "empty_result":
      return "The result array must include at least one word.";
    case "empty_phone_list":
      return "Each word must include at least one phone score.";
    case "invalid_json":
      return "The JSON could not be parsed.";
    case "invalid_type":
      return fallback;
  }
}

function issueHint(
  code: ValidationIssue["code"],
  path: Array<string | number>,
): string {
  const jsonPath = formatJsonPath(path);
  switch (code) {
    case "missing_required_field":
      return `Add the missing value at ${jsonPath}.`;
    case "invalid_range":
      return "Scores must be between 0 and 1, and timings must be nonnegative.";
    case "invalid_url":
      return "Use an http:// or https:// URL.";
    case "invalid_timing":
      return "Check the start_time and end_time values around this path.";
    case "empty_result":
      return "Paste the full vendor response, including word-level results.";
    case "empty_phone_list":
      return "Include phone, phone_ipa, score, and timing data for this word.";
    case "invalid_json":
      return "Check for a missing comma, quote, or closing bracket.";
    case "invalid_type":
      return `Check the value type at ${jsonPath}.`;
  }
}

function issue(input: Omit<ValidationIssue, "severity">): ValidationIssue {
  return ValidationIssueSchema.parse({ severity: "error", ...input });
}

function warning(input: Omit<ValidationWarning, "severity">): ValidationWarning {
  return ValidationWarningSchema.parse({ severity: "warning", ...input });
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
