import { z } from "zod";

export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "GEMINI_API_KEY is required"),
  ),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  DEEPGRAM_API_KEY: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "DEEPGRAM_API_KEY is required"),
  ),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function validateApiEnv(config: Record<string, unknown>): ApiEnv {
  return ApiEnvSchema.parse(config);
}

export function getRequiredDatabaseUrl(
  config: Record<string, unknown> = process.env,
): string {
  const result = z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z
        .string()
        .min(1, "DATABASE_URL is required for saved-session persistence")
        .url("DATABASE_URL must be a valid URL"),
    )
    .safeParse(config.DATABASE_URL);

  if (!result.success) {
    throw new Error("DATABASE_URL is required for saved-session persistence");
  }

  return result.data;
}
