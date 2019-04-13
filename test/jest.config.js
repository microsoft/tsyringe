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
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
