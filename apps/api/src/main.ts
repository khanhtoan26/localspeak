import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { validateApiEnv } from "./config/env";

async function bootstrap() {
  const env = validateApiEnv(process.env);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.useBodyParser("json", { limit: "2mb" });

  await app.listen(env.PORT);
}

void bootstrap();
