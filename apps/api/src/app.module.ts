import { Module } from "@nestjs/common";
import { AudioTokenModule } from "./audio-token/audio-token.module";
import { ContractsModule } from "./contracts/contracts.module";
import { GeminiFeedbackModule } from "./gemini-feedback/gemini-feedback.module";
import { HealthModule } from "./health/health.module";
import { JsonAnalysisModule } from "./json-analysis/json-analysis.module";

@Module({
  imports: [HealthModule, ContractsModule, JsonAnalysisModule, GeminiFeedbackModule, AudioTokenModule],
})
export class AppModule {}
