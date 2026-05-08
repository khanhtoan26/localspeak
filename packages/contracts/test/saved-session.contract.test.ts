import { describe, expect, it } from "vitest";
import {
  SavedSessionCreateRequestSchema,
  SavedSessionCreateResponseSchema,
  SavedSessionDetailResponseSchema,
  SavedSessionListResponseSchema,
} from "../src";

const ownerKey = "local-owner-1234567890";
const id = "11111111-1111-4111-8111-111111111111";
const timestamp = "2026-05-08T00:00:00.000Z";

const summaryFields = {
  id,
  ownerKey,
  userId: null,
  inputMode: "json" as const,
  title: "Practice attempt",
  referenceText: "This is a pronunciation practice attempt.",
  pronunciationBand: 7.5,
  fluencyBand: 7,
  wpm: 142,
  createdAt: timestamp,
  updatedAt: timestamp,
};

const snapshotFields = {
  inputMetadata: { source: "json-analysis", fileName: "sample.json" },
  metrics: {
    summary: { pronunciationBand: 7.5, fluencyBand: 7, wpm: 142 },
  },
  feedback: {
    pronunciationBand: 7.5,
    fluencyBand: 7,
    summary: "Good control.",
  },
};

describe("saved-session contracts", () => {
  it("accepts a valid JSON-mode create request", () => {
    const result = SavedSessionCreateRequestSchema.safeParse({
      ownerKey,
      inputMode: "json",
      title: "Practice attempt",
      referenceText: "This is a pronunciation practice attempt.",
      ...snapshotFields,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid audio-mode create request", () => {
    const result = SavedSessionCreateRequestSchema.safeParse({
      ownerKey,
      inputMode: "audio",
      title: "Speaking sample",
      inputMetadata: { source: "microphone", durationSeconds: 32 },
      metrics: { fluency: { wpm: 142 } },
      feedback: { summary: "Good control." },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing ownerKey", () => {
    const result = SavedSessionCreateRequestSchema.safeParse({
      inputMode: "json",
      inputMetadata: {},
      metrics: {},
    });

    expect(result.success).toBe(false);
  });

  it("rejects short ownerKey", () => {
    const result = SavedSessionCreateRequestSchema.safeParse({
      ownerKey: "short",
      inputMode: "json",
      inputMetadata: {},
      metrics: {},
    });

    expect(result.success).toBe(false);
  });

  it("rejects create payloads containing userId", () => {
    const result = SavedSessionCreateRequestSchema.safeParse({
      ownerKey,
      userId: null,
      inputMode: "json",
      inputMetadata: {},
      metrics: {},
    });

    expect(result.success).toBe(false);
  });

  it("rejects raw vendor speechAssessment snapshots", () => {
    const result = SavedSessionCreateRequestSchema.safeParse({
      ownerKey,
      inputMode: "json",
      inputMetadata: {},
      metrics: { speechAssessment: {} },
    });

    expect(result.success).toBe(false);
  });

  it("validates list responses with summary-only fields", () => {
    const body = SavedSessionListResponseSchema.parse({
      contract: "saved-session-list.v1",
      sessions: [summaryFields],
    });

    expect(body.sessions[0]).not.toHaveProperty("inputMetadata");
    expect(body.sessions[0]).not.toHaveProperty("metrics");
    expect(body.sessions[0]).not.toHaveProperty("feedback");
  });

  it("validates create and detail responses with full snapshots", () => {
    const session = { ...summaryFields, ...snapshotFields };

    expect(
      SavedSessionCreateResponseSchema.safeParse({
        contract: "saved-session-create.v1",
        session,
      }).success,
    ).toBe(true);

    const detail = SavedSessionDetailResponseSchema.parse({
      contract: "saved-session-detail.v1",
      session,
    });

    expect(detail.session.inputMetadata).toEqual(snapshotFields.inputMetadata);
    expect(detail.session.metrics).toEqual(snapshotFields.metrics);
    expect(detail.session.feedback).toEqual(snapshotFields.feedback);
  });
});
