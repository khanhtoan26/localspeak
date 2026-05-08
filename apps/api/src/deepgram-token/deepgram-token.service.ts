import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeepgramClient } from "@deepgram/sdk";
import type { DeepgramTokenResponse } from "@localspeak/contracts";

const DEEPGRAM_STREAMING_TOKEN_TTL_SECONDS = 600;
const SELF_SIGNED_CERT_ERROR_CODE = "SELF_SIGNED_CERT_IN_CHAIN";

function findNestedErrorCode(error: unknown): string | undefined {
  const seen = new Set<unknown>();
  let current = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const record = current as { code?: unknown; cause?: unknown };
    if (typeof record.code === "string") {
      return record.code;
    }
    current = record.cause;
  }

  return undefined;
}

@Injectable()
export class DeepgramTokenService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY!;
  }

  async createToken(): Promise<DeepgramTokenResponse> {
    if (!this.apiKey) {
      throw new InternalServerErrorException({
        message: "DEEPGRAM_API_KEY is not configured.",
      });
    }

    const client = new DeepgramClient({ apiKey: this.apiKey });
    let token: { access_token: string; expires_in?: number };
    try {
      token = await client.auth.v1.tokens.grant({
        ttl_seconds: DEEPGRAM_STREAMING_TOKEN_TTL_SECONDS,
      });
    } catch (error) {
      console.error("Error creating Deepgram streaming token:", error);
      const code = findNestedErrorCode(error);
      const message =
        code === SELF_SIGNED_CERT_ERROR_CODE
          ? "Unable to create Deepgram streaming token because Node does not trust the TLS certificate chain. Configure NODE_EXTRA_CA_CERTS with your proxy/root CA certificate before starting the API."
          : "Unable to create Deepgram streaming token.";

      throw new InternalServerErrorException({
        message,
        code,
      });
    }

    return {
      accessToken: token.access_token,
      expiresIn: token.expires_in ?? DEEPGRAM_STREAMING_TOKEN_TTL_SECONDS,
    };
  }
}
