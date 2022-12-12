import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/types/**"],
  resetMocks: true,
  restoreMocks: true,
};
export default config;
