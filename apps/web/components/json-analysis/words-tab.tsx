import type { WordBand, WordMetric } from "@localspeak/contracts";

const bandLabels: Record<WordBand, string> = {
  weak: "Weak",
  okay: "Okay",
  good: "Good",
};

const legendDotColor: Record<WordBand, string> = {
  weak: "bg-destructive",
  okay: "bg-warning",
  good: "bg-success",
};

const chipBase = "inline-flex flex-col items-center rounded-xl px-3 py-1.5 text-sm font-medium min-h-[44px] justify-center";

const chipColor: Record<WordBand, string> = {
  weak: "border border-destructive-border bg-destructive/10 text-destructive",
  okay: "border border-warning-border bg-warning/10 text-warning-foreground",
  good: "border border-success-border bg-success/10 text-success-foreground",
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
      <section className="flex flex-col gap-2 py-8 items-start">
        <h2 className="text-xl font-semibold text-foreground m-0">No major weak words found</h2>
        <p className="text-base text-muted-foreground">
          Most word scores are in the okay or good range for this sample.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground m-0">Words</h2>
      <ul className="flex flex-wrap gap-4 text-sm list-none p-0 m-0" aria-label="Word score legend">
        {Object.entries(bandLabels).map(([band, label]) => (
          <li key={band}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${legendDotColor[band as WordBand]}`} />
            {label}
          </li>
        ))}
      </ul>
      <ol className="flex flex-wrap gap-1.5 list-none p-0 m-0" aria-label="Sentence-order word scores">
        {words.map((word) => (
          <li
            className={`${chipBase} ${chipColor[word.band]}`}
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
        <section className="rounded-xl bg-sidebar p-4">
          <h3 className="text-base font-semibold text-foreground m-0 mb-2">Weak words to repeat</h3>
          <ol className="flex flex-col gap-2 list-none p-0 m-0">
            {weakWords.map((word) => (
              <li
                className="flex flex-col gap-1 rounded-xl border border-destructive-border bg-destructive/10 p-3 text-sm"
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
