import { z } from "zod";

export const TokenRequestSchema = z.object({
  referenceText: z.string().min(1, "Reference text is required").max(500, "Reference text too long"),
});

export const TokenResponseSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type TokenRequest = z.infer<typeof TokenRequestSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
