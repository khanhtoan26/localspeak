import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { SavedSessionsService } from "./saved-sessions.service";

@Controller("saved-sessions")
export class SavedSessionsController {
  constructor(
    @Inject(SavedSessionsService)
    private readonly savedSessionsService: SavedSessionsService,
  ) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: unknown) {
    return this.savedSessionsService.create(body);
  }

  @Get()
  list(@Headers("x-localspeak-owner-key") ownerKey: unknown) {
    return this.savedSessionsService.listByOwnerKey(ownerKey);
  }

  @Get(":id")
  get(
    @Param("id") id: unknown,
    @Headers("x-localspeak-owner-key") ownerKey: unknown,
  ) {
    return this.savedSessionsService.getByIdForOwner(id, ownerKey);
  }
}
