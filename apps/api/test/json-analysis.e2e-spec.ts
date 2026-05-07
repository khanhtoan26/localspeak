import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import {
  JSON_ANALYSIS_MAX_BYTES,
  JsonAnalysisPreviewResponseSchema,
  JsonAnalysisResponseSchema,
  JsonAnalysisSampleResponseSchema,
  SpeechAssessmentResponseSchema,
} from "@localspeak/contracts";
import request from "supertest";
import fixture from "../../../.artifacts/speech-response.json";
import { AppModule } from "../src/app.module";

const parsedFixture = SpeechAssessmentResponseSchema.parse(fixture);

const createApp = async (): Promise<NestExpressApplication> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
    logger: false,
  });
  app.useBodyParser("json", { limit: "2mb" });
  await app.init();

  return app;
};

const serialize = (value: unknown) => JSON.stringify(value);

const expectNoUnsafeDetails = (value: unknown) => {
  const serialized = serialize(value);

  expect(serialized).not.toContain("GEMINI_API_KEY");
  expect(serialized).not.toContain("SUPABASE_SECRET_KEY");
  expect(serialized).not.toContain("Error:");
  expect(serialized).not.toContain("at ");
};

const expectLearnerSafeIssue = (issue: Record<string, unknown>) => {
  const allowedKeys = new Set([
    "severity",
    "code",
    "label",
    "path",
    "message",
    "hint",
    "technical",
  ]);

  expect(Object.keys(issue).every((key) => allowedKeys.has(key))).toBe(true);
  expect(issue.label).toEqual(expect.any(String));
  expect(issue.path).toEqual(expect.any(String));
  expect(issue.message).toEqual(expect.any(String));
  expectNoUnsafeDetails(issue);
};

const withoutFirstWordStartTime = () => {
  const { start_time: _startTime, ...firstWordWithoutStartTime } =
    parsedFixture.result[0];

  return {
    ...parsedFixture,
    result: [firstWordWithoutStartTime, ...parsedFixture.result.slice(1)],
  };
};

const withMultipleInvalidFields = () => {
  const firstWord = parsedFixture.result[0];
  const firstPhone = firstWord.phones[0];
  const { start_time: _phoneStartTime, ...firstPhoneWithoutStartTime } =
    firstPhone;

  return {
    ...parsedFixture,
    audio_url: "not-a-url",
    total_score: 2,
    result: [
      {
        ...firstWord,
        start_time: -1,
        end_time: -2,
        score: 2,
        phones: [
          {
            ...firstPhoneWithoutStartTime,
            end_time: -1,
            score: -1,
          },
          ...firstWord.phones.slice(1),
        ],
      },
      ...parsedFixture.result.slice(1),
    ],
  };
};

const withSuspiciousButComputableTimings = () => ({
  ...parsedFixture,
  result: parsedFixture.result.map((word, index) => {
    if (index === 1) {
      return {
        ...word,
        start_time: parsedFixture.result[0].end_time - 0.05,
      };
    }

    if (index === 2) {
      return {
        ...word,
        end_time: word.start_time,
      };
    }

    if (index === 3) {
      return {
        ...word,
        phones: [
          {
            ...word.phones[0],
            end_time: word.phones[0].start_time,
          },
          ...word.phones.slice(1),
        ],
      };
    }

    return word;
  }),
});

