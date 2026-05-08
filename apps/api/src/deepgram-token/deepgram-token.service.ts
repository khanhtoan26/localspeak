import { Injectable, InternalServerErrorException } from "@nestjs/common";
import type { DeepgramTokenResponse } from "@localspeak/contracts";

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

    // Return API key directly for WSS auth.
    // In production, use Deepgram's token grant with member:write scoped keys.
    return {
      accessToken: this.apiKey,
      expiresIn: 600,
    };
  }
}
