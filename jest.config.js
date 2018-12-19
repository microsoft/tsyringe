module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "tests/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "types.ts"
  ],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  setupTestFrameworkScriptFile: "<rootDir>/jest.setup.ts",
  testEnvironment: "node",
  testMatch: [
    "**/src/**/__tests__/*.+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
