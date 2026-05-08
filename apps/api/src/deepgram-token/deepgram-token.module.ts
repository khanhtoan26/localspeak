import { Module } from "@nestjs/common";
import { DeepgramTokenController } from "./deepgram-token.controller";
import { DeepgramTokenService } from "./deepgram-token.service";

@Module({
  controllers: [DeepgramTokenController],
  providers: [DeepgramTokenService],
})
export class DeepgramTokenModule {}
