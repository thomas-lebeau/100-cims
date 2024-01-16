import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  collectCoverage: false,
  coverageProvider: "v8",
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  reporters: ["default", "github-actions"],
};

export default createJestConfig(config);
