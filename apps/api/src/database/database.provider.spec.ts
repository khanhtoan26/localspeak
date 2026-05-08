import { DatabaseProvider } from "./database.provider";

describe("DatabaseProvider", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("does not require DATABASE_URL until a database is requested", () => {
    delete process.env.DATABASE_URL;

    expect(() => new DatabaseProvider()).not.toThrow();
  });

  it("fails loudly when DATABASE_URL is missing on persistence access", () => {
    delete process.env.DATABASE_URL;
    const provider = new DatabaseProvider();

    expect(() => provider.getDatabase()).toThrow(
      /DATABASE_URL is required for saved-session persistence/,
    );
  });
});
