"use client";

import { useState } from "react";
import type { JsonAnalysisResponse } from "@localspeak/contracts";
import { AiCoachTab, type AiCoachState } from "./ai-coach-tab";
import { PhonemesTab } from "./phonemes-tab";
import { PausesTab } from "./pauses-tab";
import { WordsTab } from "./words-tab";

const tabs = ["Summary", "Words", "Phonemes", "Pauses", "AI Coach"] as const;
type TabName = (typeof tabs)[number];

type ResultTabsProps = {
  analysis: JsonAnalysisResponse;
  aiCoachState: AiCoachState;
  onRetryFeedback: () => void;
};

export function ResultTabs({ analysis, aiCoachState, onRetryFeedback }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Summary");

  return (
    <section className="json-results-tabs">
      <div className="json-tab-list" aria-label="Result tabs">
        {tabs.map((tab) => (
          <button
            className="json-tab-button"
            type="button"
            key={tab}
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="json-tab-panel">
        {activeTab === "Summary" ? <SummaryTab analysis={analysis} /> : null}
        {activeTab === "Words" ? <WordsTab words={analysis.words} /> : null}
        {activeTab === "Phonemes" ? (
          <PhonemesTab patterns={analysis.weakPhonemePatterns} />
        ) : null}
        {activeTab === "Pauses" ? <PausesTab pauses={analysis.pauses} /> : null}
        {activeTab === "AI Coach" ? (
          <AiCoachTab state={aiCoachState} onRetry={onRetryFeedback} />
        ) : null}
      </div>
    </section>
  );
}

function SummaryTab({ analysis }: { analysis: JsonAnalysisResponse }) {
  return (
    <section className="json-analysis-card">
      <h2 className="json-analysis-card__title">What this means</h2>
      <p className="json-analysis-card__detail">
        This suggests the sample was mostly understandable, with a few
        lower-scoring sound patterns and fluency pauses to review.
      </p>

      <div className="json-summary-section">
        <h3 className="json-analysis-subtitle">Pronunciation signals</h3>
        <p className="json-analysis-card__detail">
          Pronunciation is estimated from the backend total score,{" "}
          {analysis.pronunciation.weakPatterns.length} repeated weak sound
          patterns, and {analysis.pronunciation.wordBandCounts.weak} weak words.
        </p>
      </div>

      <div className="json-summary-section">
        <h3 className="json-analysis-subtitle">Fluency signals</h3>
        <p className="json-analysis-card__detail">
          Fluency is estimated from {analysis.fluency.wpm} WPM,{" "}
          {Math.round(analysis.fluency.pauseRatio * 100)}% pause ratio, and{" "}
          {analysis.fluency.criticalPauseCount} critical pauses.
        </p>
      </div>

      {analysis.warnings.length > 0 ? (
        <div className="json-summary-section">
          <h3 className="json-analysis-subtitle">Warnings</h3>
          <ul className="json-issue-list">
            {analysis.warnings.map((warning) => (
              <li className="json-issue-row" key={`${warning.code}-${warning.path ?? ""}`}>
                <strong>{warning.label}</strong>
                <p>{warning.message}</p>
                {warning.hint ? <p>{warning.hint}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
