module.exports = {
  rootDir: "..",
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.ts", "tests/**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "types.ts"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/typescript/tsconfig.test.json"
    }
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  setupTestFrameworkScriptFile: "<rootDir>/test/jest.setup.ts",
  testEnvironment: "node",
  testRegex: "src/__tests__/.*\\.[jt]sx?$",
  //testMatch: ["<rootDir>/src/__tests__/*.+(ts|tsx|js)"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