describe("JsonAnalysisController (e2e)", () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the canonical sample JSON contract", async () => {
    const response = await request(app.getHttpServer())
      .get("/json-analysis/sample")
      .expect(200);

    const body = JsonAnalysisSampleResponseSchema.parse(response.body);
    expect(body.contract).toBe("speech-assessment-response.v1");
    expect(body.speechAssessment.result).toHaveLength(81);
  });

  it("previews the canonical fixture with safe top and full issue lists", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/preview")
      .send({ speechAssessment: parsedFixture })
      .expect(200);

    const body = JsonAnalysisPreviewResponseSchema.parse(response.body);
    expect(["valid", "valid_with_warnings"]).toContain(body.status);
    expect(body.acceptedForAnalysis).toBe(true);
    expect(body.issues).toEqual([]);
    expect(body.allIssues).toEqual([]);
    expect(body.warnings).toEqual(expect.any(Array));
    expectNoUnsafeDetails(body);
  });

  it("returns learner-safe preview issues with exact JSON paths", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/preview")
      .send({ speechAssessment: withoutFirstWordStartTime() })
      .expect(200);

    const body = JsonAnalysisPreviewResponseSchema.parse(response.body);
    expect(body.status).toBe("invalid");
    expect(body.acceptedForAnalysis).toBe(false);
    expect(body.issueCount).toBeGreaterThanOrEqual(1);
    expect(body.allIssues).toHaveLength(body.issueCount);
    expect(body.allIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "result[0].start_time",
          label: expect.stringMatching(/start time/i),
        }),
      ]),
    );
    body.allIssues.forEach((issue) => expectLearnerSafeIssue(issue));
    expectNoUnsafeDetails(body);
  });

  it("prioritizes top issues while preserving complete allIssues details", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/preview")
      .send({ speechAssessment: withMultipleInvalidFields() })
      .expect(200);

    const body = JsonAnalysisPreviewResponseSchema.parse(response.body);
    expect(body.status).toBe("invalid");
    expect(body.issueCount).toBe(body.allIssues.length);
    expect(body.issues.length).toBeLessThanOrEqual(5);
    expect(body.allIssues.length).toBeGreaterThan(body.issues.length);
    [...body.issues, ...body.allIssues].forEach((issue) =>
      expectLearnerSafeIssue(issue),
    );
    expectNoUnsafeDetails(body);
  });

  it("analyzes the canonical fixture without echoing speechAssessment", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/analyze")
      .send({ speechAssessment: parsedFixture })
      .expect(200);

    const body = JsonAnalysisResponseSchema.parse(response.body);
    expect(body.summary).toMatchObject({
      pronunciationPercentage: expect.any(Number),
      pronunciationBand: expect.any(Number),
      fluencyBand: expect.any(Number),
      wpm: expect.any(Number),
      pauseRatio: expect.any(Number),
    });
    expect(body.words).toEqual(expect.any(Array));
    expect(body.phonemes).toEqual(expect.any(Array));
    expect(body.weakPhonemePatterns).toEqual(expect.any(Array));
    expect(body.pauses).toEqual(expect.any(Array));
    expect(response.body).not.toHaveProperty("speechAssessment");
    expectNoUnsafeDetails(body);
  });

  it("revalidates analyze payloads independently before computing metrics", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/analyze")
      .send({ speechAssessment: withoutFirstWordStartTime() })
      .expect(400);

    expect(response.body).not.toHaveProperty("summary");
    expect(response.body).not.toHaveProperty("pronunciation");
    expect(response.body).not.toHaveProperty("fluency");
    expect(response.body.allIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "result[0].start_time" }),
      ]),
    );
    expectNoUnsafeDetails(response.body);
  });

  it("returns D-08 warnings for suspicious but computable JSON and still analyzes", async () => {
    const suspiciousFixture = withSuspiciousButComputableTimings();
    const previewResponse = await request(app.getHttpServer())
      .post("/json-analysis/preview")
      .send({ speechAssessment: suspiciousFixture })
      .expect(200);

    const preview = JsonAnalysisPreviewResponseSchema.parse(previewResponse.body);
    expect(preview.status).toBe("valid_with_warnings");
    expect(preview.acceptedForAnalysis).toBe(true);
    expect(preview.warnings.length).toBeGreaterThanOrEqual(1);

    const analyzeResponse = await request(app.getHttpServer())
      .post("/json-analysis/analyze")
      .send({ speechAssessment: suspiciousFixture })
      .expect(200);

    const analysis = JsonAnalysisResponseSchema.parse(analyzeResponse.body);
    expect(analysis.summary.wpm).toEqual(expect.any(Number));
    expect(analysis.warnings.length).toBeGreaterThanOrEqual(1);
    expect(analyzeResponse.body).not.toHaveProperty("speechAssessment");
  });

  it("keeps D-18 and D-19 fluency decisions locked in analyze responses", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/analyze")
      .send({ speechAssessment: parsedFixture })
      .expect(200);

    const body = JsonAnalysisResponseSchema.parse(response.body);
    const extraSeverity = "Lo" + "ng";
    expect(body.summary.fluencyBand).toBe(5.5);
    expect(body.fluency.criticalPauseCount).toBeGreaterThanOrEqual(3);
    expect(body.pauses.map((pause) => pause.severity)).toContain("critical");
    expect(body.pauses.map((pause) => pause.severity)).not.toContain(
      extraSeverity,
    );
  });

  it("rejects request bodies above 2 * 1024 * 1024 bytes safely", async () => {
    const response = await request(app.getHttpServer())
      .post("/json-analysis/preview")
      .send({
        speechAssessment: {
          ...parsedFixture,
          oversizedPadding: "x".repeat(JSON_ANALYSIS_MAX_BYTES),
        },
      });

    expect(JSON_ANALYSIS_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).not.toBe(500);
    expectNoUnsafeDetails(response.body);
  });

  it("keeps Phase 2 responses free of third-party service fields", async () => {
    const sample = await request(app.getHttpServer())
      .get("/json-analysis/sample")
      .expect(200);
    const preview = await request(app.getHttpServer())
      .post("/json-analysis/preview")
      .send({ speechAssessment: parsedFixture })
      .expect(200);
    const analysis = await request(app.getHttpServer())
      .post("/json-analysis/analyze")
      .send({ speechAssessment: parsedFixture })
      .expect(200);

    expectNoUnsafeDetails(sample.body);
    expectNoUnsafeDetails(preview.body);
    expectNoUnsafeDetails(analysis.body);
  });
});
