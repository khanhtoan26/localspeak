import { z } from "zod";

export const AudioAnalysisRequestSchema = z.looseObject({
  inputMode: z.literal("audio"),
  audioUrl: z.string().optional(),
  recordingId: z.string().optional(),
});

export const AudioAnalysisResponseSchema = z.looseObject({
  inputMode: z.literal("audio"),
  status: z.enum(["queued", "processing", "complete", "failed"]),
  analysisId: z.string(),
  transcript: z.string().optional(),
  pronunciation: z.looseObject({}).optional(),
  fluency: z.looseObject({}).optional(),
});

export type AudioAnalysisRequest = z.infer<typeof AudioAnalysisRequestSchema>;
export type AudioAnalysisResponse = z.infer<typeof AudioAnalysisResponseSchema>;
