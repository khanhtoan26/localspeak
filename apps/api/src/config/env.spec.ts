import { validateApiEnv } from "./env";

const validEnv = {
  GEMINI_API_KEY: "test-gemini-key",
};

describe("validateApiEnv", () => {
  it("coerces defaults and accepts required backend variables", () => {
    expect(validateApiEnv(validEnv)).toEqual({
      NODE_ENV: "development",
      PORT: 3001,
      GEMINI_API_KEY: "test-gemini-key",
      GEMINI_MODEL: "gemini-2.0-flash",
    });
  });

  it("fails fast when GEMINI_API_KEY is missing", () => {
    expect(() =>
      validateApiEnv({
        GEMINI_API_KEY: undefined,
      }),
    ).toThrow(/GEMINI_API_KEY is required/);
  });

  it("fails fast when required secrets contain only whitespace", () => {
    expect(() =>
      validateApiEnv({
        GEMINI_API_KEY: "   ",
      }),
    ).toThrow(/GEMINI_API_KEY is required/);
  });

  it("trims surrounding whitespace from GEMINI_API_KEY", () => {
    expect(
      validateApiEnv({
        GEMINI_API_KEY: "  test-gemini-key  ",
      }),
    ).toEqual({
      NODE_ENV: "development",
      PORT: 3001,
      GEMINI_API_KEY: "test-gemini-key",
      GEMINI_MODEL: "gemini-2.0-flash",
    });
  });

  it("accepts custom GEMINI_MODEL", () => {
    expect(
      validateApiEnv({
        GEMINI_API_KEY: "test-key",
        GEMINI_MODEL: "gemini-2.5-flash",
      }),
    ).toEqual({
      NODE_ENV: "development",
      PORT: 3001,
      GEMINI_API_KEY: "test-key",
      GEMINI_MODEL: "gemini-2.5-flash",
    });
  });
});
