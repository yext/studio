import type { Config } from "jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/messaging/**", "!src/main.tsx"],
  resetMocks: true,
  restoreMocks: true,
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["node_modules/(?!react-tooltip/.*)"],
  setupFilesAfterEnv: ["<rootDir>/tests/__setup__/setup-env.ts"],
  transform: {
    "\\.svg$": "<rootDir>/tests/__setup__/svgTransformer.cjs",
    "^.+\\.m?[tj]sx?$": [
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
