import type { WordBand, WordMetric } from "@localspeak/contracts";

const bandLabels: Record<WordBand, string> = {
  weak: "Weak",
  okay: "Okay",
  good: "Good",
};

type WordsTabProps = {
  words: WordMetric[];
};

export function WordsTab({ words }: WordsTabProps) {
  const weakWords = words
    .filter((word) => word.band === "weak")
    .sort((left, right) => left.score - right.score)
    .slice(0, 5);

  if (words.length === 0) {
    return (
      <section className="json-empty-state">
        <h2 className="json-analysis-card__title">No major weak words found</h2>
        <p className="json-analysis-card__detail">
          Most word scores are in the okay or good range for this sample.
        </p>
      </section>
    );
  }

  return (
    <section className="json-analysis-card">
      <h2 className="json-analysis-card__title">Words</h2>
      <ul className="word-chip-legend" aria-label="Word score legend">
        {Object.entries(bandLabels).map(([band, label]) => (
          <li key={band}>
            <span className={`word-chip-legend__dot word-chip-legend__dot--${band}`} />
            {label}
          </li>
        ))}
      </ul>
      <ol className="word-chip-list" aria-label="Sentence-order word scores">
        {words.map((word) => (
          <li
            className={`word-chip word-chip--${word.band}`}
            aria-label={`${word.word}, ${word.band}, ${word.scorePercent} percent, from ${word.startTime.toFixed(
              2,
            )}s to ${word.endTime.toFixed(2)}s`}
            data-testid="word-row"
            key={`${word.index}-${word.word}`}
          >
            <strong>{word.word}</strong>
            <span>{word.scorePercent}%</span>
          </li>
        ))}
      </ol>
      {weakWords.length > 0 ? (
        <section className="weak-word-shortlist">
          <h3 className="json-analysis-subtitle">Weak words to repeat</h3>
          <ol className="json-result-list">
            {weakWords.map((word) => (
              <li
                className="json-result-row json-result-row--weak"
                key={`${word.index}-${word.word}-weak`}
              >
                <strong>{word.word}</strong>
                <span>
                  {bandLabels[word.band]} - {word.scorePercent}%
                </span>
                <span>
                  {word.startTime.toFixed(2)}s-{word.endTime.toFixed(2)}s
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </section>
  );
}
