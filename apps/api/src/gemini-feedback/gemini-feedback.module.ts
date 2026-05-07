import { Module } from "@nestjs/common";
import { GeminiFeedbackController } from "./gemini-feedback.controller";
import { GeminiFeedbackService } from "./gemini-feedback.service";

@Module({
  controllers: [GeminiFeedbackController],
  providers: [GeminiFeedbackService],
})
export class GeminiFeedbackModule {}
