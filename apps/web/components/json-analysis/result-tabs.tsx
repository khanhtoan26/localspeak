"use client";

import { useState } from "react";
import type { JsonAnalysisResponse } from "@localspeak/contracts";
import { AiCoachTab, type AiCoachState } from "./ai-coach-tab";
import { PhonemesTab } from "./phonemes-tab";
import { PausesTab } from "./pauses-tab";
import { WordsTab } from "./words-tab";

const tabs = ["Pause Analysis", "Words", "Phonemes", "IELTS Analysis"] as const;
type TabName = (typeof tabs)[number];

type ResultTabsProps = {
  analysis: JsonAnalysisResponse;
  aiCoachState: AiCoachState;
  onRequestFeedback: () => void;
  onRetryFeedback: () => void;
};

export function ResultTabs({
  analysis,
  aiCoachState,
  onRequestFeedback,
  onRetryFeedback,
}: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Pause Analysis");

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
        {activeTab === "Pause Analysis" ? (
          <PausesTab
            pauses={analysis.pauses}
            pauseRatio={analysis.summary.pauseRatio}
          />
        ) : null}
        {activeTab === "Words" ? <WordsTab words={analysis.words} /> : null}
        {activeTab === "Phonemes" ? (
          <PhonemesTab patterns={analysis.weakPhonemePatterns} />
        ) : null}
        {activeTab === "IELTS Analysis" ? (
          <AiCoachTab
            state={aiCoachState}
            onRequestFeedback={onRequestFeedback}
            onRetry={onRetryFeedback}
          />
        ) : null}
      </div>
    </section>
  );
}
