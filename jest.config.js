module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/test/**/*.spec.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/main-lambda.ts"],
  coverageDirectory: "coverage",
};
