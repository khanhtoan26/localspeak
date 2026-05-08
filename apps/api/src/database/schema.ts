import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const savedSessionInputModeEnum = pgEnum("saved_session_input_mode", [
  "json",
  "audio",
]);

export const savedAnalysisSessions = pgTable(
  "saved_analysis_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerKey: varchar("owner_key", { length: 256 }).notNull(),
    userId: uuid("user_id"),
    inputMode: savedSessionInputModeEnum("input_mode").notNull(),
    title: varchar("title", { length: 160 }),
    referenceText: text("reference_text"),
    pronunciationBand: real("pronunciation_band"),
    fluencyBand: real("fluency_band"),
    wpm: integer("wpm"),
    inputMetadata: jsonb("input_metadata")
      .$type<Record<string, unknown>>()
      .notNull(),
    metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull(),
    feedback: jsonb("feedback").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("saved_analysis_sessions_owner_key_created_at_idx").on(
      table.ownerKey,
      table.createdAt,
    ),
    index("saved_analysis_sessions_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export type SavedAnalysisSessionRow =
  typeof savedAnalysisSessions.$inferSelect;
export type NewSavedAnalysisSessionRow =
  typeof savedAnalysisSessions.$inferInsert;
