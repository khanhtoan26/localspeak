import { z } from "zod";

// --- Request schema (what frontend sends to POST /api/gemini-feedback) ---

export const GeminiFeedbackRequestSchema = z.strictObject({
  referenceText: z.string().min(1),
  pronunciationBand: z.number(),
  fluencyBand: z.number(),
  wpm: z.number().int().nonnegative(),
  pauseRatio: z.number().nonnegative(),
  weakWords: z.array(
    z.strictObject({
      word: z.string().min(1),
      score: z.number().min(0).max(1),
    }),
  ),
  weakPhonemePatterns: z.array(
    z.strictObject({
      arpabet: z.string().min(1),
      ipaExamples: z.array(z.string()),
      averageScore: z.number().min(0).max(1),
      exampleWords: z.array(z.string()),
    }),
  ),
  notablePauses: z.array(
    z.strictObject({
      duration: z.number(),
      severity: z.enum(["natural", "noticeable", "critical"]),
      beforeWord: z.string(),
      afterWord: z.string(),
    }),
  ),
});

// --- Response schema (what Gemini returns, validated by Zod) ---

export const TopErrorSchema = z.strictObject({
  word: z.string().min(1),
  phoneme: z.string().min(1),
  explanation: z.string().min(1),
});

export const GeminiFeedbackResponseSchema = z.strictObject({
  pronunciationBand: z.number().min(0).max(9),
  fluencyBand: z.number().min(0).max(9),
  topErrors: z.array(TopErrorSchema).length(3),
  drills: z.array(z.string().min(1)).length(3),
  summary: z.string().min(1),
});

// --- Type exports ---

export type GeminiFeedbackRequest = z.infer<typeof GeminiFeedbackRequestSchema>;
export type GeminiFeedbackResponse = z.infer<
  typeof GeminiFeedbackResponseSchema
>;
export type TopError = z.infer<typeof TopErrorSchema>;
