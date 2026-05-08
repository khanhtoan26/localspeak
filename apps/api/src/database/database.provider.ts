import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getRequiredDatabaseUrl } from "../config/env";
import * as schema from "./schema";

export type AppDatabase = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseProvider implements OnModuleDestroy {
  private pool?: Pool;
  private db?: AppDatabase;

  getDatabase(): AppDatabase {
    if (this.db) {
      return this.db;
    }

    this.pool = new Pool({
      connectionString: getRequiredDatabaseUrl(),
    });
    this.db = drizzle(this.pool, { schema });

    return this.db;
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
