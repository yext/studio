import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/types/**", "!src/index.ts"],
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: ["node_modules/(?!true-myth)"],
  setupFilesAfterEnv: ["<rootDir>/tests/__setup__/setup-env.ts"],
  moduleNameMapper: {
    "^(.+)\\.js$": "$1",
  },
};
export default config;
