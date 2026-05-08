import type { WeakPhonemePattern } from "@localspeak/contracts";

type PhonemesTabProps = {
  patterns: WeakPhonemePattern[];
};

type RankedPattern = WeakPhonemePattern & {
  impactScore: number;
  hint: string | null;
  explanation: string;
};

export function PhonemesTab({ patterns }: PhonemesTabProps) {
  const topPatterns = [...patterns]
    .map(rankPattern)
    .sort((left, right) => right.impactScore - left.impactScore)
    .slice(0, 5);

  if (topPatterns.length === 0) {
    return (
      <section className="json-empty-state">
        <h2 className="json-analysis-card__title">No repeated weak pattern found.</h2>
        <p className="json-analysis-card__detail">
          The JSON did not show the same low-scoring phone repeated at least twice.
        </p>
      </section>
    );
  }

  return (
    <section className="json-analysis-card">
      <h2 className="json-analysis-card__title">Phonemes</h2>
      <ul className="json-result-list">
        {topPatterns.map((pattern) => (
          <li className="json-result-row" data-testid="phoneme-row" key={pattern.arpabet}>
            <strong>
              {pattern.arpabet} / {pattern.ipaExamples.join(", ")}
            </strong>
            <span>
              {pattern.weakOccurrenceCount} weak occurrences - average{" "}
              {Math.round(pattern.averageScore * 100)}%
            </span>
            <div
              className="phoneme-bar"
              aria-label={`${pattern.arpabet} weakness impact`}
            >
              <span
                className="phoneme-bar__fill"
                style={{ width: `${Math.round((1 - pattern.averageScore) * 100)}%` }}
              />
            </div>
            {pattern.exampleWords.length > 0 ? (
              <span>Examples: {pattern.exampleWords.join(", ")}</span>
            ) : null}
            <p>{pattern.explanation}</p>
            {pattern.hint ? <p className="phoneme-hint">{pattern.hint}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function rankPattern(pattern: WeakPhonemePattern): RankedPattern {
  const hint = getVietnameseHint(pattern);
  const lowScoreImpact = 1 - pattern.averageScore;
  const repeatImpact = Math.min(pattern.weakOccurrenceCount / 5, 1);
  const relevanceImpact = hint ? 0.25 : 0;

  return {
    ...pattern,
    hint,
    impactScore: lowScoreImpact * 0.55 + repeatImpact * 0.3 + relevanceImpact,
    explanation: `${pattern.arpabet} appears weak in ${pattern.weakOccurrenceCount} occurrence${
      pattern.weakOccurrenceCount === 1 ? "" : "s"
    }, so improving it can lift repeated pronunciation signals.`,
  };
}

function getVietnameseHint(pattern: WeakPhonemePattern): string | null {
  const haystack = [
    pattern.arpabet,
    ...pattern.ipaExamples,
    ...pattern.exampleWords,
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes("θ") || pattern.arpabet.toLowerCase() === "th") {
    return "Vietnamese speakers often replace /θ/ with /t/ or /d/; keep the tongue lightly between the teeth and let air flow.";
  }

  if (/\b(thr|str|tr)/.test(haystack)) {
    return "Vietnamese speakers often simplify consonant clusters; keep each consonant connected before the vowel.";
  }

  if (/\b(final|ending)\b/.test(haystack)) {
    return "Vietnamese speakers often drop final consonants; finish the sound clearly without adding a vowel.";
  }

  return null;
}
