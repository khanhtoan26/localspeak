import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import {
  SavedSessionCreateResponseSchema,
  SavedSessionDetailResponseSchema,
  SavedSessionListResponseSchema,
} from "@localspeak/contracts";
import request from "supertest";
import { AppModule } from "../src/app.module";

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

  expect(serialized).not.toContain("speechAssessment");
  expect(serialized).not.toContain("DATABASE_URL");
  expect(serialized).not.toContain("GEMINI_API_KEY");
  expect(serialized).not.toContain("DEEPGRAM_API_KEY");
  expect(serialized).not.toContain("Error:");
  expect(serialized).not.toContain("at ");
};

describe("SavedSessionsController (e2e)", () => {
  let app: NestExpressApplication;
  let savedSessionId: string;

  const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ownerA = `local-owner-a-${runId}`;
  const ownerB = `local-owner-b-${runId}`;

  const payload = {
    ownerKey: ownerA,
    inputMode: "json",
    title: "Practice attempt",
    referenceText: "This is a pronunciation practice attempt.",
    inputMetadata: { source: "json-analysis", fileName: "sample.json" },
    metrics: {
      summary: { pronunciationBand: 7.5, fluencyBand: 7, wpm: 142 },
      pronunciation: { band: 7.5 },
      fluency: { band: 7, wpm: 142 },
    },
    feedback: {
      pronunciationBand: 7.5,
      fluencyBand: 7,
      summary: "Good control.",
    },
  };

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for saved-sessions e2e tests");
    }

    app = await createApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("creates a saved session", async () => {
    const response = await request(app.getHttpServer())
      .post("/saved-sessions")
      .send(payload)
      .expect(201);

    const body = SavedSessionCreateResponseSchema.parse(response.body);
    savedSessionId = body.session.id;

    expect(body).toMatchObject({
      contract: "saved-session-create.v1",
      session: {
        ownerKey: ownerA,
        inputMode: "json",
        title: "Practice attempt",
        pronunciationBand: 7.5,
        fluencyBand: 7,
        wpm: 142,
      },
    });
    expectNoUnsafeDetails(body);
  });

  it("lists only records for the requested ownerKey", async () => {
    const ownerAResponse = await request(app.getHttpServer())
      .get("/saved-sessions")
      .set("X-Localspeak-Owner-Key", ownerA)
      .expect(200);

    const ownerAList = SavedSessionListResponseSchema.parse(ownerAResponse.body);
    expect(ownerAList.sessions.map((session) => session.id)).toContain(
      savedSessionId,
    );

    const ownerBResponse = await request(app.getHttpServer())
      .get("/saved-sessions")
      .set("X-Localspeak-Owner-Key", ownerB)
      .expect(200);

    const ownerBList = SavedSessionListResponseSchema.parse(ownerBResponse.body);
    expect(ownerBList.sessions.map((session) => session.id)).not.toContain(
      savedSessionId,
    );
    expectNoUnsafeDetails(ownerAList);
    expectNoUnsafeDetails(ownerBList);
  });

  it("fetches detail only for the matching ownerKey", async () => {
    const response = await request(app.getHttpServer())
      .get(`/saved-sessions/${savedSessionId}`)
      .set("X-Localspeak-Owner-Key", ownerA)
      .expect(200);

    const body = SavedSessionDetailResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      contract: "saved-session-detail.v1",
      session: {
        id: savedSessionId,
        ownerKey: ownerA,
        inputMetadata: payload.inputMetadata,
        metrics: payload.metrics,
        feedback: payload.feedback,
      },
    });
    expectNoUnsafeDetails(body);
  });

  it("returns 404 for wrong owner", async () => {
    const response = await request(app.getHttpServer())
      .get(`/saved-sessions/${savedSessionId}`)
      .set("X-Localspeak-Owner-Key", ownerB)
      .expect(404);

    expectNoUnsafeDetails(response.body);
  });

  it("returns 400 when ownerKey is missing", async () => {
    const response = await request(app.getHttpServer())
      .get("/saved-sessions")
      .expect(400);

    expectNoUnsafeDetails(response.body);
  });

  it("rejects raw speechAssessment snapshots", async () => {
    const response = await request(app.getHttpServer())
      .post("/saved-sessions")
      .send({ ...payload, metrics: { speechAssessment: {} } })
      .expect(400);

    expectNoUnsafeDetails(response.body);
  });
});
