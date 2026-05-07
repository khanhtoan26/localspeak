import { validateApiEnv } from "./env";

const validEnv = {
  GEMINI_API_KEY: "test-gemini-key",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-supabase-secret",
};

describe("validateApiEnv", () => {
  it("coerces defaults and accepts required backend variables", () => {
    expect(validateApiEnv(validEnv)).toEqual({
      NODE_ENV: "development",
      PORT: 3001,
      ...validEnv,
    });
  });

  it("fails fast when GEMINI_API_KEY is missing", () => {
    expect(() =>
      validateApiEnv({
        ...validEnv,
        GEMINI_API_KEY: undefined,
      }),
    ).toThrow(/GEMINI_API_KEY is required/);
  });

  it("fails fast when SUPABASE_URL is invalid", () => {
    expect(() =>
      validateApiEnv({
        ...validEnv,
        SUPABASE_URL: "not-a-url",
      }),
    ).toThrow(/SUPABASE_URL/);
  });

  it("fails fast when SUPABASE_SECRET_KEY is missing", () => {
    expect(() =>
      validateApiEnv({
        ...validEnv,
        SUPABASE_SECRET_KEY: undefined,
      }),
    ).toThrow(/SUPABASE_SECRET_KEY is required/);
  });
});
