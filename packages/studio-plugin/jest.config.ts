import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/types/**", "!src/index.ts"],
  resetMocks: true,
  restoreMocks: true,
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  }
};
export default config;
