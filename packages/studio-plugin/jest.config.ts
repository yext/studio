import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: ["src/**", "!src/types/**"],
  resetMocks: true,
  restoreMocks: true,
};
export default config;
