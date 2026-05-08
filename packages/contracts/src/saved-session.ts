import { z } from "zod";

const RAW_VENDOR_KEYS = new Set([
  "speechAssessment",
  "rawSpeechAssessment",
  "vendorPayload",
]);

export const SavedSessionInputModeSchema = z.enum(["json", "audio"]);
export const SavedSessionOwnerKeySchema = z.string().min(16).max(256);

export const SavedSessionJsonSnapshotSchema = z
  .record(z.string(), z.unknown())
  .superRefine((value, context) => {
    addRawVendorKeyIssues(value, context);
  });

const IsoTimestampSchema = z.string().datetime({ offset: true });
const IeltsBandSchema = z.number().min(0).max(9);
const WpmSchema = z.number().int().nonnegative();

export const SavedSessionCreateRequestSchema = z.strictObject({
  ownerKey: SavedSessionOwnerKeySchema,
  inputMode: SavedSessionInputModeSchema,
  title: z.string().trim().min(1).max(160).optional(),
  referenceText: z.string().trim().max(5000).optional(),
  inputMetadata: SavedSessionJsonSnapshotSchema,
  metrics: SavedSessionJsonSnapshotSchema,
  feedback: SavedSessionJsonSnapshotSchema.optional(),
});

export const SavedSessionListQuerySchema = z.strictObject({
  ownerKey: SavedSessionOwnerKeySchema,
});

export const SavedSessionFetchParamsSchema = z.strictObject({
  id: z.string().uuid(),
  ownerKey: SavedSessionOwnerKeySchema,
});

export const SavedSessionListItemSchema = z.strictObject({
  id: z.string().uuid(),
  ownerKey: SavedSessionOwnerKeySchema,
  userId: z.string().uuid().nullable(),
  inputMode: SavedSessionInputModeSchema,
  title: z.string().nullable(),
  referenceText: z.string().nullable(),
  pronunciationBand: IeltsBandSchema.nullable(),
  fluencyBand: IeltsBandSchema.nullable(),
  wpm: WpmSchema.nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const SavedSessionListResponseSchema = z.strictObject({
  contract: z.literal("saved-session-list.v1"),
  sessions: z.array(SavedSessionListItemSchema),
});

export const SavedAnalysisSessionSchema = SavedSessionListItemSchema.extend({
  inputMetadata: SavedSessionJsonSnapshotSchema,
  metrics: SavedSessionJsonSnapshotSchema,
  feedback: SavedSessionJsonSnapshotSchema.nullable(),
});

export const SavedSessionCreateResponseSchema = z.strictObject({
  contract: z.literal("saved-session-create.v1"),
  session: SavedAnalysisSessionSchema,
});

export const SavedSessionDetailResponseSchema = z.strictObject({
  contract: z.literal("saved-session-detail.v1"),
  session: SavedAnalysisSessionSchema,
});

export type SavedSessionInputMode = z.infer<typeof SavedSessionInputModeSchema>;
export type SavedSessionOwnerKey = z.infer<typeof SavedSessionOwnerKeySchema>;
export type SavedSessionJsonSnapshot = z.infer<
  typeof SavedSessionJsonSnapshotSchema
>;
export type SavedSessionCreateRequest = z.infer<
  typeof SavedSessionCreateRequestSchema
>;
export type SavedSessionListQuery = z.infer<typeof SavedSessionListQuerySchema>;
export type SavedSessionFetchParams = z.infer<
  typeof SavedSessionFetchParamsSchema
>;
export type SavedSessionListItem = z.infer<typeof SavedSessionListItemSchema>;
export type SavedSessionListResponse = z.infer<
  typeof SavedSessionListResponseSchema
>;
export type SavedAnalysisSession = z.infer<typeof SavedAnalysisSessionSchema>;
export type SavedSessionCreateResponse = z.infer<
  typeof SavedSessionCreateResponseSchema
>;
export type SavedSessionDetailResponse = z.infer<
  typeof SavedSessionDetailResponseSchema
>;

function addRawVendorKeyIssues(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      addRawVendorKeyIssues(item, context, [...path, index]),
    );
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];

    if (RAW_VENDOR_KEYS.has(key)) {
      context.addIssue({
        code: "custom",
        path: nextPath,
        message: `Do not store raw vendor payload field: ${key}.`,
      });
    }

    addRawVendorKeyIssues(child, context, nextPath);
  }
}
