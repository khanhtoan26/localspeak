import { z } from "zod";

const GEMINI_API_KEY_REQUIRED = "GEMINI_API_KEY is required";
const SUPABASE_SECRET_KEY_REQUIRED = "SUPABASE_SECRET_KEY is required";

const requiredEnv = (message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message),
  );

export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  GEMINI_API_KEY: requiredEnv(GEMINI_API_KEY_REQUIRED),
  SUPABASE_URL: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z
      .string()
      .min(1, "SUPABASE_URL is required")
      .url("SUPABASE_URL must be a URL"),
  ),
  SUPABASE_SECRET_KEY: requiredEnv(SUPABASE_SECRET_KEY_REQUIRED),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function validateApiEnv(config: Record<string, unknown>): ApiEnv {
  return ApiEnvSchema.parse(config);
}
