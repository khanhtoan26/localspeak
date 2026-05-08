import { Module } from "@nestjs/common";
import { ContractsModule } from "./contracts/contracts.module";
import { DeepgramTokenModule } from "./deepgram-token/deepgram-token.module";
import { GeminiFeedbackModule } from "./gemini-feedback/gemini-feedback.module";
import { HealthModule } from "./health/health.module";
import { JsonAnalysisModule } from "./json-analysis/json-analysis.module";

@Module({
  imports: [HealthModule, ContractsModule, JsonAnalysisModule, GeminiFeedbackModule, DeepgramTokenModule],
})
export class AppModule {}
