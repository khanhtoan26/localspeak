import { describe, expect, it } from "vitest";
import fixture from "../../../.artifacts/speech-response.json";
import { SpeechAssessmentResponseSchema } from "../src";

describe("speech assessment fixture contract", () => {
  it("validates the real sample fixture", () => {
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    expect(result.success).toBe(true);
  });

  it("accepts the fixture response_time string", () => {
    const result = SpeechAssessmentResponseSchema.parse(fixture);

    expect(result.response_time).toBe("1.711");
  });

  it("preserves unknown vendor fields", () => {
    const result = SpeechAssessmentResponseSchema.parse({
      ...fixture,
      vendor_extra: { kept: true },
    });

    expect(result.vendor_extra).toEqual({ kept: true });
  });

  it("rejects invalid timing and score ranges", () => {
    const result = SpeechAssessmentResponseSchema.safeParse({
      ...fixture,
      total_score: 1.2,
      result: [
        {
          ...fixture.result[0],
          start_time: 2,
          end_time: 1,
          score: -0.1,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-http audio URLs", () => {
    const result = SpeechAssessmentResponseSchema.safeParse({
      ...fixture,
      audio_url: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
  });
});
