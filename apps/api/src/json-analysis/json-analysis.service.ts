import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from "@nestjs/common";
import {
  JSON_ANALYSIS_MAX_BYTES,
  JsonAnalysisPreviewRequestSchema,
  JsonAnalysisPreviewResponseSchema,
  JsonAnalysisRequestSchema,
  JsonAnalysisResponseSchema,
  JsonAnalysisSampleResponseSchema,
  computeJsonAnalysis,
  toValidationIssues,
  validateSpeechAssessmentForAnalysis,
  type JsonAnalysisPreviewResponse,
  type JsonAnalysisResponse,
  type JsonAnalysisSampleResponse,
  type ValidationIssue,
} from "@localspeak/contracts";
import fixture from "../../../../.artifacts/speech-response.json";

type JsonAnalysisInvalidResponse = {
  contract: "json-analysis-error.v1";
  status: "invalid";
  statusCode: 400;
  message: string;
  issueCount: number;
  issues: ValidationIssue[];
  allIssues: ValidationIssue[];
  warnings: [];
};

@Injectable()
export class JsonAnalysisService {
  getSample(): JsonAnalysisSampleResponse {
    return JsonAnalysisSampleResponseSchema.parse({
      contract: "speech-assessment-response.v1",
      speechAssessment: fixture,
    });
  }

  preview(body: unknown): JsonAnalysisPreviewResponse {
    this.assertWithinSizeLimit(body);

    const request = JsonAnalysisPreviewRequestSchema.safeParse(body);
    if (!request.success) {
      return invalidPreview(toValidationIssues(request.error.issues));
    }

    return JsonAnalysisPreviewResponseSchema.parse(
      validateSpeechAssessmentForAnalysis(request.data.speechAssessment),
    );
  }

  analyze(body: unknown): JsonAnalysisResponse {
    this.assertWithinSizeLimit(body);

    const request = JsonAnalysisRequestSchema.safeParse(body);
    if (!request.success) {
      throw new BadRequestException(
        this.invalidAnalyzeResponse(
          body,
          toValidationIssues(request.error.issues),
        ),
      );
    }

    const preview = validateSpeechAssessmentForAnalysis(
      request.data.speechAssessment,
    );
    if (!preview.acceptedForAnalysis) {
      throw new BadRequestException(errorResponse(preview.allIssues));
    }

    return JsonAnalysisResponseSchema.parse(
      computeJsonAnalysis(request.data.speechAssessment),
    );
  }

  private assertWithinSizeLimit(body: unknown) {
    const serialized = JSON.stringify(body) ?? "";
    const size = Buffer.byteLength(serialized, "utf8");

    if (size > JSON_ANALYSIS_MAX_BYTES) {
      throw new PayloadTooLargeException({
        contract: "json-analysis-error.v1",
        status: "too_large",
        statusCode: 413,
        message: "JSON payload exceeds the 2 MB limit.",
      });
    }
  }

  private invalidAnalyzeResponse(
    body: unknown,
    fallbackIssues: ValidationIssue[],
  ): JsonAnalysisInvalidResponse {
    const previewRequest = JsonAnalysisPreviewRequestSchema.safeParse(body);
    if (previewRequest.success) {
      const preview = validateSpeechAssessmentForAnalysis(
        previewRequest.data.speechAssessment,
      );
      if (preview.allIssues.length > 0) {
        return errorResponse(preview.allIssues);
      }
    }

    return errorResponse(fallbackIssues);
  }
}

function invalidPreview(
  allIssues: ValidationIssue[],
): JsonAnalysisPreviewResponse {
  return JsonAnalysisPreviewResponseSchema.parse({
    contract: "json-analysis-preview.v1",
    status: "invalid",
    valid: false,
    acceptedForAnalysis: false,
    issueCount: allIssues.length,
    issues: allIssues.slice(0, 5),
    allIssues,
    warnings: [],
  });
}

function errorResponse(allIssues: ValidationIssue[]): JsonAnalysisInvalidResponse {
  return {
    contract: "json-analysis-error.v1",
    status: "invalid",
    statusCode: 400,
    message: "JSON assessment is not accepted for analysis.",
    issueCount: allIssues.length,
    issues: allIssues.slice(0, 5),
    allIssues,
    warnings: [],
  };
}
