module.exports = {
  rootDir: "..",
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "types\\.ts",
    "index\\.ts",
    ".+\\.d\\.ts"
  ],
  globals: {
    "ts-jest": {
      tsConfig: "typescript/tsconfig.test.json"
    }
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
