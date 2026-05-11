import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { JsonAnalysisResponse } from "@localspeak/contracts";
import { EvidenceCard } from "@/components/design-system/evidence-card";
import { AiCoachTab, type AiCoachState } from "./ai-coach-tab";
import { PhonemesTab } from "./phonemes-tab";
import { PausesTab } from "./pauses-tab";
import { WordsTab } from "./words-tab";

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
  return (
    <Tabs defaultValue="pause-analysis" className="min-w-0 w-full">
      <div className="min-w-0 overflow-x-auto pb-1">
        <TabsList className="h-auto min-w-max justify-start gap-1">
        <TabsTrigger value="pause-analysis">Pause Analysis</TabsTrigger>
        <TabsTrigger value="words">Words</TabsTrigger>
        <TabsTrigger value="phonemes">Phonemes</TabsTrigger>
        <TabsTrigger value="ielts-analysis">IELTS Analysis</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="pause-analysis" className="mt-4">
        <EvidenceCard
          title="Pause Analysis"
          description="Review pause timing and fluency impact."
        >
          <PausesTab pauses={analysis.pauses} pauseRatio={analysis.summary.pauseRatio} />
        </EvidenceCard>
      </TabsContent>
      <TabsContent value="words" className="mt-4">
        <EvidenceCard title="Words" description="Inspect word-level pronunciation scores.">
          <WordsTab words={analysis.words} />
        </EvidenceCard>
      </TabsContent>
      <TabsContent value="phonemes" className="mt-4">
        <EvidenceCard title="Phonemes" description="Find repeated weak sound patterns.">
          <PhonemesTab patterns={analysis.weakPhonemePatterns} />
        </EvidenceCard>
      </TabsContent>
      <TabsContent value="ielts-analysis" className="mt-4">
        <EvidenceCard title="IELTS Analysis" description="Optional AI feedback stays secondary.">
          <AiCoachTab state={aiCoachState} onRequestFeedback={onRequestFeedback} onRetry={onRetryFeedback} />
        </EvidenceCard>
      </TabsContent>
    </Tabs>
  );
}
