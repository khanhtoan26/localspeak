import type { WeakPhonemePattern } from "@localspeak/contracts";

type PhonemesTabProps = {
  patterns: WeakPhonemePattern[];
};

export function PhonemesTab({ patterns }: PhonemesTabProps) {
  const topPatterns = patterns.slice(0, 5);

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
            {pattern.exampleWords.length > 0 ? (
              <span>Examples: {pattern.exampleWords.join(", ")}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
