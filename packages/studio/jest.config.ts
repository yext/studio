import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**"],
  resetMocks: true,
  restoreMocks: true,
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!react-tooltip/.*)"],
  setupFilesAfterEnv: ["<rootDir>/tests/__setup__/setup-env.ts"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
    "\\.svg$": "<rootDir>/tests/__setup__/svgTransformer.js",
  },
};
export default config;
