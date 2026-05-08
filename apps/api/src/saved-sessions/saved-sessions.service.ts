import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from "@nestjs/common";
import {
  SavedSessionCreateRequestSchema,
  SavedSessionCreateResponseSchema,
  SavedSessionDetailResponseSchema,
  SavedSessionFetchParamsSchema,
  SavedSessionListQuerySchema,
  SavedSessionListResponseSchema,
  type SavedAnalysisSession,
  type SavedSessionCreateRequest,
} from "@localspeak/contracts";
import { and, desc, eq } from "drizzle-orm";
import type { ZodIssue } from "zod";
import { DatabaseProvider } from "../database/database.provider";
import {
  savedAnalysisSessions,
  type SavedAnalysisSessionRow,
} from "../database/schema";

const SAVED_SESSION_MAX_BYTES = 2 * 1024 * 1024;

@Injectable()
export class SavedSessionsService {
  constructor(
    @Inject(DatabaseProvider)
    private readonly databaseProvider: DatabaseProvider,
  ) {}

  async create(body: unknown) {
    this.assertWithinSizeLimit(body);

    const parsed = SavedSessionCreateRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        contract: "saved-session-error.v1",
        message: "Invalid saved-session create payload.",
        issues: toSafeIssues(parsed.error.issues),
      });
    }

    const request = parsed.data;
    const db = this.databaseProvider.getDatabase();
    const [row] = await db
      .insert(savedAnalysisSessions)
      .values({
        ownerKey: request.ownerKey,
        userId: null,
        inputMode: request.inputMode,
        title: request.title ?? null,
        referenceText: request.referenceText ?? null,
        pronunciationBand: extractPronunciationBand(request),
        fluencyBand: extractFluencyBand(request),
        wpm: extractWpm(request),
        inputMetadata: request.inputMetadata,
        metrics: request.metrics,
        feedback: request.feedback ?? null,
      })
      .returning();

    return SavedSessionCreateResponseSchema.parse({
      contract: "saved-session-create.v1",
      session: toDetail(row),
    });
  }

  async listByOwnerKey(ownerKey: unknown) {
    const parsed = SavedSessionListQuerySchema.safeParse({ ownerKey });
    if (!parsed.success) {
      throw new BadRequestException({
        contract: "saved-session-error.v1",
        message: "Invalid saved-session list query.",
        issues: toSafeIssues(parsed.error.issues),
      });
    }

    const db = this.databaseProvider.getDatabase();
    const rows = await db
      .select()
      .from(savedAnalysisSessions)
      .where(eq(savedAnalysisSessions.ownerKey, parsed.data.ownerKey))
      .orderBy(desc(savedAnalysisSessions.createdAt));

    return SavedSessionListResponseSchema.parse({
      contract: "saved-session-list.v1",
      sessions: rows.map(toListItem),
    });
  }

  async getByIdForOwner(id: unknown, ownerKey: unknown) {
    const parsed = SavedSessionFetchParamsSchema.safeParse({ id, ownerKey });
    if (!parsed.success) {
      throw new BadRequestException({
        contract: "saved-session-error.v1",
        message: "Invalid saved-session fetch query.",
        issues: toSafeIssues(parsed.error.issues),
      });
    }

    const db = this.databaseProvider.getDatabase();
    const rows = await db
      .select()
      .from(savedAnalysisSessions)
      .where(
        and(
          eq(savedAnalysisSessions.id, parsed.data.id),
          eq(savedAnalysisSessions.ownerKey, parsed.data.ownerKey),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new NotFoundException({
        contract: "saved-session-error.v1",
        message: "Saved session not found.",
      });
    }

    return SavedSessionDetailResponseSchema.parse({
      contract: "saved-session-detail.v1",
      session: toDetail(row),
    });
  }

  private assertWithinSizeLimit(body: unknown) {
    const serialized = JSON.stringify(body) ?? "";
    const size = Buffer.byteLength(serialized, "utf8");

    if (size > SAVED_SESSION_MAX_BYTES) {
      throw new PayloadTooLargeException({
        contract: "saved-session-error.v1",
        status: "too_large",
        statusCode: 413,
        message: "Saved-session payload exceeds the 2 MB limit.",
      });
    }
  }
}

function toListItem(row: SavedAnalysisSessionRow) {
  return {
    id: row.id,
    ownerKey: row.ownerKey,
    userId: row.userId,
    inputMode: row.inputMode,
    title: row.title,
    referenceText: row.referenceText,
    pronunciationBand: row.pronunciationBand,
    fluencyBand: row.fluencyBand,
    wpm: row.wpm,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function toDetail(row: SavedAnalysisSessionRow): SavedAnalysisSession {
  return {
    ...toListItem(row),
    inputMetadata: row.inputMetadata,
    metrics: row.metrics,
    feedback: row.feedback,
  };
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function extractPronunciationBand(
  request: SavedSessionCreateRequest,
): number | null {
  return (
    numberAt(request.metrics, ["summary", "pronunciationBand"]) ??
    numberAt(request.metrics, ["pronunciation", "band"]) ??
    numberAt(request.feedback, ["pronunciationBand"])
  );
}

function extractFluencyBand(request: SavedSessionCreateRequest): number | null {
  return (
    numberAt(request.metrics, ["summary", "fluencyBand"]) ??
    numberAt(request.metrics, ["fluency", "band"]) ??
    numberAt(request.feedback, ["fluencyBand"])
  );
}

function extractWpm(request: SavedSessionCreateRequest): number | null {
  return (
    numberAt(request.metrics, ["summary", "wpm"]) ??
    numberAt(request.metrics, ["fluency", "wpm"])
  );
}

function numberAt(
  source: Record<string, unknown> | undefined,
  path: string[],
): number | null {
  let current: unknown = source;
  for (const segment of path) {
    if (!isRecord(current)) {
      return null;
    }
    current = current[segment];
  }

  return typeof current === "number" && Number.isFinite(current) ? current : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSafeIssues(issues: ZodIssue[]) {
  return issues.slice(0, 5).map((issue) => {
    if (issue.path.some((segment) => isRawVendorKey(String(segment)))) {
      return {
        ...issue,
        path: ["snapshot"],
        message: "Raw vendor payload fields are not allowed.",
      };
    }

    return issue;
  });
}

function isRawVendorKey(value: string): boolean {
  return (
    value === "speechAssessment" ||
    value === "rawSpeechAssessment" ||
    value === "vendorPayload"
  );
}
