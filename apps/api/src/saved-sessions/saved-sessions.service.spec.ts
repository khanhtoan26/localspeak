import { BadRequestException, NotFoundException } from "@nestjs/common";
import { DatabaseProvider } from "../database/database.provider";
import type { SavedAnalysisSessionRow } from "../database/schema";
import { SavedSessionsService } from "./saved-sessions.service";

const ownerKey = "local-owner-1234567890";
const otherOwnerKey = "local-owner-other-123456";
const id = "11111111-1111-4111-8111-111111111111";
const now = new Date("2026-05-08T00:00:00.000Z");

const row: SavedAnalysisSessionRow = {
  id,
  ownerKey,
  userId: null,
  inputMode: "json",
  title: "Practice attempt",
  referenceText: "This is a pronunciation practice attempt.",
  pronunciationBand: 7.5,
  fluencyBand: 7,
  wpm: 142,
  inputMetadata: { source: "json-analysis" },
  metrics: {
    summary: { pronunciationBand: 7.5, fluencyBand: 7, wpm: 142 },
  },
  feedback: { summary: "Good control." },
  createdAt: now,
  updatedAt: now,
};

const createPayload = {
  ownerKey,
  inputMode: "json",
  title: "Practice attempt",
  referenceText: "This is a pronunciation practice attempt.",
  inputMetadata: { source: "json-analysis" },
  metrics: {
    summary: { pronunciationBand: 7.5, fluencyBand: 7, wpm: 142 },
  },
  feedback: { summary: "Good control." },
};

const buildService = (rows: SavedAnalysisSessionRow[] = [row]) => {
  const returning = jest.fn().mockResolvedValue(rows);
  const values = jest.fn(() => ({ returning }));
  const insert = jest.fn(() => ({ values }));

  const limit = jest.fn().mockResolvedValue(rows);
  const orderBy = jest.fn().mockResolvedValue(rows);
  const where = jest.fn(() => ({ orderBy, limit }));
  const from = jest.fn(() => ({ where }));
  const select = jest.fn(() => ({ from }));

  const db = { insert, select };
  const databaseProvider = {
    getDatabase: jest.fn(() => db),
  } as unknown as DatabaseProvider;

  return {
    service: new SavedSessionsService(databaseProvider),
    databaseProvider,
    db,
    insert,
    values,
    returning,
    select,
    from,
    where,
    orderBy,
    limit,
  };
};

describe("SavedSessionsService", () => {
  it("validates create payloads before insert", async () => {
    const { service, insert } = buildService();

    await expect(
      service.create({ inputMode: "json", inputMetadata: {}, metrics: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects raw vendor speechAssessment before insert", async () => {
    const { service, insert } = buildService();

    await expect(
      service.create({
        ...createPayload,
        metrics: { nested: { speechAssessment: {} } },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(insert).not.toHaveBeenCalled();
  });

  it("creates a saved session and maps summary fields", async () => {
    const { service, databaseProvider, values } = buildService();

    const result = await service.create(createPayload);

    expect(databaseProvider.getDatabase).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerKey,
        userId: null,
        inputMode: "json",
        pronunciationBand: 7.5,
        fluencyBand: 7,
        wpm: 142,
        inputMetadata: createPayload.inputMetadata,
        metrics: createPayload.metrics,
        feedback: createPayload.feedback,
      }),
    );
    expect(result).toMatchObject({
      contract: "saved-session-create.v1",
      session: {
        id,
        ownerKey,
        userId: null,
        pronunciationBand: 7.5,
        fluencyBand: 7,
        wpm: 142,
        inputMetadata: row.inputMetadata,
        metrics: row.metrics,
      },
    });
  });

  it("ignores impossible denormalized summary metrics", async () => {
    const { service, values } = buildService([
      {
        ...row,
        pronunciationBand: null,
        fluencyBand: null,
        wpm: null,
      },
    ]);

    await service.create({
      ...createPayload,
      metrics: {
        summary: { pronunciationBand: 10, fluencyBand: -1, wpm: 142.5 },
      },
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        pronunciationBand: null,
        fluencyBand: null,
        wpm: null,
      }),
    );
  });

  it("lists sessions scoped by ownerKey and newest first", async () => {
    const { service, where, orderBy } = buildService();

    const result = await service.listByOwnerKey(ownerKey);

    expect(where).toHaveBeenCalledTimes(1);
    expect(orderBy).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      contract: "saved-session-list.v1",
      sessions: [
        {
          id,
          ownerKey,
          pronunciationBand: 7.5,
          fluencyBand: 7,
          wpm: 142,
        },
      ],
    });
  });

  it("rejects missing ownerKey for list", async () => {
    const { service, select } = buildService();

    await expect(service.listByOwnerKey(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(select).not.toHaveBeenCalled();
  });

  it("fetches sessions by id and ownerKey", async () => {
    const { service, where, limit } = buildService();

    const result = await service.getByIdForOwner(id, ownerKey);

    expect(where).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({
      contract: "saved-session-detail.v1",
      session: { id, ownerKey, inputMetadata: row.inputMetadata },
    });
  });

  it("returns NotFoundException for wrong owner or missing row", async () => {
    const { service } = buildService([]);

    await expect(
      service.getByIdForOwner(id, otherOwnerKey),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid fetch params", async () => {
    const { service, select } = buildService();

    await expect(service.getByIdForOwner("not-a-uuid", ownerKey)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(select).not.toHaveBeenCalled();
  });
});
