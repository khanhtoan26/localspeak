import { Controller, Get } from "@nestjs/common";
import { SpeechAssessmentResponseSchema } from "@localspeak/contracts";
import fixture from "../../../../.artifacts/speech-response.json";

@Controller("contracts")
export class ContractsController {
  @Get("sample-json/validate")
  validateSampleJson() {
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    return {
      valid: result.success,
      contract: "speech-assessment-response.v1",
      issues: result.success ? [] : result.error.issues,
    };
  }
}
