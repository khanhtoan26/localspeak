import { Module } from "@nestjs/common";
import { ContractsModule } from "./contracts/contracts.module";
import { HealthModule } from "./health/health.module";
import { JsonAnalysisModule } from "./json-analysis/json-analysis.module";

@Module({
  imports: [HealthModule, ContractsModule, JsonAnalysisModule],
})
export class AppModule {}
