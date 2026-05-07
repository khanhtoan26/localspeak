import { Body, Controller, Get, HttpCode, Inject, Post } from "@nestjs/common";
import { JsonAnalysisService } from "./json-analysis.service";

@Controller("json-analysis")
export class JsonAnalysisController {
  constructor(
    @Inject(JsonAnalysisService)
    private readonly jsonAnalysisService: JsonAnalysisService,
  ) {}

  @Get("sample")
  getSample() {
    return this.jsonAnalysisService.getSample();
  }

  @Post("preview")
  @HttpCode(200)
  preview(@Body() body: unknown) {
    return this.jsonAnalysisService.preview(body);
  }

  @Post("analyze")
  @HttpCode(200)
  analyze(@Body() body: unknown) {
    return this.jsonAnalysisService.analyze(body);
  }
}
