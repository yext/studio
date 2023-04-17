import type { Config } from "jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/types/**", "!src/index.ts"],
  resetMocks: true,
  restoreMocks: true,
  transform: {
    // ts-jest does not support dynamic imports with the second argument.
    "getLocalDataMapping.ts": "babel-jest",
    "\\.[jt]sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          ...compilerOptions,
          allowJs: true,
        },
      },
    ],
  },
};
export default config;
