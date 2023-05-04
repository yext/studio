import type { Config } from "jest";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/messaging/**", "!src/main.tsx"],
  resetMocks: true,
  restoreMocks: true,
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!react-tooltip|true-myth)"],
  setupFilesAfterEnv: ["<rootDir>/tests/__setup__/setup-env.ts"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
    "\\.svg$": "<rootDir>/tests/__setup__/svgTransformer.cjs",
  },
};
export default config;
