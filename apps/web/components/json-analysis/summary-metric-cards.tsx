import type { JsonAnalysisSummary } from "@localspeak/contracts";

const metricHelpers = [
  {
    label: "Pronunciation",
    helper: "Computed from word and phone scores.",
    value: (summary: JsonAnalysisSummary) =>
      `${summary.pronunciationPercentage}%`,
  },
  {
    label: "Pronunciation Band",
    helper: "Estimated from deterministic score thresholds.",
    value: (summary: JsonAnalysisSummary) =>
      summary.pronunciationBand.toFixed(1),
  },
  {
    label: "Fluency Band",
    helper: "Estimated from WPM, pause ratio, and critical pauses.",
    value: (summary: JsonAnalysisSummary) => summary.fluencyBand.toFixed(1),
  },
  {
    label: "WPM",
    helper: "Words per minute from word timings.",
    value: (summary: JsonAnalysisSummary) => String(summary.wpm),
  },
];

type SummaryMetricCardsProps = {
  summary: JsonAnalysisSummary;
};

export function SummaryMetricCards({ summary }: SummaryMetricCardsProps) {
  return (
    <section className="json-metric-grid" aria-label="Summary metrics">
      {metricHelpers.map((metric) => (
        <article className="json-metric-card" key={metric.label}>
          <h3 className="json-metric-card__label" data-testid="summary-metric-label">
            {metric.label}
          </h3>
          <p className="json-metric-card__value">{metric.value(summary)}</p>
          <p className="json-metric-card__helper">{metric.helper}</p>
        </article>
      ))}
    </section>
  );
}
