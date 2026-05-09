import { Card } from "@/components/ui/card";
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
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Summary metrics">
      {metricHelpers.map((metric) => (
        <Card key={metric.label} className="p-4 min-w-0">
          <h3
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle m-0"
            data-testid="summary-metric-label"
          >
            {metric.label}
          </h3>
          <p className="font-display text-4xl text-foreground mt-2 mb-2">{metric.value(summary)}</p>
          <p className="text-sm text-muted-foreground m-0">{metric.helper}</p>
        </Card>
      ))}
    </section>
  );
}
