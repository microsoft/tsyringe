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
      tsConfigFile: "tests/tsconfig.json",
      skipBabel: true
    }
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  testEnvironment: "node",
  testRegex: "/tests/.*\\.test\\.tsx?$",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
