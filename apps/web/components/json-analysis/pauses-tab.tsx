import type { PauseMetric, PauseSeverity } from "@localspeak/contracts";

const severityLabels: Record<PauseSeverity, string> = {
  natural: "Natural",
  noticeable: "Noticeable",
  critical: "Critical",
};

type PausesTabProps = {
  pauses: PauseMetric[];
};

export function PausesTab({ pauses }: PausesTabProps) {
  if (pauses.length === 0) {
    return (
      <section className="json-empty-state">
        <h2 className="json-analysis-card__title">No notable pauses found.</h2>
        <p className="json-analysis-card__detail">
          The word timings did not include pauses long enough to flag in this analysis.
        </p>
      </section>
    );
  }

  return (
    <section className="json-analysis-card">
      <h2 className="json-analysis-card__title">Pauses</h2>
      <ul className="json-result-list">
        {pauses.map((pause) => (
          <li
            className={`json-result-row json-result-row--pause-${pause.severity}`}
            key={`${pause.index}-${pause.startTime}-${pause.endTime}`}
          >
            <strong>{severityLabels[pause.severity]}</strong>
            <span>
              {pause.duration.toFixed(2)}s between "{pause.beforeWord}" and "
              {pause.afterWord}"
            </span>
            <span>
              gap: {pause.startTime.toFixed(2)}s-{pause.endTime.toFixed(2)}s
            </span>
            <p>{pause.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
