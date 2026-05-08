import { z } from "zod";

export const DeepgramTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

export type DeepgramTokenResponse = z.infer<typeof DeepgramTokenResponseSchema>;

