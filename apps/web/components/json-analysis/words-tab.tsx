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
  const hasWeakWords = words.some((word) => word.band === "weak");

  if (!hasWeakWords) {
    return (
      <section className="json-empty-state">
        <h2 className="json-analysis-card__title">No major weak words found.</h2>
        <p className="json-analysis-card__detail">
          Most word scores are in the okay or good range for this sample.
        </p>
      </section>
    );
  }

  return (
    <section className="json-analysis-card">
      <h2 className="json-analysis-card__title">Words</h2>
      <ul className="json-result-list">
        {words.map((word) => (
          <li
            className={`json-result-row json-result-row--${word.band}`}
            data-testid="word-row"
            key={`${word.index}-${word.word}`}
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
      </ul>
    </section>
  );
}
