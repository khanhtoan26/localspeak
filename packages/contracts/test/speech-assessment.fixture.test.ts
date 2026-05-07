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
});
