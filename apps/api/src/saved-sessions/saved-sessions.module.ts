import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { SavedSessionsController } from "./saved-sessions.controller";
import { SavedSessionsService } from "./saved-sessions.service";

@Module({
  imports: [DatabaseModule],
  controllers: [SavedSessionsController],
  providers: [SavedSessionsService],
})
export class SavedSessionsModule {}
