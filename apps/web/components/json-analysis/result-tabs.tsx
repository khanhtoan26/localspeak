import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { JsonAnalysisResponse } from "@localspeak/contracts";
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
    <Tabs defaultValue="pause-analysis" className="w-full">
      <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
        <TabsTrigger value="pause-analysis">Pause Analysis</TabsTrigger>
        <TabsTrigger value="words">Words</TabsTrigger>
        <TabsTrigger value="phonemes">Phonemes</TabsTrigger>
        <TabsTrigger value="ielts-analysis">IELTS Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="pause-analysis">
        <PausesTab pauses={analysis.pauses} pauseRatio={analysis.summary.pauseRatio} />
      </TabsContent>
      <TabsContent value="words">
        <WordsTab words={analysis.words} />
      </TabsContent>
      <TabsContent value="phonemes">
        <PhonemesTab patterns={analysis.weakPhonemePatterns} />
      </TabsContent>
      <TabsContent value="ielts-analysis">
        <AiCoachTab state={aiCoachState} onRequestFeedback={onRequestFeedback} onRetry={onRetryFeedback} />
      </TabsContent>
    </Tabs>
  );
}
