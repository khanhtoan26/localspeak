import { z } from "zod";

export const SavedAnalysisSessionSchema = z.looseObject({
  id: z.string(),
  userId: z.string(),
  inputMode: z.enum(["json", "audio"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  inputMetadata: z.looseObject({}).optional(),
  metrics: z.looseObject({}).optional(),
  feedback: z.looseObject({}).optional(),
});

export const SavedSessionCreateRequestSchema = SavedAnalysisSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SavedAnalysisSession = z.infer<
  typeof SavedAnalysisSessionSchema
>;
export type SavedSessionCreateRequest = z.infer<
  typeof SavedSessionCreateRequestSchema
>;
