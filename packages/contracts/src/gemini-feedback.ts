import { z } from "zod";

export const GeminiFeedbackRequestSchema = z.looseObject({
  inputMode: z.enum(["json", "audio"]),
  pronunciation: z.looseObject({}).optional(),
  fluency: z.looseObject({}).optional(),
});

export const GeminiFeedbackResponseSchema = z.looseObject({
  pronunciationBand: z.number().min(0).max(9),
  fluencyBand: z.number().min(0).max(9),
  topErrors: z.array(z.string()).max(3),
  drills: z.array(z.string()).max(3),
  summary: z.string(),
});

export type GeminiFeedbackRequest = z.infer<
  typeof GeminiFeedbackRequestSchema
>;
export type GeminiFeedbackResponse = z.infer<
  typeof GeminiFeedbackResponseSchema
>;
