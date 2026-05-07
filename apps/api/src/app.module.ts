import { Module } from "@nestjs/common";
import { ContractsModule } from "./contracts/contracts.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, ContractsModule],
})
export class AppModule {}
