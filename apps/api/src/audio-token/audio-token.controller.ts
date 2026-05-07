import { Body, Controller, Inject, Post, BadRequestException } from "@nestjs/common";
import { TokenRequestSchema, type TokenResponse } from "@localspeak/contracts";
import { AudioTokenService } from "./audio-token.service";

@Controller("api")
export class AudioTokenController {
  constructor(
    @Inject(AudioTokenService)
    private readonly audioTokenService: AudioTokenService,
  ) {}

  @Post("token")
  async createToken(@Body() body: unknown): Promise<TokenResponse> {
    const parsed = TokenRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Reference text is required.",
        issues: parsed.error.issues.slice(0, 3),
      });
    }
    return this.audioTokenService.createToken(parsed.data.referenceText);
  }
}
