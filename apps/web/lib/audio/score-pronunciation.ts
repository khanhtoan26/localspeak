import type { DeepgramWord } from "../../components/audio-mode/use-deepgram-session";

export interface WordScore {
  expected: string;
  spoken: string | null;
  confidence: number;
  /** "good" (≥0.95), "ok" (≥0.80), "weak" (<0.80), "missed" (not spoken) */
  level: "good" | "ok" | "weak" | "missed";
}

export interface FluencyReport {
  wordsPerMinute: number;
  totalDurationSeconds: number;
  hesitationCount: number;
  /** Gaps > 500ms between words */
  hesitationGaps: { afterWord: string; gapMs: number }[];
}

export interface PronunciationResult {
  wordScores: WordScore[];
  fluency: FluencyReport;
  overallScore: number;
  summary: string;
}

function normalize(word: string): string {
  return word.replace(/[^a-zA-Z']/g, "").toLowerCase();
}

function classifyConfidence(c: number): WordScore["level"] {
  if (c >= 0.95) return "good";
  if (c >= 0.8) return "ok";
  return "weak";
}

/**
 * Score pronunciation by comparing Deepgram results against expected text.
 * Uses sequential alignment (not edit-distance) for simplicity.
 */
export function scorePronunciation(
  words: DeepgramWord[],
  referenceText: string,
): PronunciationResult {
  const expectedWords = referenceText
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
    .filter(Boolean);

  const spokenNorm = words.map((w) => ({
    ...w,
    norm: normalize(w.word),
  }));

  // Sequential alignment: walk through expected words, try to match spoken
  const wordScores: WordScore[] = [];
  let spokenIdx = 0;

  for (const expected of expectedWords) {
    const expNorm = normalize(expected);
    let matched = false;

    // Look ahead up to 3 positions for a match
    for (let ahead = 0; ahead < 3 && spokenIdx + ahead < spokenNorm.length; ahead++) {
      if (spokenNorm[spokenIdx + ahead].norm === expNorm) {
        // Skip any unmatched spoken words before this match
        spokenIdx += ahead;
        const spoken = spokenNorm[spokenIdx];
        wordScores.push({
          expected,
          spoken: spoken.word,
          confidence: spoken.confidence,
          level: classifyConfidence(spoken.confidence),
        });
        spokenIdx++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      wordScores.push({
        expected,
        spoken: null,
        confidence: 0,
        level: "missed",
      });
    }
  }

  // Fluency analysis
  const fluency = analyzeFluency(words);

  // Overall score: weighted average
  const scoredWords = wordScores.filter((w) => w.level !== "missed");
  const avgConfidence =
    scoredWords.length > 0
      ? scoredWords.reduce((sum, w) => sum + w.confidence, 0) / scoredWords.length
      : 0;
  const matchRate = scoredWords.length / Math.max(expectedWords.length, 1);
  const fluencyScore = Math.min(fluency.wordsPerMinute / 120, 1); // 120 WPM = perfect
  const hesitationPenalty = Math.max(0, 1 - fluency.hesitationCount * 0.1);

  const overallScore = Math.round(
    (avgConfidence * 0.5 + matchRate * 0.3 + fluencyScore * 0.1 + hesitationPenalty * 0.1) * 100,
  );

  const summary = generateSummary(overallScore, wordScores, fluency);

  return { wordScores, fluency, overallScore, summary };
}

function analyzeFluency(words: DeepgramWord[]): FluencyReport {
  if (words.length === 0) {
    return {
      wordsPerMinute: 0,
      totalDurationSeconds: 0,
      hesitationCount: 0,
      hesitationGaps: [],
    };
  }

  const firstStart = words[0].start;
  const lastEnd = words[words.length - 1].end;
  const totalDurationSeconds = lastEnd - firstStart;

  const wordsPerMinute =
    totalDurationSeconds > 0
      ? Math.round((words.length / totalDurationSeconds) * 60)
      : 0;

  const hesitationGaps: FluencyReport["hesitationGaps"] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = (words[i].start - words[i - 1].end) * 1000;
    if (gap > 500) {
      hesitationGaps.push({
        afterWord: words[i - 1].word,
        gapMs: Math.round(gap),
      });
    }
  }

  return {
    wordsPerMinute,
    totalDurationSeconds: Math.round(totalDurationSeconds * 10) / 10,
    hesitationCount: hesitationGaps.length,
    hesitationGaps,
  };
}

function generateSummary(
  score: number,
  wordScores: WordScore[],
  fluency: FluencyReport,
): string {
  const weakWords = wordScores
    .filter((w) => w.level === "weak" || w.level === "missed")
    .map((w) => w.expected);

  const parts: string[] = [];

  if (score >= 80) {
    parts.push("Great pronunciation!");
  } else if (score >= 60) {
    parts.push("Good effort — keep practicing.");
  } else {
    parts.push("Needs more practice.");
  }

  if (weakWords.length > 0) {
    parts.push(`Focus on: ${weakWords.slice(0, 5).join(", ")}.`);
  }

  if (fluency.hesitationCount > 2) {
    parts.push(`${fluency.hesitationCount} pauses detected — try for smoother flow.`);
  }

  parts.push(`Speed: ${fluency.wordsPerMinute} WPM.`);

  return parts.join(" ");
}
