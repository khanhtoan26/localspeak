import { Body, Controller, Headers, HttpCode, Inject, Post } from "@nestjs/common";
import { GeminiFeedbackService } from "./gemini-feedback.service";

@Controller("gemini-feedback")
export class GeminiFeedbackController {
  constructor(
    @Inject(GeminiFeedbackService)
    private readonly geminiFeedbackService: GeminiFeedbackService,
  ) {}

  @Post()
  @HttpCode(200)
  async getFeedback(
    @Body() body: unknown,
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    const locale = this.extractLocale(acceptLanguage);
    return this.geminiFeedbackService.getFeedback(body, locale);
  }

  private extractLocale(header?: string): "vi" | "en" {
    if (!header) return "vi";
    const primary = header.split(",")[0].trim().toLowerCase();
    if (primary.startsWith("vi")) return "vi";
    return "en";
  }
}
