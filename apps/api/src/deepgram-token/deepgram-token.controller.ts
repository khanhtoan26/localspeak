import { Controller, Get, Inject } from "@nestjs/common";
import { DeepgramTokenService } from "./deepgram-token.service";
import type { DeepgramTokenResponse } from "@localspeak/contracts";

@Controller("deepgram-token")
export class DeepgramTokenController {
  constructor(
    @Inject(DeepgramTokenService)
    private readonly deepgramTokenService: DeepgramTokenService,
  ) {}

  @Get()
  async getToken(): Promise<DeepgramTokenResponse> {
    return this.deepgramTokenService.createToken();
  }
}
