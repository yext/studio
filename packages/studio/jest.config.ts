import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**"],
  resetMocks: true,
  restoreMocks: true,
};
export default config;
