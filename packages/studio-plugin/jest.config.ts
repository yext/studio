import type { Config } from "jest";

const esModules = ["@yext/sample-component", "csstype"].join("|");

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/types/**"],
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules})`
  ],
  resetMocks: true,
  restoreMocks: true,
};
export default config;
