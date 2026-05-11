import type { JsonAnalysisSummary } from "@localspeak/contracts";
import { MetricCard } from "@/components/design-system/metric-card";

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
  {
    label: "Pause Ratio",
    helper: "Share of speaking time spent in pauses.",
    value: (summary: JsonAnalysisSummary) =>
      `${Math.round(summary.pauseRatio * 100)}%`,
  },
];

type SummaryMetricCardsProps = {
  summary: JsonAnalysisSummary;
};

export function SummaryMetricCards({ summary }: SummaryMetricCardsProps) {
  return (
    <section
      className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Summary metrics"
    >
      {metricHelpers.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value(summary)}
          description={metric.helper}
        />
      ))}
    </section>
  );
}
