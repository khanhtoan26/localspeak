import type { PauseMetric, PauseSeverity } from "@localspeak/contracts";

const severityLabels: Record<PauseSeverity, string> = {
  natural: "Natural",
  noticeable: "Noticeable",
  critical: "Critical",
};

const segmentFill: Record<PauseSeverity, string> = {
  natural: "#3f6b4f",
  noticeable: "#b88a3e",
  critical: "#9f2d20",
};

const legendDotColor: Record<PauseSeverity, string> = {
  natural: "bg-[#3f6b4f]",
  noticeable: "bg-[#b88a3e]",
  critical: "bg-[#9f2d20]",
};

const pauseRowColor: Record<PauseSeverity, string> = {
  natural: "border-[#d9e8dd] bg-[#f0f7f2]",
  noticeable: "border-[#eadcb8] bg-[#fdf7ec]",
  critical: "border-[#edd0ca] bg-[#fdf1ee]",
};

type PausesTabProps = {
  pauses: PauseMetric[];
  pauseRatio: number;
};

export function PausesTab({ pauses, pauseRatio }: PausesTabProps) {
  if (pauses.length === 0) {
    return (
      <section className="flex flex-col gap-2 py-8 items-start">
        <h2 className="text-xl font-semibold text-foreground m-0">No notable pauses found</h2>
        <p className="text-base text-muted-foreground">
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
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground m-0">Pause Analysis</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Pause summary">
        <div className="flex flex-col gap-1 rounded-xl bg-sidebar p-3 text-sm">
          <span>Total pause time</span>
          <strong>{totalPauseTime.toFixed(2)}s</strong>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-sidebar p-3 text-sm">
          <span>Critical pauses</span>
          <strong>{criticalCount}</strong>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-sidebar p-3 text-sm">
          <span>Pause ratio</span>
          <strong>{Math.round(pauseRatio * 100)}%</strong>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-sidebar p-3 text-sm">
          <span>Longest pause</span>
          <strong>{longestPause.duration.toFixed(2)}s</strong>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-sidebar p-2">
        <svg
          className="w-full h-6 min-w-[200px]"
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
          <line stroke="currentColor" strokeOpacity="0.2" x1="0" x2="100" y1="12" y2="12" />
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
                  fill={segmentFill[pause.severity]}
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

      <ul className="flex flex-wrap gap-4 text-sm list-none p-0 m-0" aria-label="Pause severity legend">
        {Object.entries(severityLabels).map(([severity, label]) => (
          <li key={severity}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${legendDotColor[severity as PauseSeverity]}`} />
            {label}
          </li>
        ))}
      </ul>

      <section className="rounded-xl bg-sidebar p-4">
        <h3 className="text-base font-semibold text-foreground m-0 mb-2">Practice this pause first</h3>
        <p>
          Try saying "{longestPause.beforeWord} {longestPause.afterWord}" as one
          short phrase, then repeat the full sentence around that gap.
        </p>
      </section>

      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {sortedPauses.map((pause) => (
          <li
            className={`flex flex-col gap-1 rounded-xl p-3 text-sm border ${pauseRowColor[pause.severity]}`}
            key={`${pause.index}-${pause.startTime}-${pause.endTime}`}
          >
            <strong>{severityLabels[pause.severity]} pause</strong>
            <span>
              {pause.duration.toFixed(2)}s between "{pause.beforeWord}" and "
              {pause.afterWord}"
            </span>
            <span>
              gap: {pause.startTime.toFixed(2)}s to {pause.endTime.toFixed(2)}s
            </span>
            <p>{pause.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
