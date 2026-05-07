import { Module } from "@nestjs/common";
import { AudioTokenController } from "./audio-token.controller";
import { AudioTokenService } from "./audio-token.service";

@Module({
  controllers: [AudioTokenController],
  providers: [AudioTokenService],
})
export class AudioTokenModule {}
