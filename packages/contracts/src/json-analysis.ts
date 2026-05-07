import { z } from "zod";
import { SpeechAssessmentResponseSchema } from "./speech-assessment";

export const JsonAnalysisRequestSchema = z.looseObject({
  speechAssessment: SpeechAssessmentResponseSchema,
});

export const JsonAnalysisResponseSchema = z.looseObject({
  inputMode: z.literal("json"),
  speechAssessment: SpeechAssessmentResponseSchema,
  pronunciation: z.looseObject({}).optional(),
  fluency: z.looseObject({}).optional(),
});

export type JsonAnalysisRequest = z.infer<typeof JsonAnalysisRequestSchema>;
export type JsonAnalysisResponse = z.infer<typeof JsonAnalysisResponseSchema>;
