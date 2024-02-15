import type { Config } from 'jest'

const config: Config = {
  //extensionsToTreatAsEsm: ['.ts'],
  // "moduleNameMapper": {
  //   "^fixtures/(.*)$": "<rootDir>/__fixtures__/$1",
  // }
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['node_modules'],
  coverageReporters: ['json-summary', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'ts'],
  preset: 'ts-jest',
  reporters: ['default', 'jest-junit'],
  resolver: 'ts-jest-resolver',
  testMatch: ['**/*.test.ts'],
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      { useESM: true, tsconfig: 'tsconfig.eslint.json' }
    ]
  },
  verbose: true
}

export default config
