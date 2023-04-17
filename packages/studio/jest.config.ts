import type { Config } from "jest";

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
    // "^.+\\.(t|j)sx?$": "babel-jest",
    "^.+\\.(t|j)sx?$": [
      "@swc/jest", {
        sourceMaps: false,
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      }
    ],
    "\\.svg$": "<rootDir>/tests/__setup__/svgTransformer.cjs",
  },
};
export default config;
