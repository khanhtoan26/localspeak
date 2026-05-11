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
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Summary metrics">
      {metricHelpers.map((metric) => (
        <Card key={metric.label} className="min-w-0 rounded-[22px] bg-card/90 p-4 shadow-sm">
          <h3
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground m-0"
            data-testid="summary-metric-label"
          >
            {metric.label}
          </h3>
          <p className="font-display text-4xl leading-none tracking-[-0.04em] text-foreground mt-3 mb-2">{metric.value(summary)}</p>
          <p className="text-sm text-muted-foreground m-0">{metric.helper}</p>
        </Card>
      ))}
    </section>
  );
}
