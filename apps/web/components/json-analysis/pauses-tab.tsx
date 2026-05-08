import type { PauseMetric, PauseSeverity } from "@localspeak/contracts";

const severityLabels: Record<PauseSeverity, string> = {
  natural: "Natural",
  noticeable: "Noticeable",
  critical: "Critical",
};

type PausesTabProps = {
  pauses: PauseMetric[];
  pauseRatio: number;
};

export function PausesTab({ pauses, pauseRatio }: PausesTabProps) {
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

  const sortedPauses = [...pauses].sort((left, right) => right.duration - left.duration);
  const longestPause = sortedPauses[0];
  const totalPauseTime = pauses.reduce((total, pause) => total + pause.duration, 0);
  const criticalCount = pauses.filter((pause) => pause.severity === "critical").length;
  const maxEndTime = Math.max(...pauses.map((pause) => pause.endTime), 1);

  return (
    <section className="json-analysis-card">
      <h2 className="json-analysis-card__title">Pause Analysis</h2>
      <div className="pause-summary-grid" aria-label="Pause summary">
        <div className="pause-summary-card">
          <span>Total pause time</span>
          <strong>{totalPauseTime.toFixed(2)}s</strong>
        </div>
        <div className="pause-summary-card">
          <span>Critical pauses</span>
          <strong>{criticalCount}</strong>
        </div>
        <div className="pause-summary-card">
          <span>Pause ratio</span>
          <strong>{Math.round(pauseRatio * 100)}%</strong>
        </div>
        <div className="pause-summary-card">
          <span>Longest pause</span>
          <strong>{longestPause.duration.toFixed(2)}s</strong>
        </div>
      </div>

      <div className="pause-timeline-scroll">
        <svg
          className="pause-timeline"
          role="img"
          aria-labelledby="pause-timeline-title"
          aria-describedby="pause-timeline-desc"
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
        >
          <title id="pause-timeline-title">Pause timeline</title>
          <desc id="pause-timeline-desc">
            Visual timeline of notable pauses with severity labels.
          </desc>
          <line className="pause-timeline__axis" x1="0" x2="100" y1="12" y2="12" />
          {pauses.map((pause) => {
            const x = (pause.startTime / maxEndTime) * 100;
            const width = Math.max(((pause.endTime - pause.startTime) / maxEndTime) * 100, 2);
            const label = `${severityLabels[pause.severity]} pause, ${pause.duration.toFixed(
              2,
            )} seconds, between "${pause.beforeWord}" and "${pause.afterWord}"`;

            return (
              <g key={`${pause.index}-${pause.startTime}-${pause.endTime}`}>
                <title>{label}</title>
                <rect
                  className={`pause-timeline__segment pause-timeline__segment--${pause.severity}`}
                  x={x}
                  y="6"
                  width={width}
                  height="12"
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="pause-legend" aria-label="Pause severity legend">
        {Object.entries(severityLabels).map(([severity, label]) => (
          <li key={severity}>
            <span className={`pause-legend__dot pause-legend__dot--${severity}`} />
            {label}
          </li>
        ))}
      </ul>

      <section className="pause-practice-cue">
        <h3 className="json-analysis-subtitle">Practice this pause first</h3>
        <p>
          Say "{longestPause.beforeWord} {longestPause.afterWord}" in one breath,
          then repeat the full sentence around that gap.
        </p>
      </section>

      <ul className="json-result-list">
        {sortedPauses.map((pause) => (
          <li
            className={`json-result-row json-result-row--pause-${pause.severity}`}
            key={`${pause.index}-${pause.startTime}-${pause.endTime}`}
          >
            <strong>{severityLabels[pause.severity]} pause</strong>
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
