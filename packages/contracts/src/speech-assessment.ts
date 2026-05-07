import { z } from "zod";

const TimeSchema = z.number().nonnegative();
const ScoreSchema = z.number().min(0).max(1);
const RawScoreSchema = z.number();
const NumericResponseTimeSchema = z.union([
  z.number().nonnegative(),
  z.string().regex(/^\d+(\.\d+)?$/, "response_time must be numeric"),
]);

const hasValidTimeRange = (value: { start_time: number; end_time: number }) =>
  value.end_time >= value.start_time;

const timeRangeIssue = {
  message: "end_time must be greater than or equal to start_time",
  path: ["end_time"],
};

export const SpeechPhoneSchema = z
  .looseObject({
    start_time: TimeSchema,
    end_time: TimeSchema,
    phone: z.string().min(1),
    phone_ipa: z.string().min(1),
    score: ScoreSchema,
    score_raw: RawScoreSchema,
  })
  .refine(hasValidTimeRange, timeRangeIssue);

export const SpeechLetterSchema = z
  .looseObject({
    start_time: TimeSchema,
    end_time: TimeSchema,
    letter: z.string().min(1),
    phones: z.array(SpeechPhoneSchema),
    score: ScoreSchema,
    score_raw: RawScoreSchema,
  })
  .refine(hasValidTimeRange, timeRangeIssue);

export const SpeechWordSchema = z
  .looseObject({
    start_time: TimeSchema,
    end_time: TimeSchema,
    word: z.string().min(1),
    score: ScoreSchema,
    score_raw: RawScoreSchema,
    phones: z.array(SpeechPhoneSchema),
    letters: z.array(SpeechLetterSchema),
  })
  .refine(hasValidTimeRange, timeRangeIssue);

export const SpeechAssessmentResponseSchema = z.looseObject({
  success: z.boolean(),
  msg: z.string().min(1),
  result: z.array(SpeechWordSchema),
  text_refs: z.string().min(1),
  audio_url: z.string().url(),
  total_score: ScoreSchema,
  response_time: NumericResponseTimeSchema,
});

export type SpeechPhone = z.infer<typeof SpeechPhoneSchema>;
export type SpeechLetter = z.infer<typeof SpeechLetterSchema>;
export type SpeechWord = z.infer<typeof SpeechWordSchema>;
export type SpeechAssessmentResponse = z.infer<
  typeof SpeechAssessmentResponseSchema
>;
