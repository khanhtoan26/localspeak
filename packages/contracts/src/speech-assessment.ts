import { z } from "zod";

export const SpeechPhoneSchema = z.looseObject({
  start_time: z.number(),
  end_time: z.number(),
  phone: z.string(),
  phone_ipa: z.string(),
  score: z.number(),
  score_raw: z.number(),
});

export const SpeechLetterSchema = z.looseObject({
  start_time: z.number(),
  end_time: z.number(),
  letter: z.string(),
  phones: z.array(SpeechPhoneSchema),
  score: z.number(),
  score_raw: z.number(),
});

export const SpeechWordSchema = z.looseObject({
  start_time: z.number(),
  end_time: z.number(),
  word: z.string(),
  score: z.number(),
  score_raw: z.number(),
  phones: z.array(SpeechPhoneSchema),
  letters: z.array(SpeechLetterSchema),
});

export const SpeechAssessmentResponseSchema = z.looseObject({
  success: z.boolean(),
  msg: z.string(),
  result: z.array(SpeechWordSchema),
  text_refs: z.string(),
  audio_url: z.string(),
  total_score: z.number(),
  response_time: z.union([z.string(), z.number()]),
});

export type SpeechPhone = z.infer<typeof SpeechPhoneSchema>;
export type SpeechLetter = z.infer<typeof SpeechLetterSchema>;
export type SpeechWord = z.infer<typeof SpeechWordSchema>;
export type SpeechAssessmentResponse = z.infer<
  typeof SpeechAssessmentResponseSchema
>;
