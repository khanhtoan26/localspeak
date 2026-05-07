import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["ts", "js", "json"],
  rootDir: ".",
  testEnvironment: "node",
  testRegex: ".*\\.(spec|e2e-spec)\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
};

export default config;
