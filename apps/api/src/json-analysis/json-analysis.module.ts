import { Module } from "@nestjs/common";
import { JsonAnalysisController } from "./json-analysis.controller";
import { JsonAnalysisService } from "./json-analysis.service";

@Module({
  controllers: [JsonAnalysisController],
  providers: [JsonAnalysisService],
})
export class JsonAnalysisModule {}
